import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CheckoutRoutingModule} from './checkout-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PipesModule} from '../pipes/pipes.module';
import {CheckoutComponent} from './checkout.component';
import {StripeComponent} from './components/stripe/stripe.component';
import {FinalComponent} from './components/final/final.component';
import {NoticesComponent} from './components/notices/notices.component';
import {FinalDetailsModalModule} from '../project/final-details/modal/final-details-modal.module';
import {CheckoutElementComponent} from './components/checkout-element/checkout-element.component';
import {StarRatingModule} from '../elements/star-rating/star-rating.module';
import {PreloaderSpinnerModule} from '../libraries/materialize/preloader-spinner/preloader-spinner.module';

@NgModule({
  declarations: [CheckoutComponent, FinalComponent, NoticesComponent, StripeComponent, CheckoutElementComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckoutRoutingModule,
    PipesModule,
    FinalDetailsModalModule,
    StarRatingModule,
    PreloaderSpinnerModule
  ]
})
export class CheckoutModule { }
