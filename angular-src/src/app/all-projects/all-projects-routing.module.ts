import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AllProjectsComponent} from './all-projects.component';
import {CustomerGuard} from '../guards/customer.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [CustomerGuard],
    component: AllProjectsComponent,
    data: { name: 'my projects dashboard', title: 'homepainter - All Projects' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllProjectsRoutingModule { }
