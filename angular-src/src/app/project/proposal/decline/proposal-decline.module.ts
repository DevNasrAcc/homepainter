import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProposalDeclineRoutingModule} from './proposal-decline-routing.module';
import {ProposalDeclineComponent} from './proposal-decline.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FinalDetailsModule} from '../../final-details/content/final-details.module';

@NgModule({
  declarations: [ProposalDeclineComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProposalDeclineRoutingModule,
    FinalDetailsModule
  ]
})
export class ProposalDeclineModule { }
