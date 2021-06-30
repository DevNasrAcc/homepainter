import {Component, EventEmitter, Inject, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {StripeService} from '../../../services/stripe.service';
import {isPlatformServer} from '@angular/common';
import {StripeData} from './stripe.data';

declare var Stripe;

@Component({
  selector: 'stripe-elements[infoUpdated]',
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.less']
})
export class StripeComponent implements OnInit {

  public fields: {
    cardNumber: {complete: boolean, error: string},
    cardExpiry: {complete: boolean, error: string},
    cardCvc: {complete: boolean, error: string}
  };
  private stripeData: StripeData;

  @Output() infoUpdated: EventEmitter<StripeData>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private stripeService: StripeService) {
    this.fields = {
      cardNumber: {complete: false, error: ''},
      cardExpiry: {complete: false, error: ''},
      cardCvc: {complete: false, error: ''}
    };
    this.stripeData = new StripeData();
    this.infoUpdated = new EventEmitter<StripeData>();
  }

  async ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const apiKey = await this.stripeService.getStripePublishableKey();
    this.stripeData.stripe = Stripe(apiKey);
    const elements = this.stripeData.stripe.elements();

    const styles = {
      base: {
        color: '#384F69',
        fontWeight: 400,
        fontFamily: 'Fira Sans, Roboto, Open Sans',
        fontSize: '16px',
        '::placeholder': { color: '#9e9e9e' }
      },
      invalid: { color: '#384F69', '::placeholder': { color: '#384F69' } }
    };
    const classes = { focus: 'focused', empty: 'empty', invalid: 'invalid', complete: 'complete' };

    this.initElement(elements, 'cardNumber', styles, classes);
    this.initElement(elements, 'cardExpiry', styles, classes);
    this.initElement(elements, 'cardCvc', styles, classes);
  }

  private initElement(elements: any, elementType: string, styles: any, classes: any) {
    this.stripeData.element = elements.create(elementType, {
      style: styles,
      classes: classes,
    });
    this.stripeData.element.on('focus', o => this.onFocus(o));
    this.stripeData.element.on('blur', o => this.onBlur(o));
    this.stripeData.element.on('keyup', o => this.onKeyup(o));
    this.stripeData.element.on('change', o => this.onChange(o));
    this.stripeData.element.mount('#' + this.getElementFromElementType(elementType));
  }

  private onFocus(obj: any) {
    const element = this.getElementFromElementType(obj.elementType);
    document.getElementById(element).classList.add('focused');
  }

  private onBlur(obj: any) {
    const element = this.getElementFromElementType(obj.elementType);
    if (document.getElementById(element))
      document.getElementById(element).classList.remove('focused');
  }

  private onKeyup(obj: any) {
    const element = this.getElementFromElementType(obj.elementType);
    if (element.value.length === 0) {
      element.classList.add('empty');
    } else {
      element.classList.remove('empty');
    }
  }

  private onChange(obj: any) {
    this.fields[obj.elementType].complete = obj.complete;
    this.fields[obj.elementType].error = obj.error ? obj.error.message : '';

    this.stripeData.complete =
      this.fields.cardNumber.complete
      && this.fields.cardExpiry.complete
      && this.fields.cardCvc.complete;

    this.infoUpdated.emit(this.stripeData);
  }

  private getElementFromElementType(elementType) {
    let element = elementType.split(/(?=[A-Z])/);
    element[1] = element[1].charAt(0).toLowerCase() + element[1].substring(1);
    return element.join('-');
  }
}
