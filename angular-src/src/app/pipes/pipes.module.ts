import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageName2DisplayName } from './StorageName2DisplayName';
import { LimitMessage } from './limitMessage';
import { Phone } from './phone.pipe';
import {FileSizePipe} from "./fileSize.pipe";


@NgModule({
  declarations: [
    StorageName2DisplayName,
    LimitMessage,
    Phone,
    FileSizePipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    StorageName2DisplayName,
    LimitMessage,
    Phone,
    FileSizePipe,
  ]
})
export class PipesModule { }
