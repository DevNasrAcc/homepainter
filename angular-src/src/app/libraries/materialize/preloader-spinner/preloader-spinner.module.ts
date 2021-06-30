import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloaderSpinnerComponent } from './preloader-spinner.component';



@NgModule({
  declarations: [PreloaderSpinnerComponent],
  exports: [
    PreloaderSpinnerComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PreloaderSpinnerModule { }
