import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MessagesRoutingModule} from './messages-routing.module';
import {MessagesComponent} from './messages.component';
import {DisplayNameToPictureModule} from '../elements/display-name-to-picture/display-name-to-picture.module';
import {ReactiveFormsModule} from '@angular/forms';
import {PickerModule} from '@ctrl/ngx-emoji-mart';

@NgModule({
  declarations: [MessagesComponent],
  imports: [
    CommonModule,
    MessagesRoutingModule,
    DisplayNameToPictureModule,
    ReactiveFormsModule,
    PickerModule
  ]
})
export class MessagesModule { }
