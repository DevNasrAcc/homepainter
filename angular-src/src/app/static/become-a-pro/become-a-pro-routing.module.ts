import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BecomeAProComponent} from './become-a-pro.component';


const routes: Routes = [
  {
    path: '',
    component: BecomeAProComponent,
    data: {
      name: 'become a pro',
      title: 'homepainter - Painter Sign Up',
      description: 'Get projects ready for bidding sent straight to your inbox risk-free at no upfront cost. Save time and money while getting more jobs.'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BecomeAProRoutingModule { }
