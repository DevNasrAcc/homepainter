import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UploadPhotoElementComponent} from "./upload-photo-element.component";
import {PipesModule} from "../../pipes/pipes.module";


@NgModule({
  declarations: [UploadPhotoElementComponent],
    imports: [
        CommonModule,
        PipesModule
    ],
  exports: [
    UploadPhotoElementComponent
  ]
})
export class UploadPhotoElementModule { }
