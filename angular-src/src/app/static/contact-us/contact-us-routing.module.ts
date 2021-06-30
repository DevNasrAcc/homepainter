import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ContactUsComponent} from './contact-us.component';

const routes: Routes = [
  {
    path: '',
    component: ContactUsComponent,
    data: {
      name: 'contact us',
      title: 'homepainter - Contact Us',
      description: 'Have a question? Contact your local homepainter rep to find out how we can help with your paint project.'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactUsRoutingModule { }
