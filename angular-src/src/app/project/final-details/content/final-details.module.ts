import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FinalDetailsComponent} from './final-details.component';
import {TooltipModule} from '../../../libraries/materialize/tooltip/tooltip.module';
import {FormsModule} from '@angular/forms';
import {PipesModule} from '../../../pipes/pipes.module';
import {RouterModule} from '@angular/router';
import {UploadPhotoElementModule} from "../../../elements/upload-photo-element/upload-photo-element.module";
import {DisplayPhotoElementModule} from "../../../elements/display-photo-element/display-photo-element.module";
import {AgmCoreModule} from "@agm/core";

@NgModule({
  declarations: [FinalDetailsComponent],
  imports: [
    CommonModule,
    TooltipModule,
    FormsModule,
    PipesModule,
    RouterModule,
    UploadPhotoElementModule,
    DisplayPhotoElementModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBtxkaNE0indRo7yCet1JwKcdONfGEVvq4'
    })
  ],
  exports: [
    FinalDetailsComponent
  ]
})
export class FinalDetailsModule {
}
