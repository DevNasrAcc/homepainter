import {AfterViewInit, Component, OnInit} from '@angular/core';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Details} from '../../../../models/project/details/details';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {AnalyticsService} from '../../../../services/analytics.service';
import {DetailsCommunicationService} from '../../services/details-communication.service';

@Component({
  selector: 'form-details-paint-supply',
  templateUrl: './paint-supply.component.html',
  styleUrls: ['./paint-supply.component.less']
})
export class PaintSupplyComponent implements OnInit, AfterViewInit {

  public details: Details;
  private selectInstance: any;

  constructor(private localStorageService: LocalStorageService, private detailsCommunicationService: DetailsCommunicationService, private materialize: Angular2MaterializeV1Service, private analytics: AnalyticsService) {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);

    if (this.details.paintSupplier === '') {
      this.details.paintSupplier = 'painter';
      localStorageService.saveProjectDetails(this.details);
    }

    this.validateForm();
  }

  ngOnInit() {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'paint_supply';
    this.analytics.pageAction(details);
  }

  ngAfterViewInit(): void {
    this.selectInstance = this.materialize.initSelect('#whoSuppliesPaint');
  }

  public changeOption(evt) {
    this.details.paintSupplier = evt.target.value;
    this.validateForm();
  }

  public onSelectedPaintBrand(evt) {
    this.details.paintBrand = evt.target.value;
    this.validateForm();
  }

  public onSelectedPaintProduct(evt) {
    this.details.paintProduct = evt.target.value;
    this.validateForm();
  }

  private validateForm(): void {
    const valid = this.details.validatePaintSupplier();

    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'paint_supplier';
    this.analytics.pageAction(details);

    this.detailsCommunicationService.formEvent(this.details, valid);
  }
}
