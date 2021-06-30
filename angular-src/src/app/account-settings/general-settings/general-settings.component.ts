import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {Contractor} from "../../models/user/contractor";
import {AuthService} from "../../services/auth.service"
import {BannerService} from "../../libraries/banner/banner.service";
import {LocalStorageService} from "../../services/local-storage.service";

@Component({
  selector: 'app-general',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.less']
})
export class GeneralSettingsComponent implements OnInit, AfterViewInit {
  public generalSettingsForm: FormGroup;
  public contractor: Contractor;
  private resp401: any;
  private resp500: any;
  public general: any;
  constructor(private formBuilder: FormBuilder,private localStorageService: LocalStorageService,private bannerService: BannerService,private authService: AuthService, private materialize: Angular2MaterializeV1Service) {
    this.contractor = new Contractor();

    this.generalSettingsForm = formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.pattern(/-?[A-Za-z\sñÑ]*(\.[A-Za-z]+)?/)]],
      lastName: ['', [Validators.required, Validators.pattern(/-?[A-Za-z\sñÑ]*(\.[A-Za-z]+)?/)]],
      mobile: ['', [Validators.required, Validators.pattern(/^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/)]],
    });
  }

  ngOnInit(): void {
    this.general = this.localStorageService.getContractor();
    const resp = this.authService.getgeneralSettings();
    this.generalSettingsForm.controls['firstName'].setValue(this.general.firstName);
    this.generalSettingsForm.controls['lastName'].setValue(this.general.lastName);
    this.generalSettingsForm.controls['mobile'].setValue(this.general.mobile.number);
    this.generalSettingsForm.controls['email'].setValue(this.general.email.address);

    console.log("General settings",this.general,"response",resp,"contractor",this.contractor)
  }

  ngAfterViewInit() {
    this.materialize.initSelect('select');
    this.resp401 = this.bannerService.init('#resp401');
    this.resp500 = this.bannerService.init('#resp500');
  }

  public async onSubmit(): Promise<void> {      
    const resp = await this.authService.generalSettings(this.generalSettingsForm.value);

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

}
