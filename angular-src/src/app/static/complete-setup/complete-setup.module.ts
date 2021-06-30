import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CompleteSetupRoutingModule} from './complete-setup-routing.module';
import {CompleteSetupComponent} from './complete-setup.component';

@NgModule({
  declarations: [CompleteSetupComponent],
  imports: [
    CommonModule,
    CompleteSetupRoutingModule
  ]
})
export class CompleteSetupModule { }
