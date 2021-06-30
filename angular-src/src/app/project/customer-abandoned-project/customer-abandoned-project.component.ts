import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {AnalyticsService} from "../../services/analytics.service";
import {BannerService} from "../../libraries/banner/banner.service";
import {ApiRequestService} from "../../services/api-request.service";

@Component({
  selector: 'app-customer-abandoned-project',
  templateUrl: './customer-abandoned-project.component.html',
  styleUrls: ['./customer-abandoned-project.component.less']
})
export class CustomerAbandonedProjectComponent implements OnInit, AfterViewInit, OnDestroy {

  private resp200: any;
  private resp500: any;

  constructor(private activatedRoute: ActivatedRoute, private materialize: Angular2MaterializeV1Service,
              private analytics: AnalyticsService, private router: Router, private apiRequestService: ApiRequestService,
              private bannerService: BannerService)
  {}

  ngOnInit() {
    this.analytics.pageAction(this.analytics.eventAction.project.customerAbandonedProjectFeedback.started);
  }

  ngAfterViewInit(): void {
    this.resp200 = this.bannerService.init('#resp200');
    this.resp500 = this.bannerService.init('#resp500');
  }

  ngOnDestroy(): void {
    this.bannerService.destroyAll();
  }

  public trackPageAction(value: any) {
    const details = this.analytics.eventAction.project.customerAbandonedProjectFeedback.updated.clone();
    details.label.value = value;
    this.analytics.pageAction(details);
  }

  public async onSubmit(event: {value: any, cb: Function}) {
    if (this.resp200.isOpen) this.resp200.close();
    if (this.resp500.isOpen) this.resp500.close();

    const resp = await this.apiRequestService.post('/api/general-feedback', event.value);

    switch (resp.status) {
      case 200:
      case 201:
        this.analytics.pageAction(this.analytics.eventAction.project.customerAbandonedProjectFeedback.completed);
        this.resp200.open();
        event.cb(true);
        break;
      case 404:
        this.materialize.toast({html: 'Url not found.', displayLength: 3000});
        event.cb(false);
        break;
      default:
        this.resp500.open();
        event.cb(false);
    }
  }
}
