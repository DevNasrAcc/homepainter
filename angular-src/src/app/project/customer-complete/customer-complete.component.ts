import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {environment} from '../../../environments/environment';
import {AnalyticsService} from '../../services/analytics.service';
import {BannerService} from "../../libraries/banner/banner.service";
import {ApiRequestService} from "../../services/api-request.service";

@Component({
  selector: 'app-customer-complete',
  templateUrl: './customer-complete.component.html',
  styleUrls: ['./customer-complete.component.less']
})
export class CustomerCompleteComponent implements OnInit, AfterViewInit, OnDestroy {

  public progress: Array<string>;
  public numQuestions: number;
  public showAdditionalWebsites: boolean;
  public projectCompleteFormGroup: FormGroup;
  public submitting: boolean;
  private resp200: any;
  private resp500: any;

  constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router,
              private materialize: Angular2MaterializeV1Service, private apiRequestService: ApiRequestService,
              private analytics: AnalyticsService, private bannerService: BannerService) {
    this.progress = [];
    this.numQuestions = 4;
    this.showAdditionalWebsites = false;
    this.submitting = false;
    this.projectCompleteFormGroup = formBuilder.group({
      contractorOverallRating: [undefined, [Validators.min(1), Validators.max(5), Validators.required]],
      contractorOverallComment: [''],
      contractorProfessionalismRating: [undefined, [Validators.min(1), Validators.max(5), Validators.required]],
      contractorProfessionalismComment: [''],
      contractorQualityRating: [undefined, [Validators.min(1), Validators.max(5), Validators.required]],
      contractorQualityComment: [''],
      contractorAdditionalComment: [''],
      homepainterOverallRating: [undefined, [Validators.min(1), Validators.max(5), Validators.required]],
      homepainterOverallComment: [''],
      homepainterAdditionalComment: [''],
    });
  }

  ngOnInit() {
    this.analytics.pageAction(this.analytics.eventAction.project.customerFeedback.started);
  }

  ngAfterViewInit(): void {
    this.materialize.initPushpin('.pushpin');
    this.materialize.updateTextFields();
    this.resp200 = this.bannerService.init('#resp200');
    this.resp500 = this.bannerService.init('#resp500');
  }

  ngOnDestroy(): void {
    this.bannerService.destroyAll();
  }

  public updateProgress() {
    const controls = ['contractorOverallRating', 'contractorProfessionalismRating', 'contractorQualityRating', 'homepainterOverallRating'];
    for (const control of controls) {
      if (this.projectCompleteFormGroup.get(control).value && !this.progress.includes(control)) {
        this.progress.push(control);
      }
    }

    const contractorAverage = (this.projectCompleteFormGroup.get(controls[0]).value
      + this.projectCompleteFormGroup.get(controls[1]).value
      + this.projectCompleteFormGroup.get(controls[2]).value)
      / 3;
    const homepainterRating = this.projectCompleteFormGroup.get(controls[3]).value;
    this.showAdditionalWebsites = contractorAverage >= 4 && homepainterRating >= 4;
  }

  public trackPageAction(what) {
    const details = this.analytics.eventAction.project.customerFeedback.updated.clone();
    details.label.value = what;
    this.analytics.pageAction(details);
  }

  public async onSubmit(): Promise<void> {
    if (!this.projectCompleteFormGroup.valid) {
      return;
    }
    if (this.resp200.isOpen) this.resp200.close();
    if (this.resp500.isOpen) this.resp500.close();

    this.submitting = true;
    const value = this.projectCompleteFormGroup.value;
    value.orderId = this.activatedRoute.snapshot.params.orderId;
    const resp = await this.apiRequestService.post('/api/customer-complete', value);

    switch (resp.status) {
      case 200:
      case 201:
        this.analytics.pageAction(this.analytics.eventAction.project.customerFeedback.completed);
        this.projectCompleteFormGroup.reset();
        this.progress.splice(0, this.progress.length);
        this.resp200.open();
        break;
      case 404:
        this.materialize.toast({html: 'Url not found.', displayLength: 3000});
        break;
      default:
        this.resp500.open();
    }

    this.submitting = false;
  }

  public externalLinkClicked(link) {
    const details = this.analytics.eventAction.static.externalLinkClicked;
    details.label.value = link;
    this.analytics.pageAction(details);
  }
}
