import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GeneralFeedbackElementComponent} from './general-feedback-element.component';
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [GeneralFeedbackElementComponent],
  exports: [
    GeneralFeedbackElementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class GeneralFeedbackElementModule { }
