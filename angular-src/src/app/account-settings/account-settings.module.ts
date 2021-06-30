import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AccountSettingsRoutingModule} from './account-settings-routing.module';
import {AccountSettingsComponent} from './account-settings.component';
import {GeneralSettingsComponent} from './general-settings/general-settings.component';
import {PreferencesComponent} from './preferences/preferences.component';
import {InsuranceInfoComponent} from './insurance-info/insurance-info.component';
import {PaymentInfoComponent} from './payment-info/payment-info.component';
import {PriceEstimateComponent} from './price-estimate/price-estimate.component';
import {SecurityLoginComponent} from './security-login/security-login.component';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AccountSettingsComponent,
    GeneralSettingsComponent,
    PreferencesComponent,
    InsuranceInfoComponent,
    PaymentInfoComponent,
    PriceEstimateComponent,
    SecurityLoginComponent
  ],
    imports: [
        CommonModule,
        AccountSettingsRoutingModule,
        ReactiveFormsModule
    ]
})
export class AccountSettingsModule {
}
