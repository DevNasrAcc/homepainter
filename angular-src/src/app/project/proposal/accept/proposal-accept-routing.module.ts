import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProposalAcceptComponent} from './proposal-accept.component';
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
    component: ProposalAcceptComponent,
    data: { name: 'accept proposal', title: 'homepainter - Request For Proposal' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProposalAcceptRoutingModule { }
