import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CustomerCompleteComponent} from './customer-complete.component';
import {CustomerGuard} from '../../guards/customer.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: ':orderId',
    canActivate: [CustomerGuard],
    component: CustomerCompleteComponent,
    data: { name: 'customer complete', title: 'homepainter - Project Complete' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerCompleteRoutingModule { }
