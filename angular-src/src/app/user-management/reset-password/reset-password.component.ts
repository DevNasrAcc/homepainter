import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from "../../services/auth.service";
import {BannerService} from "../../libraries/banner/banner.service";
import {environment} from "../../../environments/environment";
import {RouterExtService} from "../../services/router-ext.service";
import {HpCookieService} from "../../services/hp-cookie.service";


@Component({
  selector: 'user-management-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.less']
})
export class ResetPasswordComponent implements OnInit, AfterViewInit {

  private invalidInputs: any;
  private checkEmail: any;
  private resp401: any;
  private resp500: any;
  private passwordResetToken: string;
  private emailAddress: string;

  public submitting: boolean;
  public requestResetFormGroup: FormGroup;
  public resetFormGroup: FormGroup;
  public showPasswordResetFields: boolean;

  constructor(private formBuilder: FormBuilder, private router: Router, private bannerService: BannerService,
              private authService: AuthService, private routerExtService: RouterExtService,
              private cookieService: HpCookieService, private activatedRoute: ActivatedRoute) {
    this.showPasswordResetFields = false;
    this.submitting = false;
    this.requestResetFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
    });
    this.resetFormGroup = this.formBuilder.group({
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~@!#$%^&*()\-_=+,<.>/?\\|\[\]{};:'"])[A-Za-z\d`~@!#$%^&*()\-_=+,<.>/?\\|\[\]{};:'"]{8,32}$/)]],
      confirmationPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~@!#$%^&*()\-_=+,<.>/?\\|\[\]{};:'"])[A-Za-z\d`~@!#$%^&*()\-_=+,<.>/?\\|\[\]{};:'"]{8,32}$/)]]
    });
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    this.passwordResetToken = this.activatedRoute.snapshot.queryParams.token;
    this.emailAddress = this.activatedRoute.snapshot.queryParams.email;
    await this.router.navigate(
      ['.'],
      { relativeTo: this.activatedRoute }
    );

    if (this.passwordResetToken) {
      this.showPasswordResetFields = true;
      this.requestResetFormGroup.disable();
    } else {
      this.resetFormGroup.disable();
    }

    this.invalidInputs = this.bannerService.init('#invalidInputs');
    this.checkEmail = this.bannerService.init('#checkEmail');
    this.resp401 = this.bannerService.init('#resp401');
    this.resp500 = this.bannerService.init('#resp500');
  }

  public getClass(field: string): string {
    const control = this.resetFormGroup.get(field);
    const password = this.resetFormGroup.get('password');
    const confirmPassword = this.resetFormGroup.get('confirmationPassword');

    if (this.resetFormGroup.disabled || !control.touched) {
      return '';
    }
    else if (control.touched && control.invalid) {
      return 'invalid';
    }
    else if (password.touched && confirmPassword.touched && password.value !== confirmPassword.value && field !== 'password') {
      return 'invalid';
    }

    return 'valid';
  }

  public async requestPasswordReset(): Promise<void> {
    if (this.requestResetFormGroup.disabled || this.requestResetFormGroup.invalid) {
      return;
    } else if (this.requestResetFormGroup.invalid) {
      this.invalidInputs.close();
      this.invalidInputs.open();
    }

    this.requestResetFormGroup.disable();
    this.submitting = true;

    if (environment.angularServe) {
      await (()=>new Promise(resolve=>setTimeout(resolve, 2000)))();
    }

    const resp = await this.authService.requestPasswordReset(this.requestResetFormGroup.value);

    this.submitting = false;

    if (environment.angularServe || resp.status < 500) {
      this.checkEmail.open();
    }
    else {
      this.resp500.open();
    }
  }

  public async resetPassword(): Promise<void> {
    if (this.resetFormGroup.disabled) {
      return;
    }

    if (this.resetFormGroup.invalid || this.resetFormGroup.get('password').value !== this.resetFormGroup.get('confirmationPassword').value) {
      this.invalidInputs.close();
      this.invalidInputs.open();
      return;
    }

    this.bannerService.closeAll();

    this.resetFormGroup.disable();

    if (environment.angularServe) {
      await (()=>new Promise(resolve=>setTimeout(resolve, 2000)))();
    }

    const body = this.resetFormGroup.value;
    body.email = this.emailAddress;
    body.passwordResetCode = this.passwordResetToken;
    const resp = await this.authService.resetPassword(body);

    if (resp.status === 200) {
      const redirectUrl = this.routerExtService.getAndClearLoginRedirectUrl();
      if (redirectUrl) {
        await this.router.navigateByUrl(redirectUrl);
      } else if (this.cookieService.isCustomer()) {
        await this.router.navigateByUrl('/all-projects');
      } else if (this.cookieService.isContractor()) {
        await this.router.navigateByUrl('/messages');
      } else {
        await this.router.navigateByUrl('/');
      }
    }
    else if (resp.status < 500) {
      this.resp401.open();
    }
    else {
      this.resp500.open();
    }

    this.resetFormGroup.enable();

    if (this.showPasswordResetFields) {
      this.resetFormGroup.get('email').disable();
    }
  }

}
