import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ContractorCompleteRoutingModule} from './contractor-complete-routing.module';
import {ContractorCompleteComponent} from './contractor-complete.component';
import {ReactiveFormsModule} from '@angular/forms';
import {FeedbackModule} from '../feedback/feedback.module';

@NgModule({
  declarations: [ContractorCompleteComponent],
  imports: [
    CommonModule,
    ContractorCompleteRoutingModule,
    ReactiveFormsModule,
    FeedbackModule
  ]
})
export class ContractorCompleteModule { }
