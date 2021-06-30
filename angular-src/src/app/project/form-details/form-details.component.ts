import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NavigationService} from './services/navigation.service';
import {AnalyticsService} from '../../services/analytics.service';
import {DetailsCommunicationService} from './services/details-communication.service';
import {Subject} from 'rxjs';
import {LocalStorageService} from '../../services/local-storage.service';
import {takeUntil} from 'rxjs/operators';
import {Details} from '../../models/project/details/details';
import {ProjectService} from '../../models/user/project.service';
import {AuthService} from '../../services/auth.service';
import {Angular2MaterializeV1Service} from 'angular2-materialize-v1';
import {HpCookieService} from '../../services/hp-cookie.service';

@Component({
  selector: 'form-details-root',
  templateUrl: './form-details.component.html',
  styleUrls: ['./form-details.component.less']
})
export class FormDetailsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean>;

  public modalOpenSubject: Subject<void>;
  public generalFeedbackModal: { open: boolean };
  public nextBtn: { text: string, enabled: boolean };
  public progress: number;

  constructor(private router: Router, private detailsCommunicationService: DetailsCommunicationService,
              private navigationService: NavigationService, private analytics: AnalyticsService,
              private localStorageService: LocalStorageService, private projectService: ProjectService,
              private authService: AuthService, private materialize: Angular2MaterializeV1Service,
              private cookieService: HpCookieService)
  {
    this.ngUnsubscribe = new Subject<boolean>();
    this.modalOpenSubject = new Subject<void>();
    this.generalFeedbackModal = { open: false };
    this.nextBtn = { text: '', enabled: false };
    this.progress = 0;

    this.detailsCommunicationService.formEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(args => this.formEvent(args.details, args.valid, args.forceNavigate));

    this.detailsCommunicationService.switchToMobileEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.saveAndReturnLaterClicked());

    this.detailsCommunicationService.progress$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(progress => { this.progress = progress; });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  private formEvent(details: Details, valid: boolean, forceNavigate: boolean): void {
    this.nextBtn.text = this.router.url.includes('review') ? 'finalize' : 'next';
    this.nextBtn.enabled = valid;

    this.localStorageService.saveProjectDetails(details);

    if (valid && forceNavigate) {
      this.navigationService.navigateNext();
    }
  }

  public async nextButtonClicked(): Promise<void> {
    if (this.nextBtn.text === 'finalize') {
      this.analytics.pageAction(this.analytics.eventAction.project.completed);
    }
    else {
      // save partial progress, if logged in, on page change - not on review page
      if (this.cookieService.isLoggedIn() && this.cookieService.isCustomer()) {
        const activeProject = this.localStorageService.getActiveProject();
        const resp = await this.projectService.saveProgress(activeProject, false);

        if (resp.success && !activeProject._id) {
          this.localStorageService.saveActiveProject(resp.project);
        }
      }

      const details = this.analytics.eventAction.project.stepCompleted;
      details.label.value = this.router.url.split(/[?#]/)[0].split('/')[2].replace(/[-]/, '_');
      this.analytics.pageAction(details);
    }

    this.navigationService.navigateNext();
  }

  public async saveAndReturnLaterClicked(): Promise<void> {
    const user = this.localStorageService.getCustomer();
    const project = this.localStorageService.getActiveProject();
    this.analytics.pageAction(this.analytics.eventAction.project.saved);

    if (user.hasFilledOutContactInfo()) {
      const resp = await this.projectService.saveAndReturnLater(project);
      this.localStorageService.saveActiveProject(resp.project);
    } else {
      this.modalOpenSubject.next();
    }
  }

  public backButtonClicked(): void {
    const details = this.analytics.eventAction.project.steppedBackward;
    details.label.value = this.router.url.split(/[?#]/)[0];
    this.analytics.pageAction(details);

    this.navigationService.navigateBack();
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
