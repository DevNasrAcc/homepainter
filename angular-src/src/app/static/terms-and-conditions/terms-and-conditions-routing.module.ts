import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TermsAndConditionsComponent} from './components/terms-and-conditions.component';

const routes: Routes = [
  {
    path: '',
    component: TermsAndConditionsComponent,
    data: {
      name: 'terms and conditions',
      title: 'homepainter - Terms & Conditions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermsAndConditionsRoutingModule { }
