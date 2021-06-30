import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NotificationSettingsComponent} from './notification-settings.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationSettingsComponent,
    data: {
      name: 'notification settings',
      title: 'homepainter - Notification Settings',
      description: ''
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationSettingsRoutingModule { }
