import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Proposal} from '../../../../models/project/proposal/proposal';
import {Router} from '@angular/router';
import {Project} from '../../../../models/project/project';
import {QueryParameterLoaderService} from '../../services/query-parameter-loader.service';
import {MessageService} from '../../../../services/message.service';
import {Conversation} from '../../../../models/conversation/conversation';
import {Contractor} from '../../../../models/user/contractor';
import {ResponsiveService} from '../../../../services/responsive.service';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.less']
})
export class QuotesComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean>;

  public project: Project;
  public conversations: Array<Conversation>;
  public year: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private localStorageService: LocalStorageService,
              private router: Router, private queryParameterLoaderService: QueryParameterLoaderService,
              private messageService: MessageService, public responsiveService: ResponsiveService) {
    this.ngUnsubscribe = new Subject<boolean>();
    this.project = localStorageService.getActiveProject();
    this.conversations = [];
    this.year = new Date().getFullYear();

    this.localStorageService.activeProjectUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(project => this.project = project);
  }

  async ngOnInit(): Promise<void> {
    await this.queryParameterLoaderService.load();

    const resp = await this.messageService.getAllConversations();
    if (resp.status === 200) { resp.body.forEach(c => this.conversations.push(new Conversation(c))); }

    // sort by rating first to bring highest ratings to the top
    this.project.proposals.sort(
      (a, b) =>
        a.contractor.rating > b.contractor.rating ? -1
          : a.contractor.rating > b.contractor.rating ? 1
          : 0
    );
    // then sort by new messages to bring those to the top
    this.project.proposals.sort(
      (a, b) =>
        this.getNumberOfUnreadMessagesForPainter(a.contractor) > this.getNumberOfUnreadMessagesForPainter(b.contractor) ? -1
          : this.getNumberOfUnreadMessagesForPainter(a.contractor) < this.getNumberOfUnreadMessagesForPainter(b.contractor) ? 1
          : 0
    );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getNumberOfUnreadMessagesForPainter(painter: Contractor) {
    const conversation = this.conversations.find(c => c.otherPerson._id === painter._id);
    return conversation ? conversation.getNumberOfUnreadMessages() : 0;
  }

  public onClickMessages(evt: Event, proposal: Proposal) {
    // stop modal from opening
    evt.stopPropagation();
    evt.preventDefault();
    this.messageService.setSelectedConversation(proposal.contractor._id);
    this.router.navigateByUrl('/messages');
  }

  public onSelectProposal(evt: Event, proposal: Proposal) {
    // stop modal from opening
    evt.stopPropagation();
    evt.preventDefault();

    this.project.selectedProposal = proposal;
    this.localStorageService.saveActiveProject(this.project);
    this.router.navigateByUrl('/project/hire');
  }

}
