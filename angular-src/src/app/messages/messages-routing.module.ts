import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MessagesComponent} from './messages.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [],
    component: MessagesComponent,
    data: {
      name: 'messages',
      title: 'homepainter - Messages'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule { }
