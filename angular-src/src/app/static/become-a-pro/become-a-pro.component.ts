import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Angular2MaterializeV1Service} from 'angular2-materialize-v1';
import {AnalyticsService} from '../../services/analytics.service';
import {BannerService} from '../../libraries/banner/banner.service';
import {AuthService} from '../../services/auth.service';
import {emailAddressValidator} from '../../validators/emailAddress.validator';
import {mobileNumberValidator} from '../../validators/mobileNumber.validator';
import {passwordValidator} from '../../validators/password.validator';

@Component({
  selector: 'app-become-a-pro',
  templateUrl: './become-a-pro.component.html',
  styleUrls: ['./become-a-pro.component.less']
})
export class BecomeAProComponent implements OnInit, AfterViewInit, OnDestroy {

  public submitting: boolean;
  public becomeAProFromGroup: FormGroup;
  public faqItems: Array<any>;
  private formStarted: boolean;
  private resp200: any;
  private resp409: any;
  private resp500: any;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
              private materialize: Angular2MaterializeV1Service, private analytics: AnalyticsService,
              private bannerService: BannerService) {
    this.submitting = false;
    this.formStarted = false;
    this.faqItems = [
      {
        q: 'What are homepainters service fees?',
        a: 'Homepainter currently collects a 15% service fee on all projects.',
        open: false
      },
      {
        q: 'What are the requirements for a painter to get approved?',
        a: 'To have an approved listing we require our painters to maintain good standing with consumer facing review sites and ' +
          'hold the proper state licensing. To view and quote available projects, you must pass a background check and have up-' +
          'to-date insurance on file.',
        open: false
      },
      {
        q: 'What services does homepainter provide?',
        a: 'Currently, we provide interior painting, exterior painting, deck stain/paint, and cabinet paint/stain. We are working '+
            'hard to expand upon our provided services.',
        open: false
      },
      {
        q: 'What is homepainters service location?',
        a: 'Currently, homepainter services homeowners across central Iowa.',
        open: false
      },
      {
        q: "What's the catch?",
        a: "There is none. We've worked hard to build a risk-free service that enables paint contractors to ditch leads while " +
            "providing time savings, business tools, and dispute resolution services.",
        open: false
      }
    ];
    this.setInitialFormState();
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

  private changeIcon(e: HTMLLIElement): void {
    const index = parseInt(e.id.substr(2), 10);
    this.faqItems[index].open = !this.faqItems[index].open;
  }

  ngOnDestroy(): void {
    this.bannerService.destroyAll();
  }

  private setInitialFormState(): void {
    const initialState = {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: this.formBuilder.group({
        address: ['', [Validators.required, emailAddressValidator]],
        sendPromotional: [undefined]
      }),
      mobile: this.formBuilder.group({
        number: ['', [Validators.required, mobileNumberValidator]]
      }),
      acceptedTermsAndPrivacy: [undefined, [Validators.requiredTrue]],
      password: ['', [Validators.required, passwordValidator]],
      // confirmPassword: ['', [Validators.required, passwordValidator]]
    };
    if (this.becomeAProFromGroup) {
      this.becomeAProFromGroup.reset();
    }
    this.becomeAProFromGroup = this.formBuilder.group(initialState);
  }

  public async onSubmit() {
    if (!this.becomeAProFromGroup.valid || this.submitting) {
      return;
    }

    if (this.resp200.isOpen) { this.resp200.close(); }
    if (this.resp409.isOpen) { this.resp409.close(); }
    if (this.resp500.isOpen) { this.resp500.close(); }

    // convert boolean object
    const json = JSON.parse(JSON.stringify(this.becomeAProFromGroup.value));
    json.email.sendPromotional = !json.email.sendPromotional;
    json.rating = 0;

    // disable submit button and insert preloader (spinning wheel)
    this.submitting = true;
    const resp = await this.authService.createPro(json);

    switch (resp.status) {
      case 200:
      case 201:
        this.analytics.pageAction(this.analytics.eventAction.becomeAPro.completed);
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

  public trackPageAction(field) {
    if (!this.formStarted) {
      this.formStarted = true;
      this.analytics.pageAction(this.analytics.eventAction.becomeAPro.started);
    }

    const details = this.analytics.eventAction.becomeAPro.fieldUpdated.clone();
    details.label.value = field;
    this.analytics.pageAction(details);
  }

}
