import {AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformServer} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {ApiRequestService} from "../../services/api-request.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.less']
})
export class NotificationSettingsComponent implements OnInit, AfterViewInit, OnDestroy {

  private tokenRegEx = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+$/;
  private readonly token: string;

  public success: boolean;
  public error: boolean;
  public tokenPayload: {email: string, __t: string};
  public notificationPreferencesForm: FormGroup;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private formBuilder: FormBuilder,
              private activatedRoute: ActivatedRoute, private apiRequestService: ApiRequestService) {
    this.success = false;
    this.error = false;
    this.notificationPreferencesForm = formBuilder.group({
      email: formBuilder.group({
        sendPromotional: [undefined, [Validators.required]],
        sendProductNews: [undefined, [Validators.required]],
        sendBlog: [undefined, [Validators.required]],
        sendProjectNotices: [undefined, [Validators.required]],
        sendMessageNotices: [undefined, [Validators.required]],
      }),
      mobile: formBuilder.group({
        sendProjectNotices: [undefined, [Validators.required]],
        sendMessageNotices: [undefined, [Validators.required]],
      }),
      token: [undefined, [Validators.required, Validators.pattern(this.tokenRegEx)]]
    });

    this.notificationPreferencesForm.disable();

    this.token = this.activatedRoute.snapshot.queryParams.jwt;
    if (this.token && this.tokenRegEx.test(this.token)) {
      this.notificationPreferencesForm.get('token').setValue(this.token);
      this.tokenPayload = JSON.parse(atob(this.token.split('.')[1]));
    }
  }

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformServer(this.platformId)) { return; }
    const body = document.querySelector('body');
    if (!body.classList.contains('grey')) {
      body.classList.add('grey', 'lighten-5');
    }

    if (!this.tokenPayload) {
      return;
    }

    let resp;

    if (environment.angularServe) {
      await new Promise(res => setTimeout(res, 1500));
      resp = {
        status: 200,
        body: {
          email: {
            sendPromotional: true,
            sendProductNews: true,
            sendBlog: true,
            sendProjectNotices: true,
            sendMessageNotices: true,
          },
          mobile: {
            sendProjectNotices: true,
            sendMessageNotices: false,
          }
        }
      };
    }
    else {
      resp = await this.apiRequestService.post('/auth/get-notification-preferences', { token: this.token })
    }

    if (resp.status === 200) {
      for (const [emailOrMobileKey, emailOrMobileValue] of Object.entries(resp.body)) {
        for (const [key, value] of Object.entries(emailOrMobileValue)) {
          this.notificationPreferencesForm.get(emailOrMobileKey).get(key).setValue(value);
        }
      }
      this.notificationPreferencesForm.enable();
    }
    else {
      this.tokenPayload = undefined;
    }
  }

  ngOnDestroy() {
    if (isPlatformServer(this.platformId)) { return; }
    const body = document.querySelector('body');
    if (body.classList.contains('grey')) {
      body.classList.remove('grey', 'lighten-5');
    }
  }

  public async onSubmit(unsubscribeAll: boolean = false): Promise<void> {
    if (this.notificationPreferencesForm.disabled || this.notificationPreferencesForm.invalid) {
      return;
    }

    if (unsubscribeAll) {
      this.notificationPreferencesForm.get('email').get('sendPromotional').setValue(false);
      this.notificationPreferencesForm.get('email').get('sendProductNews').setValue(false);
      this.notificationPreferencesForm.get('email').get('sendBlog').setValue(false);
      this.notificationPreferencesForm.get('email').get('sendProjectNotices').setValue(false);
      this.notificationPreferencesForm.get('email').get('sendMessageNotices').setValue(false);
      this.notificationPreferencesForm.get('mobile').get('sendProjectNotices').setValue(false);
      this.notificationPreferencesForm.get('mobile').get('sendMessageNotices').setValue(false);
    }

    this.success = false;
    this.error = false;

    this.notificationPreferencesForm.disable();

    let resp;
    if (environment.angularServe) {
      await new Promise(res => setTimeout(res, 1500));
      resp = { status: 200 };
    }
    else {
      resp = await this.apiRequestService.post('/auth/update-notification-preferences', this.notificationPreferencesForm.value);
    }

    this.notificationPreferencesForm.enable();

    resp.status === 200
      ? this.success = true
      : this.error = true;
  }

}
