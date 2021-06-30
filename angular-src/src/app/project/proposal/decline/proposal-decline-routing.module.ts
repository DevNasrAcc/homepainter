import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProposalDeclineComponent} from './proposal-decline.component';
import {ContractorGuard} from '../../../guards/contractor.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: ':projectId',
    canActivate: [ContractorGuard],
    component: ProposalDeclineComponent,
    data: { name: 'decline proposal', title: 'homepainter - Request For Proposal' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProposalDeclineRoutingModule { }
