import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BecomeAProRoutingModule } from './become-a-pro-routing.module';
import { BecomeAProComponent } from './become-a-pro.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    BecomeAProComponent
  ],
  imports: [
    CommonModule,
    BecomeAProRoutingModule,
    ReactiveFormsModule
  ]
})
export class BecomeAProModule { }
