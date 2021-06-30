import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CustomerAbandonedProjectRoutingModule} from './customer-abandoned-project-routing.module';
import {CustomerAbandonedProjectComponent} from './customer-abandoned-project.component';
import {GeneralFeedbackElementModule} from '../../elements/general-feedback-element/general-feedback-element.module';

@NgModule({
  declarations: [CustomerAbandonedProjectComponent],
    imports: [
        CommonModule,
        CustomerAbandonedProjectRoutingModule,
        GeneralFeedbackElementModule
    ]
})
export class CustomerAbandonedProjectModule { }
