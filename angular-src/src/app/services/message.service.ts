import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpResponse} from "@angular/common/http";
import {User} from "../models/user/base/user";
import {HpCookieService} from "./hp-cookie.service";
import {ApiRequestService} from "./api-request.service";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private conversationOtherPersonId: string;

  constructor(private apiRequestService: ApiRequestService, private cookieService: HpCookieService) {
    this.resetSelectedConversation();
  }

  public resetSelectedConversation(): void {
    this.conversationOtherPersonId = '';
  }

  public setSelectedConversation(otherPersonId: string): void {
    this.conversationOtherPersonId = otherPersonId;
  }

  public getSelectedConversation(): string {
    return this.conversationOtherPersonId;
  }

  public async getAllConversations(): Promise<HttpResponse<any>> {
    if (environment.angularServe) {
      const conversations = [];

      const customer = {
        _id: 'loggedInUser',
        __t: 'customer',
        firstName: 'anthony',
        lastName: 'house',
      };

      for (let i = 0; i < 12; ++i) {
        const contractor = {
          _id: i === 1 ? 'notrandid' : Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1),
          __t: 'contractor',
          firstName: Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1),
          lastName: Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1),
          organizationName: Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1),
          lastSeenOnline: i < 2 ? new Date() : new Date(0),
          picture: i === 1 ? 'https://us-east-1.linodeobjects.com/homepainter-images/592e7250-0676-4b8b-95be-bc2bdd24ac04.jpg' : ''
        };

        const contractorMessage = {
          from: contractor._id,
          to: customer._id,
          message: 'hello world',
          createdAt: i < 2 ? new Date() : new Date(0),
          toReadAt: i >= 2 ? new Date() : undefined
        };
        const customerMessage = {
          from: customer._id,
          to: contractor._id,
          message: 'hello world back [view project](http://localhost:4200/view-project/5f9aefdae4d3c02f841b36ee)',
          createdAt: i < 2 ? new Date() : new Date(0),
          fromReadAt: new Date(),
          viewTime: false,
        };
        const customerMessage2 = {
          from: customer._id,
          to: contractor._id,
          message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          createdAt: i < 2 ? new Date() : new Date(0),
          fromReadAt: new Date(),
          viewTime: true,
        };

        conversations.push({
          you: customer,
          otherPerson: contractor,
          messages: [contractorMessage, customerMessage, customerMessage2]
        });
      }
      await (()=>new Promise((resolve) => setTimeout(resolve, 200)))();
      return new HttpResponse({status: 200, body: conversations});
    }
    else {
      if (this.cookieService.isGuest())
        return new HttpResponse({status: 200, body: []});

      return await this.apiRequestService.get('/api/retrieve-all-messages');
    }
  }

  public async sendMessage(to: User, message: string): Promise<HttpResponse<any>> {
    if (environment.angularServe)
      await (()=>new Promise(resolve => {setTimeout(resolve, 500)}))();

    return await this.apiRequestService.post('/api/send-message', { to: to._id, message });
  }
}
