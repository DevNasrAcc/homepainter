import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ScheduleRoutingModule} from './schedule-routing.module';
import {ScheduleComponent} from './schedule.component';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [ScheduleComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    ReactiveFormsModule
  ]
})
export class ScheduleModule { }
