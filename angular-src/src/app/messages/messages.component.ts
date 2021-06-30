import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {Conversation} from "../models/conversation/conversation";
import {Message} from "../models/conversation/message";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LocalStorageService} from "../services/local-storage.service";
import {User} from "../models/user/base/user";
import {isPlatformBrowser, isPlatformServer} from "@angular/common";
import {Emoji, EmojiData} from "@ctrl/ngx-emoji-mart/ngx-emoji";
import {ImageFile} from "../models/imageFile";
import {GlobalImageService} from "../services/global-image.service";
import {IAutocomplete} from "angular2-materialize-v1/lib/IInstance";
import {SocketIoService} from "../services/socket.io.service";
import {Subject} from "rxjs";
import {BannerService} from "../libraries/banner/banner.service";
import {MessageService} from "../services/message.service";
import {takeUntil} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {HpCookieService} from "../services/hp-cookie.service";
import {ApiRequestService} from "../services/api-request.service";
import {ActivatedRoute, Router} from "@angular/router";
import {RouterExtService} from "../services/router-ext.service";
import {ImageViewerService} from "../services/image-viewer.service";
import {ResponsiveService} from "../services/responsive.service";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.less']
})
export class MessagesComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('messageHistoryContainer') private messageHistoryContainer: ElementRef;
  @ViewChild('tagFaces') private tagFaces: ElementRef;
  @ViewChild('messageTextArea') private messageTextArea: ElementRef;

  private readonly homepainterSystemId = 'homepainterSystem';
  private readonly scrollToBottomIntervalId: number;
  private readonly updateAllOnlineStatusIntervalId: number;
  private userTypingTimeoutId: number;
  private autocompleteInstance: IAutocomplete;
  private shouldScrollToBottom: boolean;
  private lastSeenActive: number;
  private ngUnsubscribe: Subject<boolean>;
  private resp500: any;
  public selectedView: 'all-conversations' | 'single-conversation';
  public user: User;
  public conversations: Array<Conversation>;
  public selectedConversation: Conversation;
  public emojis: {open: boolean, top: string, left: string, lazyLoadedYet: boolean};
  public displayShake: boolean;
  public uploadInProgress: boolean;
  public notUploadedFiles: Array<ImageFile>;
  public messageForm: FormGroup;
  public showNewMessagesChip: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private materialize: Angular2MaterializeV1Service,
              private formBuilder: FormBuilder, private localStorageService: LocalStorageService,
              private cookieService: HpCookieService, private globalImageService: GlobalImageService,
              private apiRequestService: ApiRequestService, private socketIoService: SocketIoService,
              private bannerService: BannerService, private messageService: MessageService, private router: Router,
              private routerExtService: RouterExtService, private activatedRoute: ActivatedRoute,
              private imageViewerService: ImageViewerService, public responsiveService: ResponsiveService) {
    this.scrollToBottomIntervalId = isPlatformBrowser(this.platformId) ? window.setInterval(() => {this.scrollToBottom()}, 100) : undefined;
    this.updateAllOnlineStatusIntervalId = isPlatformBrowser(this.platformId) ? window.setInterval(() => {this.updateAllOnlineStatus()}, 1000 * 60) : undefined;
    this.shouldScrollToBottom = true;
    this.lastSeenActive = new Date().getTime();
    this.ngUnsubscribe = new Subject<boolean>();
    this.selectedView = 'all-conversations';
    this.user = cookieService.isContractor() ? localStorageService.getContractor() : localStorageService.getCustomer();
    this.conversations = [new Conversation({
      you: this.user,
      otherPerson: {
        _id: this.homepainterSystemId,
        firstName: 'Welcome to homepainter',
        lastName: ' '
      },
      messages: [{
        from: this.homepainterSystemId,
        to: this.user._id,
        message: 'Hello, before you can message and receive quotes from qualified painters near you, you will need to' +
          ' start your project. It only takes a few minutes to get started. [start project](/project/details)',
        createdAt: new Date(),
        viewTime: true
      }]
    })];
    this.selectedConversation = this.conversations[0];
    this.emojis = { open: false, top: '0px', left: '0px', lazyLoadedYet: false };
    this.displayShake = false;
    this.uploadInProgress = false;
    this.notUploadedFiles = [];
    this.messageForm = this.formBuilder.group({
      hiddenFileInput: ['', []],
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
    this.showNewMessagesChip = false;

    // set up socket io listeners
    this.socketIoService.updateUserOnlineEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((rawUser: any) => {this.onUpdateUserOnlineStatus(rawUser)});
    this.socketIoService.newMessageEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((rawMessage: any) => {this.onNewMessage(rawMessage)});
    this.socketIoService.otherUserTypingEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((event: any) => {this.onOtherUserTypingEvent(event)});
    this.responsiveService.screenResize$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {this.setEmojiMartPosition()});
  }

  public ngOnInit(): void {}

  public async ngAfterViewInit() {
    // check if there is a query param for selected conversation
    if (this.activatedRoute.snapshot.queryParams.selectedConversation) {
      this.messageService.setSelectedConversation(this.activatedRoute.snapshot.queryParams.selectedConversation);

      // if not logged in and query param for selected conversation, have user log in
      if (this.cookieService.isGuest()) {
        this.routerExtService.setLoginRedirectUrl('/messages');
        return this.router.navigateByUrl('/login');
      }
    }

    this.resp500 = this.bannerService.init('#resp500');
    this.autocompleteInstance = <IAutocomplete>this.materialize.initAutocomplete('#search-box', {
      onAutocomplete: (selectedOption: string) => {
        const conversation = this.conversations.find(c => c.otherPerson.displayName === selectedOption);
        if (conversation) {
          this.setSelectedConversation(conversation);
          (<HTMLInputElement>this.autocompleteInstance.el).value = ''
        }
      }
    });
    this.materialize.initChips(".chips");

    const conversations = await this.initConversations();
    if (conversations.length > 0) {
      this.conversations.splice(0, 1, ...conversations);
      if (!this.responsiveService.isMobileOrTablet()) {
        const sc = this.messageService.getSelectedConversation();
        let conversationIndex = this.conversations.findIndex(c => c.otherPerson._id === sc);
        if (conversationIndex === -1) conversationIndex = 0;
        this.setSelectedConversation(this.conversations[conversationIndex]);
        this.messageService.resetSelectedConversation();
      }
    }

    let data: any = {};
    for (let conversation of this.conversations) {
      data[conversation.otherPerson.displayName] = conversation.otherPerson.picture;
    }
    if (isPlatformBrowser(this.platformId)) {
      this.autocompleteInstance.updateData(data);
    }
  }

  public ngOnDestroy() {
    this.onStopTyping();
    if (this.scrollToBottomIntervalId) {
      window.clearInterval(this.scrollToBottomIntervalId);
    }
    if (this.updateAllOnlineStatusIntervalId) {
      window.clearInterval(this.updateAllOnlineStatusIntervalId);
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('paste', ['$event'])
  private onPaste(evt) {
    if (evt.clipboardData.files.length > 0) {
      this.uploadPhotos(evt.clipboardData.files);
    }
  }

  @HostListener('mousemove')
  @HostListener('mousedown')
  @HostListener('keypress')
  @HostListener('touchmove')
  @HostListener('document:visibilitychange')
  private async onUserActivity() {
    const now = new Date().getTime();
    if (isPlatformBrowser(this.platformId) && now - this.lastSeenActive >= (1000 * 60 * 5)) {
      window.location.reload();
    }
    this.lastSeenActive = now;
  }

  private async initConversations(): Promise<Array<Conversation>> {
    const resp = await this.messageService.getAllConversations();

    switch (resp.status) {
      case 200:
        const conversations = [];
        for (let conversation of resp.body) {
          conversations.push(new Conversation(conversation));
        }
        if (conversations.length === 0 && this.cookieService.isLoggedIn()) {
          conversations.push(new Conversation({
            you: this.user,
            otherPerson: {
              _id: this.homepainterSystemId,
              firstName: 'Homepainter Systems',
              lastName: ' '
            },
            messages: [{
              from: this.homepainterSystemId,
              to: this.user._id,
              message: 'You do not have any messages at this time.',
              createdAt: new Date(),
              viewTime: true
            }]
          }));
        }
        return conversations;
      default:
        this.closeAllBanners();
        this.resp500.open();
        return [];
    }
  }

  private scrollToBottom(): void {
    if (!this.shouldScrollToBottom) return;
    this.messageHistoryContainer.nativeElement.scrollTop = this.messageHistoryContainer.nativeElement.scrollHeight;
  }

  private setEmojiMartPosition(): void {
    if (isPlatformBrowser(this.platformId)) {
      const boundingRect = this.tagFaces.nativeElement.getBoundingClientRect();
      const top = boundingRect.top - 447;
      const left = window.innerWidth <= 600
        ? (window.innerWidth - 338) / 2
        : boundingRect.left - 304;
      this.emojis.top = top+'px';
      this.emojis.left = left+'px';
    }
  }

  private updateAllOnlineStatus(): void {
    for (let conversation of this.conversations) {
      conversation.otherPerson.updateLastSeenOnline(conversation.otherPerson.lastSeenOnline);
    }
  }

  private onUpdateUserOnlineStatus(rawUser: any) {
    const conversation = this.conversations.find(c => c.otherPerson._id === rawUser._id);
    if (!conversation) return;
    conversation.otherPerson.updateLastSeenOnline(rawUser.lastSeenOnline);
  }

  private onNewMessage(rawMessage: any) {
    // has not had any messages yet. remove homepainter notice that says they have no messages
    if (this.conversations.length === 1 && this.conversations[0].otherPerson._id === this.homepainterSystemId) {
      this.selectedView = 'all-conversations';
      this.conversations.splice(0, 1);
    }

    const to = new User(rawMessage.to);
    const from = new User(rawMessage.from);
    rawMessage.to = to._id;
    rawMessage.from = from._id;

    const message: Message = new Message(rawMessage);

    const otherPersonId = message.isFromUser(this.user) ? message.to : message.from;
    const conversation = this.conversations.find(c => c.otherPerson._id === otherPersonId);
    let isConversationOpen = false;
    const shouldScrollToBottom = this.shouldScrollToBottom;

    if (conversation) {
      isConversationOpen = this.selectedConversation.equals(conversation);
      conversation.messages.push(message);
      conversation.messages[conversation.messages.length - 2].viewTime = false;
      conversation.messages[conversation.messages.length - 1].viewTime = true;
    }
    else {
      this.conversations.splice(0, 0, new Conversation({
        you: message.isFromUser(this.user) ? from : to,
        otherPerson: message.isFromUser(this.user) ? to : from,
        messages: [message]
      }));
    }

    // if not on mobile and the new conversation is not open and conversations is only one long, then we have removed
    // the old homepainter no messages notice. We need to open the new conversation on desktop.
    if (!this.responsiveService.isMobileOrTablet() && !isConversationOpen && this.conversations.length === 1) {
      this.setSelectedConversation(this.conversations[0]);
    }

    if (isConversationOpen) {
      this.socketIoService.markAllAsRead(conversation);

      if (shouldScrollToBottom) {
        // when hiding the time, it takes .3 seconds to transition. This can cause the window to not scroll properly.
        // set a timeout of .301 seconds to again scroll to the bottom. Do it three times just to make it more smooth
        window.setTimeout(()=>{this.shouldScrollToBottom = true}, 100);
        window.setTimeout(()=>{this.shouldScrollToBottom = true}, 200);
        window.setTimeout(()=>{this.shouldScrollToBottom = true}, 301);
      }
      else {
        this.showNewMessagesChip = true;
      }
    }
  }

  private onOtherUserTypingEvent(event: any) {
    const {otherUserId, typing} = event;
    const conversation = this.conversations.find(c => c.otherPerson._id === otherUserId);
    conversation.otherPersonTyping = typing;
  }

  private preventDefault(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  private closeAllBanners(): void {
    if (isPlatformServer(this.platformId)) return;
    if (this.resp500.isOpen) this.resp500.close();
  }

  public setSelectedConversation(conversation: Conversation) {
    this.selectedView = 'single-conversation';
    this.selectedConversation = conversation;
    this.shouldScrollToBottom = true;

    this.messageService.setSelectedConversation(conversation.otherPerson._id);

    // don't try to mark a system message as read
    if (this.selectedConversation.otherPerson._id !== this.homepainterSystemId) {
      this.socketIoService.markAllAsRead(conversation);
    }
  }

  public onMessageContainerScroll(): void {
    const scrollHeight = this.messageHistoryContainer.nativeElement.scrollHeight;
    const scrollTop = this.messageHistoryContainer.nativeElement.scrollTop;
    const clientHeight = this.messageHistoryContainer.nativeElement.clientHeight;
    this.shouldScrollToBottom = scrollHeight - scrollTop === clientHeight;
    // if user has hit the bottom make sure to remove showNewMessagesChip
    if (this.shouldScrollToBottom) {
      this.showNewMessagesChip = false;
    }
  }

  public getDateFormat(date: Date): string {
    const now = new Date();
    return (now.getFullYear() + now.getMonth()) - (date.getFullYear() + date.getMonth()) < 1
      ? 'shortTime'
      : 'shortDate';
  }

  public getTopLevelInfo(message: Message, what: string): string {
    const user = message.from === this.selectedConversation.otherPerson._id
      ? this.selectedConversation.otherPerson
      : this.selectedConversation.you;

    switch (what) {
      case 'picture':
        return user.picture;
      case 'displayName':
        return user.displayName;
      case 'name':
        return user.firstName + (user.lastName ? ' ' + user.lastName.charAt(0) : '');
    }
  }

  public openImage(image: HTMLImageElement): void {
    const imageFile = new ImageFile({
      url: image.src,
      originalName: image.src.substr(image.src.lastIndexOf('/') + 1, image.src.length),
    });
    this.imageViewerService.openImageViewer([imageFile], 0);
  }

  public openCloseEmojiMart() {
    this.emojis.lazyLoadedYet = true;
    this.setEmojiMartPosition();
    this.emojis.open = !this.emojis.open;
  }

  public onSelectEmoji(emoji: Emoji) {
    const emojiData = <EmojiData>emoji.emoji;
    const selectionStart = this.messageTextArea.nativeElement.selectionStart;
    const selectionEnd = this.messageTextArea.nativeElement.selectionEnd;
    let value = this.messageForm.get('message').value || '';
    value = value.substring(0, selectionStart) + emojiData.native + value.substring(selectionEnd, value.length);
    this.messageForm.get('message').setValue(value);
    this.emojis.open = false;
  }

  public onDragOver(evt) {
    this.preventDefault(evt);

    if (!this.displayShake) {
      this.displayShake = true;
    }
  }

  public onDragLeave(evt) {
    this.preventDefault(evt);

    if (this.displayShake) {
      this.displayShake = false;
    }
  }

  public onDrop(evt) {
    this.preventDefault(evt);
    this.displayShake = false;
    this.uploadPhotos(evt.dataTransfer.files);
  }

  public getTotalUploaded() {
    const mapReduce = this.notUploadedFiles
      .map(e => e.progress)
      .reduce((acc, val) => acc + val, 0);
    return mapReduce / this.notUploadedFiles.length;
  }

  public onStartTyping() {
    if (this.selectedConversation.otherPerson._id === this.homepainterSystemId)
      return;

    if (this.userTypingTimeoutId) {
      clearTimeout(this.userTypingTimeoutId);
    } else {
      this.socketIoService.startTyping(this.selectedConversation.otherPerson._id);
    }

    this.userTypingTimeoutId = window.setTimeout(() => {this.onStopTyping()}, 2000);
  }

  public onStopTyping() {
    if (!this.userTypingTimeoutId) return;
    clearTimeout(this.userTypingTimeoutId);
    this.userTypingTimeoutId = undefined;
    this.socketIoService.stopTyping(this.selectedConversation.otherPerson._id);
  }

  public onClickSeeNewMessages(evt) {
    this.preventDefault(evt);
    this.shouldScrollToBottom = true;
    this.showNewMessagesChip = false;
  }

  public async uploadPhotos(files: FileList) {
    if (!files || files.length === 0) return;

    if (files.length > 4) {
      this.materialize.toast({html: 'Only 4 photos can be uploaded at once.', displayLength: 4000});
      this.messageForm.get('hiddenFileInput').reset();
      return;
    }

    const uploadedFiles: Array<ImageFile> = [];
    this.notUploadedFiles = await this.globalImageService.convertToLocalURL(files);
    if (!this.notUploadedFiles) return;

    this.uploadInProgress = true;
    for (let i = 0; i < files.length; ++i) {
      this.notUploadedFiles[i].uploading = true;
      this.notUploadedFiles[i].progress = 0;
      try {
        uploadedFiles.push(await this.globalImageService.uploadPhoto(files[i], this.notUploadedFiles[i]));
      } catch (e) {
        this.materialize.toast({
          html: `<span>${files[i].name} failed to upload.</span><button class="btn-flat toast-action" onclick="M.Toast.dismissAll();">dismiss</button>`,
          displayLength: 6000
        });
      }
      this.notUploadedFiles[i].uploading = false;
      this.notUploadedFiles[i].uploaded = true;
    }

    this.uploadInProgress = false;
    this.notUploadedFiles = [];
    this.messageForm.get('hiddenFileInput').reset();
    await this.sendMessage(uploadedFiles.map(e => e.url).join(' '))
  }

  public async sendMessage(message?: string): Promise<void> {
    // this function can be triggered by form submission or upload files
    // the parameter will be undefined if send by form submission and a string if sent by upload files
    // return if sent by form and not valid, or to homepainter system
    if (this.selectedConversation.otherPerson._id === this.homepainterSystemId) {
      this.messageForm.reset();
      return;
    }

    if (!message && (this.messageForm.invalid || !this.messageForm.value.message)) {
      return;
    }

    let value = message || this.messageForm.value.message;
    if (value.charAt(value.length - 1) === '\n') {
      value = value.substr(0, value.length - 1);
      if (!value) return;
    }

    this.onStopTyping();
    this.socketIoService.sendMessage(this.selectedConversation.otherPerson._id, value);
    if (!message) this.messageForm.reset();

    if (environment.angularServe) {
      this.onNewMessage({
        from: this.user,
        to: this.selectedConversation.otherPerson,
        fromReadAt: new Date(),
        message: value,
        createdAt: new Date()
      });
    }
  }
}
