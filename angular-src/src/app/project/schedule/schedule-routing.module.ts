import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ScheduleComponent} from './schedule.component';
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
    component: ScheduleComponent,
    data: { name: 'contractor schedule', title: 'homepainter - Project Schedule' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule { }
