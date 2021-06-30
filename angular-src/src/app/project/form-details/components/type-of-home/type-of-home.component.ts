import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Details} from '../../../../models/project/details/details';
import {AnalyticsService} from '../../../../services/analytics.service';
import {DetailsCommunicationService} from '../../services/details-communication.service';

@Component({
  selector: 'form-details-type-of-home',
  templateUrl: './type-of-home.component.html',
  styleUrls: ['./type-of-home.component.less']
})
export class TypeOfHomeComponent implements OnInit {

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
    details.label.value = 'type_of_home';
    this.analytics.pageAction(details);
  }

  public changeTypeOfHome(type): void {
    this.details.jobType = type;

    if(this.details.interior.length > 0)
      this.details.interior.splice(0);

    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'type_of_home';
    this.analytics.pageAction(details);

    this.validateForm(true);
  }

  private validateForm(forceNavigate: boolean): void {
    const valid = this.details.validateJobType();
    this.detailsCommunicationService.formEvent(this.details, valid, forceNavigate);
  }

}
