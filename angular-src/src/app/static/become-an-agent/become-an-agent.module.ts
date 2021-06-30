import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BecomeAnAgentRoutingModule} from './become-an-agent-routing.module';
import {BecomeAnAgentComponent} from './become-an-agent.component';
import {ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [BecomeAnAgentComponent],
  imports: [
    CommonModule,
    BecomeAnAgentRoutingModule,
    ReactiveFormsModule
  ]
})
export class BecomeAnAgentModule { }
