import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormDetailsRoutingModule} from './form-details-routing.module';
import {FormsModule} from '@angular/forms';
import {TooltipModule} from '../../libraries/materialize/tooltip/tooltip.module';
import {AreaNotServicedComponent} from './components/area-not-serviced/area-not-serviced.component';
import {ExteriorDetailsComponent} from './components/exterior-details/exterior-details.component';
import {ExteriorSelectorComponent} from './components/exterior-selector/exterior-selector.component';
import {NavigationComponent} from './components/navigation/navigation.component';
import {ProgressBarComponent} from './components/progress-bar/progress-bar.component';
import {ProjectSelectorComponent} from './components/project-selector/project-selector.component';
import {ReviewComponent} from './components/review/review.component';
import {RoomDetailsComponent} from './components/room-details/room-details.component';
import {RoomDetailsSelectComponent} from './components/room-details/room-details-select/room-details-select.component';
import {RoomSelectorComponent} from './components/room-selector/room-selector.component';
import {SchedulerComponent} from './components/scheduler/scheduler.component';
import {SquareIncrementerComponent} from './components/square-incrementer/square-incrementer.component';
import {TypeOfHomeComponent} from './components/type-of-home/type-of-home.component';
import {ZipCodeComponent} from './components/zip-code/zip-code.component';
import {SelectModule} from '../../libraries/materialize/select/select.module';
import {PipesModule} from '../../pipes/pipes.module';
import {RouterModule} from '@angular/router';
import {UserManagementModule} from '../../user-management/user-management.module';
import {PaintSupplyComponent} from './components/paint-supply/paint-supply.component';
import {FormDetailsComponent} from './form-details.component';
import {OccupancyComponent} from './components/occupancy/occupancy.component';
import {FinalDetailsModule} from '../final-details/content/final-details.module';
import {PhotosComponent} from './components/photos/photos.component';
import {UploadPhotoElementModule} from '../../elements/upload-photo-element/upload-photo-element.module';
import {DisplayPhotoElementModule} from '../../elements/display-photo-element/display-photo-element.module';
import {GeneralFeedbackElementModule} from '../../elements/general-feedback-element/general-feedback-element.module';
import {ProjectSummaryComponent} from './components/project-summary/project-summary.component';

@NgModule({
  declarations: [
    AreaNotServicedComponent,
    FormDetailsComponent,
    ExteriorDetailsComponent,
    ExteriorSelectorComponent,
    NavigationComponent,
    ProgressBarComponent,
    ProjectSelectorComponent,
    ReviewComponent,
    RoomDetailsComponent,
    RoomDetailsSelectComponent,
    RoomSelectorComponent,
    SchedulerComponent,
    SquareIncrementerComponent,
    TypeOfHomeComponent,
    ZipCodeComponent,
    PaintSupplyComponent,
    OccupancyComponent,
    PhotosComponent,
    ProjectSummaryComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        FormDetailsRoutingModule,
        SelectModule,
        TooltipModule,
        PipesModule,
        UserManagementModule,
        FinalDetailsModule,
        UploadPhotoElementModule,
        DisplayPhotoElementModule,
        GeneralFeedbackElementModule
    ]
})
export class FormDetailsModule { }
