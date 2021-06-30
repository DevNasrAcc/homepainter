import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AnalyticsService} from "../../services/analytics.service";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {BannerService} from "../../libraries/banner/banner.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {passwordValidator} from "../../validators/password.validator";
import {mobileNumberValidator} from "../../validators/mobileNumber.validator";
import {emailAddressValidator} from "../../validators/emailAddress.validator";

@Component({
  selector: 'app-become-an-agent',
  templateUrl: './become-an-agent.component.html',
  styleUrls: ['./become-an-agent.component.less']
})
export class BecomeAnAgentComponent implements OnInit, AfterViewInit, OnDestroy {

  private formStarted: boolean;
  public submitting: boolean;
  public formGroup: FormGroup;
  private resp200: any;
  private resp409: any;
  public faqItems: Array<any>;
  private resp500: any;

  constructor(private formBuilder: FormBuilder, private analytics: AnalyticsService,
              private materialize: Angular2MaterializeV1Service, private authService: AuthService,
              private bannerService: BannerService, private router: Router) {
    this.submitting = false;
    this.setInitialFormState();
    this.faqItems = [
      {
        q: 'What services can homepainter provide my clients?',
        a: 'Currently, you can request quotes and hire contractors for interior painting, exterior painting, deck stain, and cabinet  ' +
          'paint/stain.' ,
        open: false
      },
      {
        q: 'How is the referral bonus calculated?',
        a: 'The referral bonus is calculated based on the size of the project and can vary from $25 to $100. Larger projects will ' +
          'pay out larger bonuses.',
        open: false
      },
      {
        q: 'How does homepainter vet their painters?',
        a: 'All of our painters undergo a criminal background check and quality assessment to ensure your clients safety and job '+
            'satisfaction. We collect and store the proper license and insurance documentation for you.',
        open: false
      },
      {
        q: 'What insurance/coverage do the painters have?',
        a: 'We collect and store up-to-date insurance information on all contractors including general liability and workers\' compensation coverage.',
        open: false
      },
      {
        q: 'Why do I need to create an account?',
        a: 'We use the provided information to verify your credentials and to provide you with account/payment settings that '+
            'you can manage on your own.',
        open: false
      }
    ];
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.resp200 = this.bannerService.init('#resp200');
    this.resp409 = this.bannerService.init('#resp409');
    this.resp500 = this.bannerService.init('#resp500');

    this.materialize.initSelect('select', {
      classes: 'select-override',
      dropdownOptions: { coverTrigger: false }
    });
    this.materialize.initCollapsible('.collapsible.expandable', {
      accordion: false,
      onOpenStart: (e: HTMLLIElement) => this.changeIcon(e),
      onCloseStart: (e: HTMLLIElement) => this.changeIcon(e)
    });
  }

  ngOnDestroy(): void {
    this.bannerService.destroyAll();
  }

  private changeIcon(e: HTMLLIElement): void {
    const index = parseInt(e.id.substr(2), 10);
    this.faqItems[index].open = !this.faqItems[index].open;
  }

  private setInitialFormState(): void {
    const initialState = {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: this.formBuilder.group({
        address: ['', [Validators.required, emailAddressValidator]],
        sendPromotional: [undefined]
      }),
      // mobile: this.formBuilder.group({
      //   number: ['', [Validators.required, mobileNumberValidator]]
      // }),
      companyName: ['', [Validators.required]],
      password: ['', [Validators.required, passwordValidator]],
      // confirmPassword: ['', [Validators.required, passwordValidator]],
      acceptedTermsAndPrivacy: [undefined, [Validators.requiredTrue]]
    };

    this.formStarted = false;
    if (this.formGroup) this.formGroup.reset();
    this.formGroup = this.formBuilder.group(initialState);
  }

  public trackPageAction(field) {
    if (!this.formStarted) {
      this.formStarted = true;
      this.analytics.pageAction(this.analytics.eventAction.becomeAnAgent.started);
    }

    const details = this.analytics.eventAction.becomeAnAgent.fieldUpdated.clone();
    details.label.value = field;
    this.analytics.pageAction(details);
  }

  public async onSubmit() {

    if (this.resp200.isOpen) this.resp200.close();
    if (this.resp409.isOpen) this.resp409.close();
    if (this.resp500.isOpen) this.resp500.close();

    const json = JSON.parse(JSON.stringify(this.formGroup.value));
    json.email.sendPromotional = !json.email.sendPromotional;

    this.submitting = true;
    const resp = await this.authService.createAgent(json);

    switch (resp.status) {
      case 200:
      case 201:
        this.analytics.pageAction(this.analytics.eventAction.becomeAnAgent.completed);
        this.setInitialFormState();
        this.materialize.updateTextFields();
        this.resp200.open();
        break;
      case 404:
        this.materialize.toast({html: 'Url not found', displayLength: 3000});
        break;
      case 409:
        this.resp409.open();
        break;
      default:
        this.resp500.open();
    }

    // enable submit button
    this.submitting = false;
  }

}
