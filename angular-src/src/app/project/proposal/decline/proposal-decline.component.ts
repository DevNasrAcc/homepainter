import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {AnalyticsService} from '../../../services/analytics.service';
import {BannerService} from "../../../libraries/banner/banner.service";
import {ApiRequestService} from "../../../services/api-request.service";


@Component({
  selector: 'root-contractor-response',
  templateUrl: './proposal-decline.component.html',
  styleUrls: ['./proposal-decline.component.less']
})
export class ProposalDeclineComponent implements OnInit, AfterViewInit {

  private resp200: any;
  private resp500: any;

  public contractorProposalFormGroup: FormGroup;
  public submitting: boolean;

  constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router,
              private materialize: Angular2MaterializeV1Service, private apiRequestService: ApiRequestService,
              private analytics: AnalyticsService, private bannerService: BannerService) {
    this.submitting = false;
    this.contractorProposalFormGroup = formBuilder.group({
      reason: ['none', [Validators.required]],
      feedback: ['']
    });
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.materialize.initSelect('select');
    this.materialize.updateTextFields();

    this.resp200 = this.bannerService.init('#resp200');
    this.resp500 = this.bannerService.init('#resp500');
  }

  public accept(): void {
    const projectId = this.activatedRoute.snapshot.params.projectId;
    this.router.navigate(['/quote-project', projectId]);
  }

  public async onSubmit(): Promise<void> {
    if (!this.contractorProposalFormGroup.valid) {
      return;
    }

    if (this.resp200.isOpen) this.resp200.close();
    if (this.resp500.isOpen) this.resp500.close();

    this.submitting = true;
    const value = JSON.parse(JSON.stringify(this.contractorProposalFormGroup.value));
    value.projectId = this.activatedRoute.snapshot.params.projectId;
    const resp = await this.apiRequestService.post('/api/proposal-decline', value);

    switch (resp.status) {
      case 200:
      case 201:
        this.analytics.pageAction(this.analytics.eventAction.user.contractor.proposal.declined);
        this.contractorProposalFormGroup.reset();
        this.resp200.open();
        break;
      default:
        this.resp500.open();
    }

    this.submitting = false;
  }

}
