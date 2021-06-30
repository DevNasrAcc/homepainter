import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from '../../../services/local-storage.service';
import {Customer} from '../../../models/user/customer';
import {Router} from '@angular/router';
import {AnalyticsService} from '../../../services/analytics.service';
import {Details} from '../../../models/project/details/details';
import {ProjectService} from "../../../models/user/project.service";
import {ChargeDetails} from "../../../models/charge-details";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {Project} from "../../../models/project/project";

@Component({
  selector: 'project-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.less']
})
export class NoticesComponent implements OnInit {

  private readonly ANALYTICS_STEP_NUMBER: number = 1;
  public customer: Customer;
  public project: Project;
  public pending: boolean;
  public chargeDetails: ChargeDetails;
  public finalDetailsModal: { open: boolean, details: Details };

  constructor(private localStorageService: LocalStorageService, private projectService: ProjectService,
              private router: Router, private analytics: AnalyticsService, private materialize: Angular2MaterializeV1Service) {
    this.customer = localStorageService.getCustomer();
    this.project = localStorageService.getActiveProject();
    this.pending = false;
    this.chargeDetails = new ChargeDetails();
    this.finalDetailsModal = { open: false, details: this.project.details };
  }

  async ngOnInit() {
    this.pending = true;
    this.chargeDetails = await this.projectService.getChargeDetails(this.customer, this.project);
    this.pending = false;

    const details = this.analytics.eventAction.checkout.stepViewed;
    details.label.value = 'notices';
    details.value.value = this.chargeDetails.subtotal;
    details.step.value = this.ANALYTICS_STEP_NUMBER;
    this.analytics.pageAction(details);
  }

  public onEditDetailsClicked(): void {}

  public onViewDetailsClicked(): void {
    this.finalDetailsModal.open = true;
  }

  public onCloseFinalDetails(): void {
    this.finalDetailsModal.open = false;
  }

  public async onGetDiscountClicked(promoCode: string) {
    const oldDiscount = this.chargeDetails.discount;
    this.project.promoCode = promoCode;
    this.localStorageService.saveActiveProject(this.project);
    this.pending = true;
    this.chargeDetails = await this.projectService.getChargeDetails(this.customer, this.project);
    this.pending = false;

    if (this.chargeDetails.discount !== oldDiscount && this.chargeDetails.discount === 0)
      this.materialize.toast({html: 'Discount removed!', displayLength: 4000});
    else
      this.materialize.toast({html: 'Discount applied!', displayLength: 4000});
  }

  public onCheckoutButtonClick() {
    const details = this.analytics.eventAction.checkout.stepCompleted;
    details.label.value = 'notices';
    details.value.value = this.chargeDetails.subtotal;
    details.step.value = this.ANALYTICS_STEP_NUMBER;
    this.analytics.pageAction(details);

    this.router.navigateByUrl('/checkout/final');
  }
}
