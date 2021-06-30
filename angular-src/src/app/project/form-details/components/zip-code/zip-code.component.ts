import {Component, OnInit} from '@angular/core';
import {Details} from '../../../../models/project/details/details';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {AnalyticsService} from '../../../../services/analytics.service';
import {DetailsCommunicationService} from '../../services/details-communication.service';

@Component({
  selector: 'form-details-zip-code',
  templateUrl: './zip-code.component.html',
  styleUrls: ['./zip-code.component.less']
})
export class ZipCodeComponent implements OnInit {

  public details: Details;

  constructor(public localStorageService: LocalStorageService,
              private detailsCommunicationService: DetailsCommunicationService, private analytics: AnalyticsService)
  {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);
    this.validateForm(false);
  }

  ngOnInit() {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'zip_code';
    this.analytics.pageAction(details);
  }

  public trackPageAction(): void {
    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'zip_code';
    this.analytics.pageAction(details);
  }

  public validateForm(forceNavigate): void {
    const valid = this.details.address.validateJobLocation();
    this.detailsCommunicationService.formEvent(this.details, valid, forceNavigate);
  }

}
