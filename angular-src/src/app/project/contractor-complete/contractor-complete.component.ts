import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {AnalyticsService} from '../../services/analytics.service';
import {BannerService} from "../../libraries/banner/banner.service";
import {ApiRequestService} from "../../services/api-request.service";

@Component({
  selector: 'project-contractor-complete',
  templateUrl: './contractor-complete.component.html',
  styleUrls: ['./contractor-complete.component.less']
})
export class ContractorCompleteComponent implements OnInit, AfterViewInit {

  public projectCompleteFormGroup: FormGroup;
  public submitting: boolean;
  private resp200: any;
  private resp500: any;

  constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router,
              private materialize: Angular2MaterializeV1Service, private apiRequestService: ApiRequestService,
              private analytics: AnalyticsService, private bannerService: BannerService) {
    this.submitting = false;
    this.projectCompleteFormGroup = formBuilder.group({
      projectRating: [undefined, [Validators.min(1), Validators.max(5), Validators.required]],
      projectComment: [''],
      homepainterRating: [undefined, [Validators.min(1), Validators.max(5), Validators.required]],
      homepainterComment: [''],
      additionalComment: ['']
    });
  }

  ngOnInit() {
    this.analytics.pageAction(this.analytics.eventAction.project.contractorFeedback.started);
  }

  ngAfterViewInit() {
    this.materialize.updateTextFields();
    this.resp200 = this.bannerService.init('#resp200');
    this.resp500 = this.bannerService.init('#resp500');
  }

  ngOnDestroy() {
    this.bannerService.destroyAll();
  }

  public trackPageAction(what) {
    const details = this.analytics.eventAction.project.contractorFeedback.updated.clone();
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
    const resp = await this.apiRequestService.post('/api/contractor-complete', value);

    switch (resp.status) {
      case 200:
      case 201:
        this.analytics.pageAction(this.analytics.eventAction.project.contractorFeedback.completed);
        this.projectCompleteFormGroup.reset();
        this.resp200.open();
        break;
      case 404:
        this.materialize.toast({html: 'Url not found', displayLength: 3000});
        break;
      default:
        this.resp500.open();
    }

    this.submitting = false;
  }
}
