import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ProjectDashboardStateService} from './services/project-dashboard-state.service';
import {LocalStorageService} from '../../services/local-storage.service';
import {AnalyticsService} from '../../services/analytics.service';
import {ProjectService} from '../../models/user/project.service';
import {Customer} from '../../models/user/customer';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {Angular2MaterializeV1Service} from 'angular2-materialize-v1';
import {Project} from '../../models/project/project';
import {Router} from '@angular/router';

@Component({
  selector: 'project-root',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.less']
})
export class ProjectDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean>;

  public modalOpenSubject: Subject<void>;
  public customer: Customer;
  public project: Project;
  public projectViewState: 'nullProject' | 'continueProject' | 'awaitingContactInfo' | 'invitingPainters' | 'selectedPainter';
  public generalFeedbackModal: { open: boolean };
  public title = {
    nullProject: 'Welcome to your project! This is where you will be able to view all of your quotes. Let\'s get started!',
    continueProject: 'Let\'s continue planning your project. Click continue project to finish entering your project details.',
    awaitingContactInfo: 'We\'re almost there! Enter your contact info to receive emails about incoming quotes.',
    invitingPainters: 'Your project is submitted. Get a couple more quotes by sending requests to more painters.',
    selectedPainter: 'Your paint project is ready to book! Review the final details and checkout.'
  };

  constructor(private localStorageService: LocalStorageService, private authService: AuthService,
              private stateManager: ProjectDashboardStateService, private materialize: Angular2MaterializeV1Service,
              private analytics: AnalyticsService, private projectService: ProjectService, public router: Router)
  {
    this.ngUnsubscribe = new Subject<boolean>();
    this.modalOpenSubject = new Subject<void>();
    this.customer = localStorageService.getCustomer();
    this.project = localStorageService.getActiveProject();
    this.projectViewState = stateManager.getProjectState(this.customer, this.project);
    this.generalFeedbackModal = { open: false };
    this.localStorageService.customerUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(customer => {
        this.customer = customer;
        this.updateAfterStorageEvent();
      });
    this.localStorageService.activeProjectUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(project => {
        this.project = project;
        this.updateAfterStorageEvent();
      });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.projectViewState === 'awaitingContactInfo') {
      this.modalOpenSubject.next();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public updateAfterStorageEvent(): void {
    this.projectViewState = this.stateManager.getProjectState(this.customer, this.project);

    if (this.projectViewState === 'awaitingContactInfo') {
      this.modalOpenSubject.next();
    }
  }

  public giveFeedbackClicked(): void {
    this.generalFeedbackModal.open = true;
    this.analytics.pageAction(this.analytics.eventAction.project.generalFeedback.started);
  }

  public onUpdateGeneralFeedbackField(value: any) {
    const details = this.analytics.eventAction.project.generalFeedback.updated.clone();
    details.label.value = value;
    this.analytics.pageAction(details);
  }

  public onCloseFeedback(): void {
    this.generalFeedbackModal.open = false;
  }

  public async onSubmitFeedback(event: {value: any, cb: Function}): Promise<void> {
    const customer = this.localStorageService.getCustomer();
    event.value.emailAddress = customer.email.address;
    const result = await this.projectService.submitGeneralFeedback(event);
    if (result) { this.analytics.pageAction(this.analytics.eventAction.project.generalFeedback.completed); }
  }

}
