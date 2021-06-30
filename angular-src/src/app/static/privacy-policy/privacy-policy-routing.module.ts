import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PrivacyPolicyComponent} from './components/privacy-policy.component';

const routes: Routes = [
  {
    path: '',
    component: PrivacyPolicyComponent,
    data: {
      name: 'privacy policy',
      title: 'homepainter - Privacy Policy'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivacyPolicyRoutingModule { }
