import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ContactInfoComponent} from './contact-info/contact-info.component';
import {FormsModule} from '@angular/forms';
// import {LogInComponent} from './log-in/log-in.component';
// import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {SignUpComponent} from './sign-up/sign-up.component';
import {RouterModule} from "@angular/router";
import { ReactiveFormsModule } from '@angular/forms';
import {PreloaderSpinnerModule} from "../libraries/materialize/preloader-spinner/preloader-spinner.module";


@NgModule({
  declarations: [
    ContactInfoComponent,
    // LogInComponent,
    SignUpComponent,
    // ResetPasswordComponent,
  ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        PreloaderSpinnerModule
    ],
  exports: [
    ContactInfoComponent,
    // LogInComponent,
    // ResetPasswordComponent,
    SignUpComponent
  ]
})
export class UserManagementModule {
}
