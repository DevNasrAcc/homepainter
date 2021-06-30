import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {environment} from "../../environments/environment";
import {io} from "socket.io-client";
import {isPlatformServer} from "@angular/common";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {Conversation} from "../models/conversation/conversation";
import {Observable, Subject} from "rxjs";
import {HpCookieService} from "./hp-cookie.service";
import {LocalStorageService} from "./local-storage.service";
import {Contractor} from "../models/user/contractor";
import {Customer} from "../models/user/customer";

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {
  private socket: any;

  private updateUserOnlineSource: Subject<Date>;
  private newMessageSource: Subject<any>;
  private otherUserTypingSource: Subject<boolean>;

  public updateUserOnlineEvent$: Observable<Date>;
  public newMessageEvent$: Observable<any>;
  public otherUserTypingEvent$: Observable<boolean>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private cookieService: HpCookieService,
              private materialize: Angular2MaterializeV1Service, private localStorageService: LocalStorageService) {
    this.updateUserOnlineSource = new Subject<Date>();
    this.newMessageSource = new Subject<any>();
    this.otherUserTypingSource = new Subject<boolean>();
    this.updateUserOnlineEvent$ = this.updateUserOnlineSource.asObservable();
    this.newMessageEvent$ = this.newMessageSource.asObservable();
    this.otherUserTypingEvent$ = this.otherUserTypingSource.asObservable();
  }

  private emitMessage(event, body?: {}) {
    if (!this.socket) return;

    this.socket.emit(event, {
      headers: { 'XSRF-TOKEN': this.cookieService.getXsrfToken() },
      body: body
    });
  }

  private onUpdateUserOnlineStatus(rawUser: any) {
    const user = this.cookieService.isContractor()
      ? this.localStorageService.getContractor()
      : this.localStorageService.getCustomer();

    if (user._id === rawUser._id) {
      user.updateLastSeenOnline(rawUser.lastSeenOnline);
      this.cookieService.isContractor()
        ? this.localStorageService.saveContractor(<Contractor>user)
        : this.localStorageService.saveCustomer(<Customer>user);
    }

    this.updateUserOnlineSource.next(rawUser);
  }

  public connect() {
    if (isPlatformServer(this.platformId) || environment.angularServe || this.cookieService.isGuest() || this.socket) {
      return;
    }
    this.socket = io();

    this.socket.on('error', (res) => {
      console.dir(res);
      this.materialize.toast({ html: JSON.stringify(res), displayLength: 6000 });
    });
    this.socket.on('update_user_online_status', (res) => { this.onUpdateUserOnlineStatus(res.body) });
    this.socket.on('new_message', (res) => { this.newMessageSource.next(res.body) });
    this.socket.on('user_typing', (res) => { this.otherUserTypingSource.next(res.body) });

    this.updateOnlineStatus();
  }

  public disconnect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  public markAllAsRead(conversation: Conversation) {
    this.emitMessage('mark_messages_as_read', {messages: conversation.messages});

    for (const message of conversation.messages) {
      message.markAsRead(conversation.you);
    }
  }

  public updateOnlineStatus() {
    this.emitMessage('update_user_online_status');
  }

  public sendMessage(to: string, message: string) {
    this.emitMessage('send_message', {to, message});
  }

  public startTyping(to: string) {
    this.emitMessage('user_start_typing', { to });
  }

  public stopTyping(to: string) {
    this.emitMessage('user_stop_typing', { to });
  }
}
