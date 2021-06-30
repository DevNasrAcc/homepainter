import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {Contractor} from "../../models/user/contractor";
import {AuthService} from "../../services/auth.service"
import {BannerService} from "../../libraries/banner/banner.service";
import { analyzeAndValidateNgModules } from '@angular/compiler';
import {LocalStorageService} from "../../services/local-storage.service";
import {ImageFile} from "../../models/imageFile";
import {environment} from "../../../environments/environment";
import {HttpClient, HttpEvent, HttpEventType, HttpRequest} from "@angular/common/http";

@Component({
  selector: 'app-insurance-info',
  templateUrl: './insurance-info.component.html',
  styleUrls: ['./insurance-info.component.less']
})
export class InsuranceInfoComponent implements OnInit, AfterViewInit {
  public insuranceInfoForm: FormGroup;
  public contractor: Contractor;
  notInsured: boolean;
  private resp401: any;
  private resp500: any;
  public curdate: any;
  public savedfile: any;
  public newpdfValue: any;
  constructor(private http: HttpClient,private formBuilder: FormBuilder,private localStorageService: LocalStorageService,private bannerService: BannerService,private authService: AuthService, private materialize: Angular2MaterializeV1Service) {
    this.contractor = new Contractor();
    this.curdate = new Date();
    this.insuranceInfoForm = formBuilder.group({
      insuranceFile: '',
      insuranceStart: '',
      insuranceEnd: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const resp = this.authService.getinsurance();
    const insuranced = this.localStorageService.getContractor();

    this.insuranceInfoForm.controls['insuranceEnd'].setValue(insuranced.insurance.expirationDate);
    console.log("insurance response",resp,"localstorage",insuranced)
  }

  ngAfterViewInit() {
    this.materialize.initDatepicker('.datepicker');
  }

  // public async uploadpdf(): Promise<void> {
  //   var insuranceFile = (<HTMLInputElement>document.getElementById("insurance_file")).value;
  //   const resp = this.authService.insuranceUpdatePdf(insuranceFile);
  // }
  public savefile(event) {
    this.savedfile = event.target.files[0];
  }

  public savepdfFile(file){
    this.newpdfValue = file;
  }

  public async uploadPdf(): Promise<ImageFile> {
    if(this.savedfile.type !== 'application/pdf'){
      this.materialize.toast({
        html: 'Please upload pdf file',
        displayLength: 6000
      });
    }
    else{
    // if (environment.angularServe) {
    //   await this.wait();
    //   const rand = Math.floor((Math.random() * 7) + 1);
    //   return new ImageFile({
    //     originalName: `_exterior(${rand}).jpg`,
    //     size: 1567249,
    //     url: `https://us-east-1.linodeobjects.com/homepainter-images-development/example${rand}.JPG`
    //   });
    // }
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append( this.savedfile.name, this.savedfile, this.savedfile.name);
      const req = new HttpRequest('POST', '/api/files/upload-insurance', formData, { reportProgress: true });
      this.http.request(req).subscribe((evt: HttpEvent<any>) => {
        switch (evt.type) {
          case HttpEventType.ResponseHeader:
            if (evt.status === 500) reject(evt);
            break;
          case HttpEventType.Response:
            console.log("succeed",evt.body,"event",evt)
            this.savepdfFile(evt.body)
            resolve(new ImageFile(evt.body));
            break;
        }
      })
    });
    }
  }

  public async onSubmit(): Promise<void> {
    var expirationDate = (<HTMLInputElement>document.getElementById("insurance_end")).value;
    var fileLocation = this.newpdfValue;
    var companyName = (<HTMLInputElement>document.getElementById("insurance_start")).value;
    var insurance={
      expirationDate,
      fileLocation,
      companyName
    }
    const dataset = {insurance}
    const resp = await this.authService.insuranceUpdate(dataset);

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
        // localstorage get email
  
        // http call to api route confirm-password-change
        // params: (email, old password, new password)
    }

    private wait() {
      return new Promise(r => setTimeout(r, 1000));
    }
}
