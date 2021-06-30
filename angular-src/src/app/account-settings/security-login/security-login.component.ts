import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {passwordValidator} from "../../validators/password.validator";
import {AuthService} from "../../services/auth.service"
import {BannerService} from "../../libraries/banner/banner.service";
import {LocalStorageService} from "../../services/local-storage.service";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";

@Component({
  selector: 'app-security-login',
  templateUrl: './security-login.component.html',
  styleUrls: ['./security-login.component.less']
})
export class SecurityLoginComponent implements OnInit {
  public securitySettingsForm: FormGroup;
  private resp401: any;
  private resp500: any;
  constructor(private formBuilder: FormBuilder,private materialize: Angular2MaterializeV1Service,private localStorageService: LocalStorageService,private bannerService: BannerService,private authService: AuthService, private router: Router) {
    this.securitySettingsForm = formBuilder.group({
      currentPassword: ['', [Validators.required, passwordValidator]],
      newPassword: ['', [Validators.required, passwordValidator]],
      confirmNewPassword: ['', [Validators.required, passwordValidator]],
      email: [''],
    });
  }

  ngOnInit(): void {
    let emailaddress= this.localStorageService.getContractor();
    this.securitySettingsForm.controls['email'].setValue(emailaddress.email.address);
  }

  async ngAfterViewInit(){
    this.resp401 = this.bannerService.init('#resp401');
    this.resp500 = this.bannerService.init('#resp500');
  }

  public async onSubmit(): Promise<void> {

    if(this.securitySettingsForm.controls['newPassword'].value !== this.securitySettingsForm.controls['confirmNewPassword'].value){
      this.materialize.toast({
        html: 'Confirm password is not same as new password',
        displayLength: 6000
      });
    }
    else{
      this.securitySettingsForm.removeControl('confirmNewPassword');

      const resp = await this.authService.changePassword(this.securitySettingsForm.value);
  
      switch (resp.status) {
        case 200:
          break;
        case 401:
          this.resp401.open();
          break;
        case 404:
          await (()=>new Promise((resolve)=>setTimeout(resolve, 5000)))();
        default:
          this.resp500.open();
      }
    }
      // localstorage get email

      // http call to api route confirm-password-change
      // params: (email, old password, new password)
  }
}
