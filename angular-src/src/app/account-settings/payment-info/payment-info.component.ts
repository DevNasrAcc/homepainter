import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Contractor} from "../../models/user/contractor";
import {AuthService} from "../../services/auth.service"
import {BannerService} from "../../libraries/banner/banner.service";
import {LocalStorageService} from "../../services/local-storage.service";

@Component({
  selector: 'app-payment-info',
  templateUrl: './payment-info.component.html',
  styleUrls: ['./payment-info.component.less']
})

export class PaymentInfoComponent implements OnInit {
  public contractor: Contractor;
  public paymentInfoForm: FormGroup;
  public urlstripe: any;
  private resp401: any;
  private resp500: any;
  public success: boolean;
  public error: boolean;
  public general: any;

  constructor(private formBuilder: FormBuilder,private localStorageService: LocalStorageService,private bannerService: BannerService,private authService: AuthService, private router: Router) {
    this.contractor = new Contractor();
    this.success = false;
    this.error = false;
    this.paymentInfoForm = formBuilder.group({
      stripeLink: ['', [Validators.required, Validators.pattern("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,4}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)")]],
      w9Info: ['', [Validators.required, Validators.pattern("/^\\d{2}\\-?\\d{7}$/")]],
    });
  }
  
  async ngOnInit() {
    this.general = this.localStorageService.getContractor();

    if (this.general.accountStatus === 'active') {
      const resp = await this.authService.stripeUrl();

      switch (resp.status) {
        case 200:
          this.urlstripe = resp;
          break;
        case 401:
          this.resp401.open();
          break;
        default:
          this.resp500.open();
      }
        // localstorage get email
  
        // http call to api route confirm-password-change
        // params: (email, old password, new password)
    }
  }

  public async onSubmit(): Promise<void> {
    if (!this.paymentInfoForm.valid) {
      this.router.navigateByUrl('/complete-setup');
    }
  }
}
