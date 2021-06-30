import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CheckoutComponent} from './checkout.component';
import {NoticesComponent} from './components/notices/notices.component';
import {FinalComponent} from './components/final/final.component';
import {CustomerGuard} from '../guards/customer.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [CustomerGuard],
    component: CheckoutComponent,
    children: [
      { path: '', redirectTo: 'notices', pathMatch: 'full' },
      {
        path: 'notices',
        canActivate: [CustomerGuard],
        component: NoticesComponent,
        data: { name: 'checkout notices', title: 'homepainter - Checkout Notices' }
      },
      {
        path: 'final',
        canActivate: [CustomerGuard],
        component: FinalComponent,
        data: { name: 'checkout final', title: 'homepainter - Checkout Final Info' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
