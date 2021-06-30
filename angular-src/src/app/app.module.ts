import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {NavBarComponent} from './libraries/materialize/nav-bar/nav-bar.component';
import {environment} from '../environments/environment';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import {HomeComponent} from './static/home/home.component';
import {PageNotFoundComponent} from './static/page-not-found/page-not-found.component';
import {FooterModule} from './libraries/materialize/footer/footer.module';
import {LogInComponent} from './user-management/log-in/log-in.component';
import {RouterExtService} from './services/router-ext.service';
import {ResetPasswordComponent} from './user-management/reset-password/reset-password.component';
import {PasswordStrengthMeterModule} from 'angular-password-strength-meter';
import {DisplayNameToPictureModule} from './elements/display-name-to-picture/display-name-to-picture.module';
import {ViewProjectComponent} from './static/view-project/view-project.component';
import {ImageViewerComponent} from './image-viewer/image-viewer.component';
import {PipesModule} from './pipes/pipes.module';
import {StarRatingModule} from './elements/star-rating/star-rating.module';
import {NgxJsonLdModule} from 'ngx-json-ld';
import {TransferHttpCacheModule} from "@nguniversal/common";

@NgModule({
    declarations: [
        AppComponent,
        NavBarComponent,
        HomeComponent,
        PageNotFoundComponent,
        LogInComponent,
        ResetPasswordComponent,
        ViewProjectComponent,
        ImageViewerComponent
    ],
  imports: [
    BrowserModule.withServerTransition({appId: `${environment.appName}`}),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientXsrfModule,
    TransferHttpCacheModule,
    FooterModule,
    PasswordStrengthMeterModule,
    DisplayNameToPictureModule,
    PipesModule,
    StarRatingModule,
    NgxJsonLdModule,
  ],
  providers: [RouterExtService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
