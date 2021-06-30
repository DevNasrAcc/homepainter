import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PainterProfileRoutingModule} from './painter-profile-routing.module';
import {PainterProfileComponent} from './painter-profile.component';
import {StarRatingModule} from '../elements/star-rating/star-rating.module';
import {PipesModule} from '../pipes/pipes.module';
import {ProjectDashboardModule} from '../project/dashboard/project-dashboard.module';
import {ReactiveFormsModule} from "@angular/forms";
import {PreloaderSpinnerModule} from "../libraries/materialize/preloader-spinner/preloader-spinner.module";

@NgModule({
  declarations: [PainterProfileComponent],
  imports: [
    CommonModule,
    PainterProfileRoutingModule,
    StarRatingModule,
    PipesModule,
    ProjectDashboardModule,
    ReactiveFormsModule,
    PreloaderSpinnerModule
  ]
})
export class PainterProfileModule { }
