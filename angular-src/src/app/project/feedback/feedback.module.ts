import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackComponent } from './feedback.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [FeedbackComponent],
  exports: [
    FeedbackComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class FeedbackModule { }
