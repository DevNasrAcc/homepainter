import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CompleteSetupComponent} from './complete-setup.component';
import {ContractorGuard} from '../../guards/contractor.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [ContractorGuard],
    component: CompleteSetupComponent,
    data: { name: 'complete setup', title: 'homepainter - Complete Account Setup' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompleteSetupRoutingModule { }
