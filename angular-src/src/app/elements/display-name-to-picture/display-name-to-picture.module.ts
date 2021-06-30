import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DisplayNameToPictureComponent} from './display-name-to-picture.component';


@NgModule({
    declarations: [DisplayNameToPictureComponent],
    exports: [
        DisplayNameToPictureComponent
    ],
    imports: [
        CommonModule
    ]
})
export class DisplayNameToPictureModule { }
