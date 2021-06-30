import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AccountSettingsComponent} from './account-settings.component';
import {GeneralSettingsComponent} from './general-settings/general-settings.component';
import {PreferencesComponent} from './preferences/preferences.component';
import {InsuranceInfoComponent} from './insurance-info/insurance-info.component';
import {PaymentInfoComponent} from './payment-info/payment-info.component';
import {PriceEstimateComponent} from './price-estimate/price-estimate.component';
import {SecurityLoginComponent} from './security-login/security-login.component';
import {ContractorGuard} from '../guards/contractor.guard';
import {LoggedInGuard} from '../guards/logged-in.guard';

const routes: Routes = [
  {
    path: '',
    component: AccountSettingsComponent,
    children: [
      { path: '', redirectTo: '/account-settings/general', pathMatch: 'full' },
      {
        path: 'general',
        canActivate: [LoggedInGuard],
        component: GeneralSettingsComponent,
        data: {name: 'general account settings', title: 'homepainter - Account Settings'}
      },
      {
        path: 'preferences',
        canActivate: [LoggedInGuard],
        component: PreferencesComponent,
        data: {name: 'pro preferences', title: 'homepainter - Account Preferences'}
      },
      {
        path: 'security-login',
        canActivate: [LoggedInGuard],
        component: SecurityLoginComponent,
        data: {name: 'security and login settings', title: 'homepainter - Security & Login Settings'}
      },
      {
        path: 'insurance-info',
        // canActivate: [ContractorGuard],
        canActivate: [LoggedInGuard],
        component: InsuranceInfoComponent,
        data: {name: 'insurance info', title: 'homepainter - Insurance Settings'}
      },
      {
        path: 'payment-info',
        // canActivate: [ContractorGuard],
        canActivate: [LoggedInGuard],
        component: PaymentInfoComponent,
        data: {name: 'payment info', title: 'homepainter - Payment Settings'}
      },
      {
        path: 'price-estimate',
        canActivate: [ContractorGuard],
        component: PriceEstimateComponent,
        data: {name: 'price estimate settings', title: 'homepainter - Price Estimate Settings'}
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountSettingsRoutingModule { }
