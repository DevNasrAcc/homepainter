import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectDashboardComponent} from './project-dashboard.component';
import {DetailsComponent} from './components/details/details.component';
import {QuotesComponent} from './components/quotes/quotes.component';
import {HireComponent} from './components/hire/hire.component';
import {ExplorePaintersComponent} from "./components/explore-painters/explore-painters.component";

const routes: Routes = [
  {
    path: '',
    component: ProjectDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'explore-painters',
        pathMatch: 'full'
      },
      {
        path: 'explore-painters',
        canActivate: [],
        component: ExplorePaintersComponent,
        data: { name: 'explore painters', title: 'homepainter - Explore Painters' }
      },
      {
        path: 'details',
        canActivate: [],
        component: DetailsComponent,
        data: { name: 'project details', title: 'homepainter - Create Your Project' }
      },
      {
        path: 'view-quotes',
        canActivate: [],
        component: QuotesComponent,
        data: { name: 'view quotes', title: 'homepainter - View Quotes' }
      },
      {
        path: 'hire',
        canActivate: [],
        component: HireComponent,
        data: { name: 'hire a painter', title: 'homepainter - Hire' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectDashboardRoutingModule { }
