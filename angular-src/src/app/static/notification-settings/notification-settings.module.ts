import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NotificationSettingsRoutingModule} from './notification-settings-routing.module';
import {NotificationSettingsComponent} from './notification-settings.component';
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [NotificationSettingsComponent],
    imports: [
        CommonModule,
        NotificationSettingsRoutingModule,
        ReactiveFormsModule
    ]
})
export class NotificationSettingsModule { }
