import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Details} from '../../../../models/project/details/details';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {DetailsCommunicationService} from '../../services/details-communication.service';
import {AnalyticsService} from '../../../../services/analytics.service';

@Component({
  selector: 'form-details-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.less']
})

export class SchedulerComponent implements OnInit, AfterViewInit {
  public details: Details;
  private datePickerInstance: any;
  private selectTimeFrameStartInstance: any;
  private selectTimeFrameEndInstance: any;

  constructor(private localStorageService: LocalStorageService, private detailsCommunicationService: DetailsCommunicationService,
              private materialize: Angular2MaterializeV1Service, private analytics: AnalyticsService) {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);

    if (this.details.timeFrameStart === '') {
      this.details.timeFrameStart = 'flexibleStartDate';
    }
    if (this.details.timeFrameEnd === '') {
      this.details.timeFrameEnd = 'flexibleEndDate';
    }

    this.validateForm();
  }

  ngOnInit() {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'scheduler';
    this.analytics.pageAction(details);
  }

  ngAfterViewInit(): void {
    this.initDatePicker();
    this.selectTimeFrameStartInstance = this.materialize.initSelect('#time-frame-start');
    this.selectTimeFrameEndInstance = this.materialize.initSelect('#time-frame-end');
  }

  private initDatePicker() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const endAtLeastOneWeekFromNow = new Date(year, month, day + 7);

    this.datePickerInstance = this.materialize.initDatepicker('#expectedEndDate', {
      autoClose: true,
      defaultDate: new Date(this.details.expectedEndDate || endAtLeastOneWeekFromNow),
      setDefaultDate: !!this.details.expectedEndDate,
      minDate: endAtLeastOneWeekFromNow,
    });
  }

  public onSelectTimeFrameStart(evt) {
    this.details.timeFrameStart = evt.target.value;

    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'scheduler';
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public onSelectTimeFrameEnd(evt) {
    this.details.timeFrameEnd = evt.target.value;
    if (!this.datePickerInstance) {
      this.initDatePicker();
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'scheduler';
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public onSelectedEndDate(evt) {
    this.details.expectedEndDate = evt.target.value;

    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'scheduler';
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public validateForm(): void {
    const valid = this.details.validateTimeFrameStart() && this.details.validateTimeFrameEnd();
    this.detailsCommunicationService.formEvent(this.details, valid);
  }
}


