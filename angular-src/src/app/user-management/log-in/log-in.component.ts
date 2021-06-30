import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {LocalStorageService} from "../../services/local-storage.service";
import {ActivatedRoute, Router} from '@angular/router';
import {BannerService} from "../../libraries/banner/banner.service";
import {AuthService} from "../../services/auth.service"
import {RouterExtService} from "../../services/router-ext.service";
import {HpCookieService} from "../../services/hp-cookie.service";

@Component({
  selector: 'user-management-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.less']
})

export class LogInComponent implements OnInit, AfterViewInit {
  private invalidInputs: any;
  private invalidLoginLink: any;
  private resp401: any;
  private resp500: any;

  public loginFormGroup: FormGroup;
  public clickedContinue: boolean;
  public token: string;
  public projectId: string;
  public submittingToken: boolean;
  public startingLoginSequence: boolean;
  public finishedAfterViewInit: boolean;

  constructor(private formBuilder: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute,
              private bannerService: BannerService, private materialize: Angular2MaterializeV1Service,
              private localStorageService: LocalStorageService, private authService: AuthService,
              private routerExtService: RouterExtService, private cookieService: HpCookieService) {
    this.loginFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~@!#$%^&*()\-_=+,<.>/?\\|\[\]{};:'"])[A-Za-z\d`~@!#$%^&*()\-_=+,<.>/?\\|\[\]{};:'"]{8,32}$/)]]
    });
    this.clickedContinue = false;
    this.submittingToken = false;
    this.startingLoginSequence = false;
    this.finishedAfterViewInit = false;
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    // navigate out of log in view if the user has logged in on a different tab
    if (this.cookieService.isLoggedIn()) {
      return this.router.navigateByUrl('/');
    }

    this.invalidInputs = this.bannerService.init('#invalidInputs');
    this.invalidLoginLink = this.bannerService.init('#invalidLoginLink');
    this.resp401 = this.bannerService.init('#resp401');
    this.resp500 = this.bannerService.init('#resp500');

    this.token = this.activatedRoute.snapshot.queryParams.token;
    this.projectId = this.activatedRoute.snapshot.queryParams.projectId;

    await this.router.navigate(
      ['.'],
      { relativeTo: this.activatedRoute }
    );

    if (this.token) {
      this.submittingToken = true;
      const resp = await this.authService.loginWithJwt(this.token);
      switch (resp.status) {
        case 200:
          await this.navigateAwayAfterLogin();
          break;
        case 401:
          this.invalidLoginLink.open();
          break;
        case 404:
          await (()=>new Promise((resolve)=>setTimeout(resolve, 5000)))();
        default:
          if (this.resp500) {
            this.resp500.open();
          }
      }
      this.submittingToken = false;
    }

    this.finishedAfterViewInit = true;
  }

  ngOnDestroy(): void {
    this.bannerService.destroyAll();
  }

  @HostListener('document:visibilitychange')
  private onVisibilityChange() {
    if (this.cookieService.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }

  public async onContinue(email): Promise<void> {
    this.loginFormGroup.controls.email.markAsTouched();

    if (this.loginFormGroup.controls.email.status === 'VALID') {
      this.startingLoginSequence = true;
      const resp = await this.authService.startLoginSequence(email);
      switch (resp.status) {
        case 200:
          this.clickedContinue = true;
          break;
        case 404:
          await (()=>new Promise((resolve)=>setTimeout(resolve, 5000)))();
          this.clickedContinue = true;
        default:
          this.resp500.open();
      }
      this.startingLoginSequence = false;
    }
  }

  public async onSubmit(): Promise<void> {
    if (!this.clickedContinue) {
      await this.onContinue(this.loginFormGroup.value.email);
      return;
    }

    if (this.loginFormGroup.disabled) {
      return;
    }

    this.loginFormGroup.markAllAsTouched();

    if (this.loginFormGroup.invalid) {
      this.bannerService.closeAll();
      this.invalidInputs.open();
      return;
    }

    this.bannerService.closeAll();

    this.loginFormGroup.disable();

    const resp = await this.authService.login(this.loginFormGroup.value);

    switch (resp.status) {
      case 200:
        await this.navigateAwayAfterLogin();
        break;
      case 401:
        this.resp401.open();
        break;
      case 404:
        await (()=>new Promise((resolve)=>setTimeout(resolve, 5000)))();
      default:
        this.resp500.open();
    }

    this.loginFormGroup.enable();
  }

  private async navigateAwayAfterLogin() {
    const redirectUrl = this.routerExtService.getAndClearLoginRedirectUrl();
    if (this.projectId) {
      await this.router.navigateByUrl(`/view-project/${this.projectId}`);
    } else if (redirectUrl) {
      await this.router.navigateByUrl(redirectUrl);
    } else if (this.cookieService.isCustomer()) {
      await this.router.navigateByUrl('/all-projects');
    } else if (this.cookieService.isContractor()) {
      await this.router.navigateByUrl('/messages');
    } else {
      await this.router.navigateByUrl('/');
    }
  }
}
