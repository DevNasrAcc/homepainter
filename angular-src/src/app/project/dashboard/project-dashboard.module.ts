import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectDashboardRoutingModule} from './project-dashboard-routing.module';
import {TooltipModule} from '../../libraries/materialize/tooltip/tooltip.module';
import {ProjectDashboardComponent} from './project-dashboard.component';
import {UserManagementModule} from '../../user-management/user-management.module';
import {PipesModule} from '../../pipes/pipes.module';
import {FinalDetailsModule} from '../final-details/content/final-details.module';
import {FinalDetailsModalModule} from '../final-details/modal/final-details-modal.module';
import {GeneralFeedbackElementModule} from '../../elements/general-feedback-element/general-feedback-element.module';
import {DetailsComponent} from './components/details/details.component';
import {FooterModule} from '../../libraries/materialize/footer/footer.module';
import {AgmCoreModule} from '@agm/core';
import {DisplayPhotoElementModule} from '../../elements/display-photo-element/display-photo-element.module';
import {ExplorePaintersComponent} from './components/explore-painters/explore-painters.component';
import {QuotesComponent} from './components/quotes/quotes.component';
import {HireComponent} from './components/hire/hire.component';
import {PreloaderSpinnerModule} from '../../libraries/materialize/preloader-spinner/preloader-spinner.module';
import {PhotosOfPastWorkComponent} from './components/photos-of-past-work/photos-of-past-work.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StarRatingModule} from '../../elements/star-rating/star-rating.module';

@NgModule({
  declarations: [
    ProjectDashboardComponent,
    DetailsComponent,
    ExplorePaintersComponent,
    QuotesComponent,
    HireComponent,
    PhotosOfPastWorkComponent
  ],
  exports: [
    PhotosOfPastWorkComponent
  ],
  imports: [
    CommonModule,
    ProjectDashboardRoutingModule,
    TooltipModule,
    UserManagementModule,
    PipesModule,
    FinalDetailsModule,
    FinalDetailsModalModule,
    GeneralFeedbackElementModule,
    FooterModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBtxkaNE0indRo7yCet1JwKcdONfGEVvq4'
    }),
    DisplayPhotoElementModule,
    PreloaderSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    StarRatingModule
  ]
})
export class ProjectDashboardModule {
}
