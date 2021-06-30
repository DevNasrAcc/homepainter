import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {ApiRequestService} from "../../services/api-request.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.less']
})
export class PreferencesComponent implements OnInit {
  public preferencesForm: FormGroup;
  private tokenRegEx = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+$/;
  public success: boolean;
  public error: boolean;
  public tokenPayload: {email: string, __t: string};

  private readonly token: string;

  constructor(private formBuilder: FormBuilder,private apiRequestService: ApiRequestService,private activatedRoute: ActivatedRoute) {
    this.success = false;
    this.error = false;
    this.preferencesForm = formBuilder.group({
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

    this.preferencesForm.disable();

    this.token = this.activatedRoute.snapshot.queryParams.jwt;
    if (this.token && this.tokenRegEx.test(this.token)) {
      this.preferencesForm.get('token').setValue(this.token);
      this.tokenPayload = JSON.parse(atob(this.token.split('.')[1]));
    }
  }

  ngOnInit(): void {
  }

  public getRadioValue(theRadioGroup)
{
    var elements = document.getElementsByName(theRadioGroup);
    console.log("check", elements)
    for (var i = 0, l = elements.length; i < l; i++)
    {
        if ((<HTMLInputElement>elements[i]).checked)
        {
            return (<HTMLInputElement>elements[i]).value;
        }
    }
}

  public async onSubmit(): Promise<void> {
    // no invalid state
    this.success = false;
    this.error = false;
    var text = ((<HTMLInputElement>document.querySelector('input[name=text]:checked')).value === 'true' ? true : false);
    var email = ((<HTMLInputElement>document.querySelector('input[name=email]:checked')).value === 'true' ? true : false);
    var product = ((<HTMLInputElement>document.querySelector('input[name=product]:checked')).value === 'true' ? true : false);
    var promotion = ((<HTMLInputElement>document.querySelector('input[name=promotion]:checked')).value === 'true' ? true : false);
    var blog = ((<HTMLInputElement>document.querySelector('input[name=blog]:checked')).value === 'true' ? true : false);
    var body = {
      email: {
        sendPromotional:promotion,
        sendProductNews: product,
        sendBlog: blog,
        sendProjectNotices: false,
        sendMessageNotices: email,
      },
      mobile: {
        sendProjectNotices: false,
        sendMessageNotices: text,
      }
    }

    this.preferencesForm.disable();

    let resp;
    resp = await this.apiRequestService.post('/auth/update-user-notifications', body);

    // if (environment.angularServe) {
    //   await new Promise(res => setTimeout(res, 1500));
    //   resp = { status: 200 };
    // }
    // else {
    //   resp = await this.apiRequestService.post('/auth/update-user-notifications', body);
    // }

    this.preferencesForm.enable();

    resp.status === 200
      ? this.success = true
      : this.error = true;
  
  }

}
