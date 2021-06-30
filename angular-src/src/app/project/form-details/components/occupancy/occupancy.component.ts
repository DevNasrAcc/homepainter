import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Details} from '../../../../models/project/details/details';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {DetailsCommunicationService} from '../../services/details-communication.service';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {AnalyticsService} from '../../../../services/analytics.service';

@Component({
  selector: 'app-occupancy',
  templateUrl: './occupancy.component.html',
  styleUrls: ['./occupancy.component.less']
})
export class OccupancyComponent implements OnInit, AfterViewInit {

  public details: Details;
  private selectInstance: any;

  constructor(private localStorageService: LocalStorageService, private materialize: Angular2MaterializeV1Service,
              private detailsCommunicationService: DetailsCommunicationService,  private analytics: AnalyticsService)
  {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);

    if (this.details.occupancy === '') {
      this.details.occupancy = 'furnishedAndOccupied';
      localStorageService.saveProjectDetails(this.details);
    }

    this.validateForm();
  }

  ngOnInit() {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'occupancy';
    this.analytics.pageAction(details);
  }

  ngAfterViewInit(): void {
    this.selectInstance = this.materialize.initSelect('select');
  }

  public changeOption(evt) {
    this.details.occupancy = evt.target.value;
    this.validateForm();
  }

  private validateForm(): void {
    const valid = this.details.validateOccupancy();

    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'occupancy';
    this.analytics.pageAction(details);

    this.detailsCommunicationService.formEvent(this.details, valid);
  }
}
