import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProposalAcceptRoutingModule} from './proposal-accept-routing.module';
import {ProposalAcceptComponent} from './proposal-accept.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FinalDetailsModule} from '../../final-details/content/final-details.module';

@NgModule({
  declarations: [ProposalAcceptComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProposalAcceptRoutingModule,
    FinalDetailsModule
  ]
})
export class ProposalAcceptModule { }
