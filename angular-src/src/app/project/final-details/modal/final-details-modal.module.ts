import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FinalDetailsModalComponent} from './final-details-modal.component';
import {FinalDetailsModule} from '../content/final-details.module';


@NgModule({
  declarations: [FinalDetailsModalComponent],
  exports: [
    FinalDetailsModalComponent
  ],
  imports: [
    CommonModule,
    FinalDetailsModule
  ]
})
export class FinalDetailsModalModule { }
