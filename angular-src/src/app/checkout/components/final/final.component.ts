import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {StripeData} from '../stripe/stripe.data';
import {FinalData} from './final.data';
import {environment} from '../../../../environments/environment';
import {AnalyticsService} from '../../../services/analytics.service';
import {Customer} from '../../../models/user/customer';
import {LocalStorageService} from '../../../services/local-storage.service';
import {Router} from '@angular/router';
import {StripeService} from '../../../services/stripe.service';
import {Details} from '../../../models/project/details/details';
import {ChargeDetails} from "../../../models/charge-details";
import {ProjectService} from "../../../models/user/project.service";
import {mobileNumberValidator} from "../../../validators/mobileNumber.validator";
import {emailAddressValidator} from "../../../validators/emailAddress.validator";
import {Project} from "../../../models/project/project";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'project-final',
  templateUrl: './final.component.html',
  styleUrls: ['./final.component.less']
})
export class FinalComponent implements OnInit, AfterViewInit {

  private readonly ANALYTICS_STEP_NUMBER: number = 2;
  public customer: Customer;
  public project: Project;
  public chargeDetails: ChargeDetails;
  public pending: boolean;
  public finalDetailsFormGroup: FormGroup;
  private stripeData: StripeData;

  public finalDetailsModal: { open: boolean, details: Details };

  constructor(private formBuilder: FormBuilder, private materialize: Angular2MaterializeV1Service, private router: Router,
              private projectService: ProjectService, private localStorageService: LocalStorageService,
              private analytics: AnalyticsService, private stripeService: StripeService, private authService: AuthService)
  {
    this.pending = false;
    this.customer = localStorageService.getCustomer();
    this.project = localStorageService.getActiveProject();
    this.chargeDetails = new ChargeDetails();
    this.finalDetailsModal = { open: false, details: this.project.details };

    const zipCode = this.project.details.address.zipCode;
    this.finalDetailsFormGroup = formBuilder.group({
      firstName: [this.customer.firstName, Validators.required],
      lastName: [this.customer.lastName, Validators.required],
      emailAddress: [{value:this.customer.email.address, disabled:true}, [Validators.required, emailAddressValidator]],
      phoneNumber: [this.customer.mobile.number, [Validators.required, mobileNumberValidator]],
      address: formBuilder.group({
        streetAddress: [this.project.details.address.streetAddress, Validators.required],
        city: [this.project.details.address.city, Validators.required],
        state: [this.project.details.address.state, Validators.required],
        zipCode: [
          zipCode === 0 || zipCode === null ? '' : zipCode.toString(),
          [Validators.required, Validators.minLength(5), Validators.maxLength(5)]
        ]
      }),
      stripeDataComplete: [false, Validators.requiredTrue],
      billingAddress: formBuilder.group({
        streetAddress: [''],
        city: [''],
        state: [''],
        zipCode: ['']
      }),
      billingAddressSameAsProperty: [true]
    });
  }

  async ngOnInit() {
    this.pending = true;
    this.chargeDetails = await this.projectService.getChargeDetails(this.customer, this.project);
    this.pending = false;

    const details = this.analytics.eventAction.checkout.stepViewed;
    details.label.value = 'final';
    details.value.value = this.chargeDetails.subtotal;
    details.step.value = this.ANALYTICS_STEP_NUMBER;
    this.analytics.pageAction(details);
  }

  ngAfterViewInit(): void {
    this.materialize.updateTextFields();
  }

  public trackPageAction(what) {
    const details = this.analytics.eventAction.user.customer.info.updated.clone();
    details.label.value = what;
    this.analytics.pageAction(details);
  }

  public onSameAddressCheckboxChange(checked: boolean) {
    const billingAddress = this.finalDetailsFormGroup.get('billingAddress.streetAddress');
    const billingCity = this.finalDetailsFormGroup.get('billingAddress.city');
    const billingState = this.finalDetailsFormGroup.get('billingAddress.state');
    const billingZipCode = this.finalDetailsFormGroup.get('billingAddress.zipCode');

    billingAddress.setValidators(checked ? null : [Validators.required]);
    billingCity.setValidators(checked ? null : [Validators.required]);
    billingState.setValidators(checked ? null : [Validators.required]);
    billingZipCode.setValidators(checked ? null : [Validators.required, Validators.minLength(5), Validators.maxLength(5)]);

    billingAddress.updateValueAndValidity();
    billingCity.updateValueAndValidity();
    billingState.updateValueAndValidity();
    billingZipCode.updateValueAndValidity();

    // give it a second to make the address visible. then make sure the fields are nicely shown
    if (!checked) {
      setTimeout(() => {this.materialize.updateTextFields()}, 100);
    }
  }

  public onStripeInfoUpdatedEvent(data: StripeData) {
    this.stripeData = data;
    this.finalDetailsFormGroup.get('stripeDataComplete').setValue(data.complete);
  }

  public onEditDetailsClicked(): void {}

  public onViewDetailsClicked(): void {
    this.finalDetailsModal.open = true;
  }

  public onCloseFinalDetails(): void {
    this.finalDetailsModal.open = false;
  }

  public async onGetDiscountClicked(promoCode: string) {
    const oldDiscount = this.chargeDetails.discount;
    this.project.promoCode = promoCode;
    this.localStorageService.saveActiveProject(this.project);
    this.pending = true;
    this.chargeDetails = await this.projectService.getChargeDetails(this.customer, this.project);
    this.pending = false;

    if (this.chargeDetails.discount !== oldDiscount && this.chargeDetails.discount === 0)
      this.materialize.toast({html: 'Discount removed!', displayLength: 4000});
    else
      this.materialize.toast({html: 'Discount applied!', displayLength: 4000});
  }

  public async onCheckoutButtonClick() {
    const finalDetailsData = new FinalData(this.finalDetailsFormGroup.value);
    finalDetailsData.emailAddress = this.customer.email.address;
    this.pending = true;

    this.customer.firstName = finalDetailsData.firstName;
    this.customer.lastName = finalDetailsData.lastName;
    this.customer.email.address = finalDetailsData.emailAddress;
    this.customer.mobile.number = finalDetailsData.phoneNumber;
    this.project.details.address.streetAddress = finalDetailsData.address.streetAddress;
    this.project.details.address.city = finalDetailsData.address.city;
    this.project.details.address.state = finalDetailsData.address.state;
    this.project.details.address.zipCode = parseInt(finalDetailsData.address.zipCode);
    this.localStorageService.saveCustomer(this.customer);
    this.localStorageService.saveActiveProject(this.project);

    if (!this.customer.hasFilledOutContactInfo() || !this.project.isValid() || !this.project.details.address.isValid())
    {
      this.materialize.toast({html: 'Please check all fields and try again.', displayLength: 6000});
      this.pending = false;
      return;
    }

    if (environment.angularServe) {
      this.pending = false;
      this.router.navigateByUrl('/all-projects');
      return;
    }

    const resp = await this.authService.upsertCustomer(this.customer);
    if (resp.status !== 200 && resp.status !== 201) {
      this.materialize.toast({
        html: 'There was an error updating your contact information. Please check all fields and try again.',
        displayLength: 6000
      });
      this.pending = false;
      return;
    }

    const clientSecret = await this.stripeService.upsertOrder(this.project);
    if (!clientSecret) {
      this.pending = false;
      return;
    }

    const chargeResult = await this.stripeService.confirmCardPayment(
      clientSecret,
      this.stripeData.stripe,
      this.stripeData.element,
      finalDetailsData
    );

    this.pending = false;

    if (chargeResult.error) {
      this.materialize.toast({
        html: 'There was an error making a charge to your account. Please check your details and try again.',
        displayLength: 12000,
      });
      this.materialize.toast({
        html: chargeResult.error.message,
        displayLength: 12000
      });
    }
    else {
      this.project.status = 'awaitingDownPaymentConfirmation';
      this.localStorageService.resetUnfinishedProject();
      this.localStorageService.saveActiveProject(this.project);

      const details = this.analytics.eventAction.checkout.stepCompleted;
      details.label.value = 'final';
      details.value.value = this.chargeDetails.subtotal;
      details.step.value = this.ANALYTICS_STEP_NUMBER;
      this.analytics.pageAction(details);

      const revenue = this.chargeDetails.subtotal - (this.chargeDetails.contractPrice * .85);
      this.analytics.trackConversion(revenue, this.project._id);

      this.router.navigateByUrl('/all-projects');
    }
  }
}
