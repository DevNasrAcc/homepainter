import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CustomerCompleteRoutingModule} from './customer-complete-routing.module';
import {CustomerCompleteComponent} from './customer-complete.component';
import {ReactiveFormsModule} from '@angular/forms';
import {FeedbackModule} from '../feedback/feedback.module';
import {TooltipModule} from '../../libraries/materialize/tooltip/tooltip.module';

@NgModule({
  declarations: [CustomerCompleteComponent],
  imports: [
    CommonModule,
    CustomerCompleteRoutingModule,
    ReactiveFormsModule,
    FeedbackModule,
    TooltipModule
  ]
})
export class CustomerCompleteModule { }
