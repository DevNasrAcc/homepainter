import {AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {StripeService} from '../../services/stripe.service';
import {ActivatedRoute, Router} from '@angular/router';
import {isPlatformServer} from '@angular/common';
import {BannerService} from "../../libraries/banner/banner.service";
import {LocalStorageService} from "../../services/local-storage.service";
import {Contractor} from "../../models/user/contractor";

@Component({
  selector: 'app-complete-setup',
  templateUrl: './complete-setup.component.html',
  styleUrls: ['./complete-setup.component.less']
})
export class CompleteSetupComponent implements OnInit, AfterViewInit, OnDestroy {

  private contractor: Contractor;
  private code: string;
  private stateValue: string;
  public href: string;
  public error: boolean;
  public complete: boolean;
  private successBanner: any;
  private errorBanner: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private activatedRoute: ActivatedRoute,
              private router: Router, private stripeService: StripeService, private bannerService: BannerService,
              private localStorageService: LocalStorageService) {
    this.contractor = localStorageService.getContractor();
  }

  ngOnInit() {
  }

  async ngAfterViewInit() {
    this.successBanner = this.bannerService.init('#successBanner');
    this.errorBanner = this.bannerService.init('#errorBanner');

    if (isPlatformServer(this.platformId))
      return;

    this.code = this.activatedRoute.snapshot.queryParams.code || '';
    this.stateValue = this.activatedRoute.snapshot.queryParams.state || '';

    // we sent them to this page
    if (!this.code && !this.stateValue) {
      const { stripeClientId, stateValue } = await this.stripeService.getStripeClientId();

      /*
        # see also:
        https://stripe.com/docs/connect/oauth-express-accounts
      */

      this.href = 'https://connect.stripe.com/express/oauth/authorize' +
        `?redirect_uri=${window.location.href}` +
        `&client_id=${stripeClientId}` +
        `&state=${stateValue}` +
        `&stripe_user[email]=${this.contractor.email.address}` +
        `&stripe_user[url]=${this.contractor.website}` +
        `&stripe_user[phone_number]=${this.contractor.mobile.number}` +
        `&stripe_user[business_name]=${this.contractor.organizationName}` +
        `&stripe_user[first_name]=${this.contractor.firstName}` +
        `&stripe_user[last_name]=${this.contractor.lastName}` +
        `&stripe_user[street_address]=${this.contractor.address.streetAddress}` +
        `&stripe_user[city]=${this.contractor.address.city}` +
        `&stripe_user[state]=${this.contractor.address.state}` +
        `&stripe_user[zip]=${this.contractor.address.zipCode}`;
    }

    // stripe sent them to this page
    if (this.code && this.stateValue) {
      if (this.code === '(redacted)') {
        this.complete = true;
        return;
      }

      const resp = await this.stripeService.createConnectAccount(this.code, this.stateValue);

      if (resp) {
        this.successBanner.open();
        this.complete = true;
      }
      else {
        this.errorBanner.open();
        this.error = true;
      }
    }
  }

  ngOnDestroy(): void {
    this.bannerService.destroyAll();
  }

}
