import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AreaNotServicedComponent} from './components/area-not-serviced/area-not-serviced.component';
import {RoomSelectorComponent} from './components/room-selector/room-selector.component';
import {RoomDetailsComponent} from './components/room-details/room-details.component';
import {ProjectSelectorComponent} from './components/project-selector/project-selector.component';
import {TypeOfHomeComponent} from './components/type-of-home/type-of-home.component';
import {SchedulerComponent} from './components/scheduler/scheduler.component';
import {ExteriorDetailsComponent} from './components/exterior-details/exterior-details.component';
import {ReviewComponent} from './components/review/review.component';
import {ZipCodeComponent} from './components/zip-code/zip-code.component';
import {FormDetailsComponent} from './form-details.component';
import {PaintSupplyComponent} from './components/paint-supply/paint-supply.component';
import {OccupancyComponent} from './components/occupancy/occupancy.component';
import {PhotosComponent} from './components/photos/photos.component';
import {ExteriorSelectorComponent} from './components/exterior-selector/exterior-selector.component';
import {ProjectSummaryComponent} from './components/project-summary/project-summary.component';

const routes: Routes = [
  {
    path: 'area-not-serviced',
    canActivate: [],
    component: AreaNotServicedComponent,
    data: { name: 'area not serviced', title: 'homepainter - Area Not Serviced' }
  },
  {
    path: '',
    component: FormDetailsComponent,
    children: [
      {
        path: '',
        redirectTo: 'zip-code',
        pathMatch: 'full'
      },
      {
        path: 'zip-code',
        canActivate: [],
        component: ZipCodeComponent,
        data: { name: 'zip code', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'type-of-home',
        canActivate: [],
        component: TypeOfHomeComponent,
        data: { name: 'type of home', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'project-selector',
        canActivate: [],
        component: ProjectSelectorComponent,
        data: { name: 'project selector', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'exterior-selector',
        canActivate: [],
        component: ExteriorSelectorComponent,
        data: { name: 'exterior selector', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'exterior-details/:structureIndex',
        canActivate: [],
        component: ExteriorDetailsComponent,
        data: { name: 'exterior details', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'room-selector',
        canActivate: [],
        component: RoomSelectorComponent,
        data: { name: 'room selector', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'room-details/:roomIndex',
        canActivate: [],
        component: RoomDetailsComponent,
        data: { name: 'room details', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'photos',
        canActivate: [],
        component: PhotosComponent,
        data: { name: 'photos', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'paint-supply',
        canActivate: [],
        component: PaintSupplyComponent,
        data: { name: 'paint supply', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'occupancy',
        canActivate: [],
        component: OccupancyComponent,
        data: { name: 'occupancy', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'scheduler',
        canActivate: [],
        component: SchedulerComponent,
        data: { name: 'scheduler', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'project-summary',
        canActivate: [],
        component: ProjectSummaryComponent,
        data: { name: 'project summary', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'review',
        canActivate: [],
        component: ReviewComponent,
        data: { name: 'review', title: 'homepainter - Create Your Project' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormDetailsRoutingModule { }
