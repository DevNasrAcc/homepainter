import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CustomerAbandonedProjectComponent} from './customer-abandoned-project.component';
import {CustomerGuard} from '../../guards/customer.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [CustomerGuard],
    component: CustomerAbandonedProjectComponent,
    data: { name: 'customer abandoned project feedback', title: 'homepainter - Feedback' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerAbandonedProjectRoutingModule { }
