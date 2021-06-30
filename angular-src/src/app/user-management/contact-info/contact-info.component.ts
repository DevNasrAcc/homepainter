import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Angular2MaterializeV1Service} from 'angular2-materialize-v1';
import {AnalyticsService} from '../../services/analytics.service';
import {LocalStorageService} from '../../services/local-storage.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {emailAddressValidator} from '../../validators/emailAddress.validator';
import {mobileNumberValidator} from '../../validators/mobileNumber.validator';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {ProjectService} from '../../models/user/project.service';
import {ApiRequestService} from "../../services/api-request.service";

@Component({
  selector: 'user-management-contact-info[showStartInvitingPainters][openSubject]',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.less']
})
export class ContactInfoComponent implements OnInit, AfterViewInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean>;
  private modalInstance: any;
  private open: boolean;
  public contactInfo: FormGroup;

  @Input() showStartInvitingPainters: boolean;
  @Input() openSubject: Subject<void>;

  constructor(private materialize: Angular2MaterializeV1Service, private analytics: AnalyticsService,
              private localStorageService: LocalStorageService, private formBuilder: FormBuilder,
              private authService: AuthService, private projectService: ProjectService, private apiRequestService: ApiRequestService) {
    this.ngUnsubscribe = new Subject<boolean>();

    this.contactInfo = this.formBuilder.group({
      email: ['', [Validators.required, emailAddressValidator]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, mobileNumberValidator]],
      sendPromotional: [true, []],
      acceptedTermsAndPrivacy: [false, [Validators.requiredTrue]],
    });

    const customer = this.localStorageService.getCustomer();
    if (customer.hasFilledOutContactInfo()) {
      this.contactInfo.get('email').setValue(customer.email.address);
      this.contactInfo.get('firstName').setValue(customer.firstName);
      this.contactInfo.get('lastName').setValue(customer.lastName);
      this.contactInfo.get('phoneNumber').setValue(customer.mobile.number);
    }
  }

  ngOnInit() {
    this.analytics.pageAction(this.analytics.eventAction.user.customer.info.started);

    this.openSubject.asObservable()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (this.modalInstance) {
          this.modalInstance.open();
        }
        else {
          this.open = true;
        }
      });
  }

  ngAfterViewInit(): void {
    this.materialize.initTooltip('.tooltipped');
    this.modalInstance = this.materialize.initModal('#contactInfoModal', {
      onCloseEnd: () => {
        this.analytics.pageAction(this.analytics.eventAction.user.customer.info.closed);
      }
    });

    if (this.modalInstance && this.open) {
      this.modalInstance.open();
    }
  }

  ngOnDestroy(): void {
    if (this.modalInstance && this.modalInstance.isOpen) {
      this.modalInstance.close();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public trackPageAction(what) {
    const details = this.analytics.eventAction.user.customer.info.updated.clone();
    details.label.value = what;
    this.analytics.pageAction(details);
  }

  public async onSubmit(): Promise<void> {
    this.contactInfo.markAllAsTouched();

    if (this.contactInfo.invalid || this.contactInfo.disabled) { return; }

    this.analytics.pageAction(this.analytics.eventAction.user.customer.info.completedContactInfo);
    this.contactInfo.disable();

    const user = this.localStorageService.getCustomer();
    user.email.address = this.contactInfo.value.email;
    user.firstName = this.contactInfo.value.firstName;
    user.lastName = this.contactInfo.value.lastName;
    user.mobile.number = this.contactInfo.value.phoneNumber;
    user.email.sendPromotional = this.contactInfo.value.sendPromotional;
    user.email.sendProductNews = this.contactInfo.value.sendPromotional;
    user.email.sendBlog = this.contactInfo.value.sendPromotional;
    user.email.sendProjectNotices = true;
    user.email.sendMessageNotices = true;
    user.acceptedTermsAndPrivacy = this.contactInfo.value.acceptedTermsAndPrivacy;

    const createCustomerResp = await this.authService.upsertCustomer(user);
    if (createCustomerResp.status !== 200 && createCustomerResp.status !== 201) {
      this.materialize.toast({html: 'We could not create your user. Please check all fields and try again.', displayLength: 6000});
      this.contactInfo.enable();
      return;
    }

    let project = this.localStorageService.getActiveProject();
    const resp = this.showStartInvitingPainters
      ? await this.projectService.startReceivingProposals(project)
      : await this.projectService.saveAndReturnLater(project);

    if (resp.success) {
      this.localStorageService.saveActiveProject(resp.project);
      project = resp.project;

      if (this.localStorageService.getIsEditingUnfinishedProject()) {
        this.localStorageService.setIsEditingUnfinishedProject(false);
        this.localStorageService.resetUnfinishedProject();
      }

      const selectedContractorId = this.localStorageService.getSelectedContractorId();
      if (selectedContractorId && this.showStartInvitingPainters) {
        const resp = await this.projectService.invitePainter(selectedContractorId, project);

        if (resp.success) {
          this.localStorageService.saveActiveProject(resp.project);
        }

        this.localStorageService.clearSelectedContractorId();
      }

      this.contactInfo.reset();
      this.contactInfo.enable();
      this.modalInstance.close();
    }
    else {
      this.contactInfo.enable();
      this.materialize.toast({html: 'There was an error saving your project. Please try again.', displayLength: 6000});
    }
  }
}
