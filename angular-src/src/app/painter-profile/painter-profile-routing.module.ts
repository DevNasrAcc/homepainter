import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PainterProfileComponent} from './painter-profile.component';
import {UserResolver} from '../resolvers/user.resolver';

const routes: Routes = [
  {
    path: ':id',
    canActivate: [],
    resolve: {
      contractor: UserResolver
    },
    component: PainterProfileComponent,
    data: {
      name: 'painter profile',
      title: 'homepainter - profiles'
    }
  },
  {
    path: '',
    canActivate: [],
    component: PainterProfileComponent,
    data: {
      name: 'painter profile',
      title: 'homepainter - profiles'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PainterProfileRoutingModule { }
