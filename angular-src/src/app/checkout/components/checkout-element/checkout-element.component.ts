import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Details} from '../../../models/project/details/details';
import {Proposal} from '../../../models/project/proposal/proposal';
import {ChargeDetails} from '../../../models/charge-details';


@Component({
  selector: 'checkout-element[projectDetails][proposal][promoCode][chargeDetails][btnText][btnEnabled][pending][editDetailsClicked][viewDetailsClicked][checkoutButtonClicked][getDiscountClicked]',
  templateUrl: './checkout-element.component.html',
  styleUrls: ['./checkout-element.component.less']
})
export class CheckoutElementComponent implements OnInit {

  @Input() projectDetails: Details;
  @Input() proposal: Proposal;
  @Input() promoCode: string;
  @Input() chargeDetails: ChargeDetails;
  @Input() btnText: string;
  @Input() btnEnabled: boolean;
  @Input() pending: boolean;

  @Output() removePainterClicked: EventEmitter<void>;
  @Output() editDetailsClicked: EventEmitter<void>;
  @Output() viewDetailsClicked: EventEmitter<void>;
  @Output() checkoutButtonClicked: EventEmitter<void>;
  @Output() getDiscountClicked: EventEmitter<string>;

  constructor() {
    this.removePainterClicked = new EventEmitter<void>();
    this.viewDetailsClicked = new EventEmitter<void>();
    this.editDetailsClicked = new EventEmitter<void>();
    this.checkoutButtonClicked = new EventEmitter<void>();
    this.getDiscountClicked = new EventEmitter<string>();

    this.projectDetails = new Details();
    this.proposal = new Proposal();
    this.btnText = '';
    this.btnEnabled = false;
    this.pending = false;
    this.chargeDetails = new ChargeDetails();
  }

  ngOnInit() {
  }

  public onRemovePainterClicked(): void {
    this.removePainterClicked.emit();
  }

  public onEditDetailsClicked(): void {
    this.editDetailsClicked.emit();
  }

  public onViewDetailsClicked(): void {
    this.viewDetailsClicked.emit();
  }

  public onSubmitPromoCode(): void {
    this.getDiscountClicked.emit(this.promoCode);
  }

  public onCheckoutButtonClick(): void {
    this.checkoutButtonClicked.emit();
  }

}
