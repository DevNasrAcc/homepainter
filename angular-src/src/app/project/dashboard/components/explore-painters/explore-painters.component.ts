import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {Contractor} from '../../../../models/user/contractor';
import {environment} from '../../../../../environments/environment';
import {Angular2MaterializeV1Service} from 'angular2-materialize-v1';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Proposal} from '../../../../models/project/proposal/proposal';
import {Project} from '../../../../models/project/project';
import {Customer} from '../../../../models/user/customer';
import {ProjectService} from '../../../../models/user/project.service';
import {QueryParameterLoaderService} from '../../services/query-parameter-loader.service';
import {IModal} from 'angular2-materialize-v1/lib/IInstance';
import {MessageService} from '../../../../services/message.service';
import {Conversation} from '../../../../models/conversation/conversation';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Message} from '../../../../models/conversation/message';
import {SocketIoService} from '../../../../services/socket.io.service';
import {User} from '../../../../models/user/base/user';
import {ApiRequestService} from '../../../../services/api-request.service';
import {ResponsiveService} from '../../../../services/responsive.service';
import {ngServeData} from "../../../../../environments/ngServeData";

@Component({
  selector: 'app-explore-painters',
  templateUrl: './explore-painters.component.html',
  styleUrls: ['./explore-painters.component.less']
})
export class ExplorePaintersComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('messageToPainter') private messageToPainter: ElementRef;
  private sendMessageModal: IModal;
  private ngUnsubscribe: Subject<boolean>;

  public sendMessageModalForm: FormGroup;
  public customer: Customer;
  public project: Project;
  public painters: Array<Contractor>;
  public conversations: Array<Conversation>;
  public modalPainter: Contractor;
  public pendingOperation: boolean;
  public pendingOperationFor: Contractor;
  public year: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private apiRequestService: ApiRequestService,
              private materialize: Angular2MaterializeV1Service, private localStorageService: LocalStorageService,
              private projectService: ProjectService, private queryParameterLoaderService: QueryParameterLoaderService,
              private messageService: MessageService, private router: Router, private formBuilder: FormBuilder,
              private socketIoService: SocketIoService, public responsiveService: ResponsiveService) {
    this.ngUnsubscribe = new Subject<boolean>();
    this.sendMessageModalForm = this.formBuilder.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
    this.customer = localStorageService.getCustomer();
    this.project = localStorageService.getActiveProject();
    this.conversations = [];
    this.modalPainter = new Contractor();
    this.pendingOperation = false;
    this.pendingOperationFor = new Contractor();
    this.year = new Date().getFullYear();

    this.localStorageService.customerUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(customer => this.customer = customer);

    this.localStorageService.activeProjectUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(project => this.project = project);

    this.socketIoService.newMessageEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((rawMessage: any) => {this.onNewMessage(rawMessage); });
  }

  async ngOnInit(): Promise<void> {
    await this.queryParameterLoaderService.load();

    this.painters = [];

    if (environment.angularServe) {
      for (let painterId of Object.keys(ngServeData.paintersList)) {
        this.painters.push(new Contractor(ngServeData.paintersList[painterId]));
      }
    }
    else {
      const resp = await this.apiRequestService.get('/api/retrieve-painters/all');
      if (resp.status === 200) { resp.body.forEach(painter => this.painters.push(new Contractor(painter))); }
    }

    // get conversations
    const resp = await this.messageService.getAllConversations();
    if (resp.status === 200) { resp.body.forEach(c => this.conversations.push(new Conversation(c))); }
    if (environment.angularServe && this.customer.hasFilledOutContactInfo()) {
      // this.painters[0]._id = this.conversations[0].otherPerson._id;
    }

    // sort by rating first to bring highest ratings to the top
    this.painters.sort((a, b) => a.rating > b.rating ? -1 : a.rating > b.rating ? 1 : 0);
    // then sort by new messages to bring those to the top
    this.painters.sort(
      (a, b) =>
        this.getNumberOfUnreadMessagesForPainter(a) > this.getNumberOfUnreadMessagesForPainter(b) ? -1
        : this.getNumberOfUnreadMessagesForPainter(a) < this.getNumberOfUnreadMessagesForPainter(b) ? 1
          : 0
    );
  }

  ngAfterViewInit() {
    this.sendMessageModal = (this.materialize.initModal('#send_message_modal', {
      endingTop: '30%'
    }) as IModal);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private onNewMessage(rawMessage: any) {
    const to = new User(rawMessage.to);
    const from = new User(rawMessage.from);
    rawMessage.to = to._id;
    rawMessage.from = from._id;

    const message: Message = new Message(rawMessage);

    const otherPersonId = message.isFromUser(this.customer) ? message.to : message.from;
    const conversation = this.conversations.find(c => c.otherPerson._id === otherPersonId);

    if (conversation) {
      conversation.messages.push(message);
    } else {
      this.conversations.splice(0, 0, new Conversation({
        you: message.isFromUser(this.customer) ? from : to,
        otherPerson: message.isFromUser(this.customer) ? to : from,
        messages: [message]
      }));
    }
  }

  public getNumberOfUnreadMessagesForPainter(painter: Contractor) {
    const conversation = this.conversations.find(c => c.otherPerson._id === painter._id);
    return conversation ? conversation.getNumberOfUnreadMessages() : 0;
  }

  public canClickMessages(): boolean {
    return this.customer.hasFilledOutContactInfo() &&
      this.project.details.getProgress() === 1 &&
      this.project.status !== 'awaitingDownPaymentConfirmation' &&
      this.project.status !== 'booked' &&
      this.project.status !== 'expired';
  }

  public onClickMessages(evt: Event, painter: Contractor) {
    // stop company info modal from opening
    evt.stopPropagation();
    evt.preventDefault();

    const conversation = this.conversations.find(c => c.otherPerson._id === painter._id);
    const hasHistory = conversation ? conversation.messages.length : false;

    if (!hasHistory) {
      this.modalPainter = painter;
      this.sendMessageModal.open();
      this.messageToPainter.nativeElement.style.height = this.messageToPainter.nativeElement.scrollHeight + 'px';
    }
    else {
      this.messageService.setSelectedConversation(painter._id);
      this.router.navigateByUrl('/messages');
    }
  }

  public canInvitePainter(painter: Contractor): boolean {
    return this.canClickMessages() &&
      this.pendingOperationFor !== painter &&
      !this.project.invitedContractors.includes(painter._id);
  }

  public async onInvitePainter(evt: Event, contractor: Contractor): Promise<void> {
    // stop modal from opening
    evt.stopPropagation();
    evt.preventDefault();

    if (this.sendMessageModal.isOpen) { this.sendMessageModal.close(); }

    if (this.pendingOperation) {
      return;
    }

    this.pendingOperation = true;
    this.pendingOperationFor = contractor;

    if (this.project.status === 'creating') {
      const resp = await this.projectService.startReceivingProposals(this.project);
      if (!resp.success) {
        this.pendingOperationFor = new Contractor();
        this.pendingOperation = false;
        return;
      }
      this.localStorageService.saveActiveProject(resp.project);
    }

    const resp = await this.apiRequestService.post('/api/invite-painter', {
      contractorId: contractor._id,
      projectId: this.project._id,
      message: this.sendMessageModalForm.get('message').value || 'Hi, I would like to invite you to quote my project.'
    });

    switch (resp.status) {
      case 200:
        this.messageService.setSelectedConversation(contractor._id);
        this.materialize.toast({html: `Message sent!<a class='btn-flat blue-text' href='/messages?selectedConversation=${contractor._id}'>view message</a>`, displayLength: 6000});
        this.localStorageService.saveActiveProject(resp.body);
        this.sendMessageModalForm.reset();
        break;
      case 404:
        await (() => new Promise(resolve => setTimeout(resolve, 2000)))();
        if (!environment.angularServe) { break; }
        this.messageService.setSelectedConversation(contractor._id);
        this.materialize.toast({html: `Message sent!<a class='btn-flat blue-text' href='/messages?selectedConversation=${contractor._id}'>view message</a>`, displayLength: 6000});
        this.project.invitedContractors.push(contractor._id);
        this.project.proposals.push(new Proposal({
          contractor,
          price: 2000,
          message: 'Hello! My name is Jacob and I have been painting residential homes for 5 years. I\'d love to ' +
            'help on your interior project and will be available to start the week of August 24th and should be able ' +
            'to complete the project in 1 to 1.5 days. Thank you and I look forward to helping with your paint project!',
          earliestStartDate: 'Aug 21, 2020'
        }));
        this.localStorageService.saveActiveProject(this.project);
    }

    this.pendingOperationFor = new Contractor();
    this.pendingOperation = false;
  }

}
