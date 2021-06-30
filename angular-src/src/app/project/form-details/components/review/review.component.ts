import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Details} from '../../../../models/project/details/details';
import {DetailsCommunicationService} from '../../services/details-communication.service';
import {AnalyticsService} from '../../../../services/analytics.service';

@Component({
  selector: 'form-details-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.less']
})
export class ReviewComponent implements OnInit {

  public details: Details;

  constructor(private localStorageService: LocalStorageService, private detailsCommunicationService: DetailsCommunicationService,
              private analytics: AnalyticsService)
  {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);
    this.detailsCommunicationService.formEvent(this.details, true);
  }

  ngOnInit() {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'review';
    this.analytics.pageAction(details);
  }

}

