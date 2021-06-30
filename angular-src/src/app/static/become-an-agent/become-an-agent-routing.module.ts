import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BecomeAnAgentComponent} from './become-an-agent.component';

const routes: Routes = [
  {
    path: '',
    component: BecomeAnAgentComponent,
    data: {
      name: 'become an agent',
      title: 'homepainter - Sign Up As An Agent',
      description: 'Sign up for discounts and unique features to help your business run smoothly. Get quotes and hire painter online.'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BecomeAnAgentRoutingModule { }
