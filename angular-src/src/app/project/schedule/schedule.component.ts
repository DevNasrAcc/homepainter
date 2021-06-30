import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {environment} from '../../../environments/environment';
import {AnalyticsService} from '../../services/analytics.service';
import {Contractor} from "../../models/user/contractor";
import {LocalStorageService} from "../../services/local-storage.service";
import {ContractorService} from "../../models/user/contractor.service";
import {BannerService} from "../../libraries/banner/banner.service";
import {ApiRequestService} from "../../services/api-request.service";

@Component({
  selector: 'project-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.less']
})
export class ScheduleComponent implements OnInit, AfterViewInit, OnDestroy {

  private startDateInstance: any;
  private endDateInstance: any;

  public contractor: Contractor;
  public projectScheduleFormGroup: FormGroup;
  public submitting: boolean;
  private resp200: any;
  private resp500: any;

  constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router,
              private materialize: Angular2MaterializeV1Service, private apiRequestService: ApiRequestService,
              private analytics: AnalyticsService, private localStorageService: LocalStorageService,
              private contractorService: ContractorService, private bannerService: BannerService) {
    this.submitting = false;
    this.projectScheduleFormGroup = formBuilder.group({
      startDate: [{value: '', disabled: true}, [Validators.required]],
      endDate: [{value: '', disabled: true}, [Validators.required]]
    });
    this.contractor = new Contractor();
  }

  async ngOnInit() {
    this.analytics.pageAction(this.analytics.eventAction.project.schedule.started);

    this.contractor = await this.contractorService.retrieveContractor();

    if (this.contractor.accountStatus !== 'approved') {
      this.projectScheduleFormGroup.get('startDate').enable();
    }
  }

  ngAfterViewInit(): void {
    const options = {
      autoClose: true,
      minDate: new Date(),
      onSelect: () => this.onSelect()
    };
    this.startDateInstance = this.materialize.initDatepicker('#startDate', options);
    this.endDateInstance = this.materialize.initDatepicker('#endDate', options);
    this.materialize.updateTextFields();

    this.resp200 = this.bannerService.init('#resp200');
    this.resp500 = this.bannerService.init('#resp500');
  }

  ngOnDestroy(): void {
    this.bannerService.destroyAll();
  }

  private onSelect() {
    const startDate = this.projectScheduleFormGroup.get('startDate');
    startDate.setValue(this.startDateInstance.toString());

    // set end date to undefined if it's after start date
    if (this.endDateInstance.date < this.startDateInstance.date) {
      this.endDateInstance.setDate(undefined);
    }

    const endDate = this.projectScheduleFormGroup.get('endDate');
    endDate.setValue(this.endDateInstance.toString());
    this.materialize.updateTextFields();

    if (startDate.valid) {
      this.endDateInstance.options.minDate = this.startDateInstance.date;
      endDate.enable();
    }
    else {
      endDate.disable();
    }

    const details = this.analytics.eventAction.project.schedule.updated;
    details.label.value = 'date';
    this.analytics.pageAction(details);
  }

  public async onSubmit(): Promise<void> {
    if (!this.projectScheduleFormGroup.valid || environment.angularServe) {
      return;
    }
    if (this.resp200.isOpen) this.resp200.close();
    if (this.resp500.isOpen) this.resp500.close();

    this.submitting = true;
    const value = this.projectScheduleFormGroup.value;
    value.orderId = this.activatedRoute.snapshot.params.orderId;
    const resp = await this.apiRequestService.post('/api/submit-project-schedule', value);

    switch (resp.status) {
      case 200:
      case 201:
        this.analytics.pageAction(this.analytics.eventAction.project.schedule.completed);
        this.projectScheduleFormGroup.reset();
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
}
