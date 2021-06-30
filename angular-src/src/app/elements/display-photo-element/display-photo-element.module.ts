import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DisplayPhotoElementComponent} from './display-photo-element.component';


@NgModule({
    declarations: [DisplayPhotoElementComponent],
    exports: [
        DisplayPhotoElementComponent
    ],
    imports: [
        CommonModule
    ]
})
export class DisplayPhotoElementModule { }
