import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AnalyticsService} from '../../services/analytics.service';
import {Angular2MaterializeV1Service} from 'angular2-materialize-v1';
import {BannerService} from '../../libraries/banner/banner.service';
import {ApiRequestService} from '../../services/api-request.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.less']
})
export class ContactUsComponent implements OnInit, AfterViewInit, OnDestroy {

  private resp200: any;
  private resp500: any;
  public subjects: string[] = [
    'General Inquiry',
    'Login or Technical Issues',
    'Services',
    'Estimate Help',
    'Becoming a registered painter',
    'Media / Press',
    'File a complaint'
  ];

  constructor(private apiRequestService: ApiRequestService, private materialize: Angular2MaterializeV1Service,
              private analytics: AnalyticsService, private bannerService: BannerService) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.materialize.initSelect('select');
    this.resp200 = this.bannerService.init('#resp200');
    this.resp500 = this.bannerService.init('#resp500');
  }

  ngOnDestroy(): void {
    this.bannerService.destroyAll();
  }

  public async onSubmit(form: NgForm) {
    if (this.resp500.isOpen) { this.resp500.close(); }
    if (this.resp200.isOpen) { this.resp200.close(); }

    const resp = await this.apiRequestService.post('/api/contact-us', form.value);

    switch (resp.status) {
      case 200:
      case 201:
        form.resetForm();
        this.resp200.open();
        break;
      case 404:
        this.materialize.toast({html: 'Url was not found', displayLength: 3000});
        break;
      default:
        this.resp500.open();
    }
  }

  public externalLinkClick(link) {
    const details = this.analytics.eventAction.static.externalLinkClicked;
    details.label.value = link;
    this.analytics.pageAction(details);
  }
}
