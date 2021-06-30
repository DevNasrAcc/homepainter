import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ContractorCompleteComponent} from './contractor-complete.component';
import {ContractorGuard} from '../../guards/contractor.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: ':orderId',
    canActivate: [ContractorGuard],
    component: ContractorCompleteComponent,
    data: { name: 'contractor complete', title: 'homepainter - Project Complete' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractorCompleteRoutingModule { }
