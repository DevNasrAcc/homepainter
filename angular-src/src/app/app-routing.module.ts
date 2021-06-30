import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './static/home/home.component';
import {PageNotFoundComponent} from './static/page-not-found/page-not-found.component';
import {LogInComponent} from './user-management/log-in/log-in.component';
import {GuestGuard} from './guards/guest.guard';
import {ContractorGuard} from './guards/contractor.guard';
import {ResetPasswordComponent} from './user-management/reset-password/reset-password.component';
import {CustomerGuard} from './guards/customer.guard';
import {LoggedInGuard} from './guards/logged-in.guard';
import {ViewProjectComponent} from './static/view-project/view-project.component';

const routes: Routes = [
  // contractor
  {
    path: 'complete-setup',
    canLoad: [ContractorGuard],
    loadChildren: () => import('./static/complete-setup/complete-setup.module').then(m => m.CompleteSetupModule)
  },
  {
    path: 'quote-project',
    canLoad: [ContractorGuard],
    loadChildren: () => import('./project/proposal/accept/proposal-accept.module').then(m => m.ProposalAcceptModule)
  },
  {
    path: 'decline-project',
    canLoad: [ContractorGuard],
    loadChildren: () => import('./project/proposal/decline/proposal-decline.module').then(m => m.ProposalDeclineModule)
  },
  {
    path: 'project-schedule',
    canLoad: [ContractorGuard],
    loadChildren: () => import('./project/schedule/schedule.module').then(m => m.ScheduleModule)
  },
  {
    path: 'contractor-complete',
    canLoad: [ContractorGuard],
    loadChildren: () => import('./project/contractor-complete/contractor-complete.module').then(m => m.ContractorCompleteModule)
  },
  {
    path: 'pro',
    canLoad: [ContractorGuard],
    loadChildren: () => import('./pro/pro.module').then(m => m.ProModule)
  },

  // customer
  {
    path: 'details',
    canLoad: [],
    loadChildren: () => import('./project/form-details/form-details.module').then(m => m.FormDetailsModule)
  },
  {
    path: 'project',
    canLoad: [],
    loadChildren: () => import('./project/dashboard/project-dashboard.module').then(m => m.ProjectDashboardModule)
  },
  {
    path: 'checkout',
    canLoad: [CustomerGuard],
    loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule)
  },
  {
    path: 'customer-complete',
    canLoad: [CustomerGuard],
    loadChildren: () => import('./project/customer-complete/customer-complete.module').then(m => m.CustomerCompleteModule)
  },
  {
    path: 'customer-abandoned-project-feedback',
    canLoad: [CustomerGuard],
    loadChildren: () => import('./project/customer-abandoned-project/customer-abandoned-project.module')
      .then(m => m.CustomerAbandonedProjectModule)
  },

  // all
  {
    path: 'account-settings',
    canLoad: [LoggedInGuard],
    loadChildren: () => import('./account-settings/account-settings.module').then(m => m.AccountSettingsModule)
  },
  {
    path: 'all-projects',
    canLoad: [CustomerGuard],
    loadChildren: () => import('./all-projects/all-projects.module').then(m => m.AllProjectsModule)
  },
  {
    path: 'messages',
    canLoad: [],
    loadChildren: () => import('./messages/messages.module').then(m => m.MessagesModule)
  },

  // any
  {
    path: 'notification-settings',
    canLoad: [],
    loadChildren: () => import('./static/notification-settings/notification-settings.module').then(m => m.NotificationSettingsModule)
  },
  {
    path: 'contact-us',
    canLoad: [],
    loadChildren: () => import('./static/contact-us/contact-us.module').then(m => m.ContactUsModule)
  },
  {
    path: 'privacy-policy',
    canLoad: [],
    loadChildren: () => import('./static/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule)
  },
  {
    path: 'terms-and-conditions',
    canLoad: [],
    loadChildren: () => import('./static/terms-and-conditions/terms-and-conditions.module').then(m => m.TermsAndConditionsModule)
  },
  {
    path: 'painter-signup',
    canLoad: [GuestGuard],
    loadChildren: () => import('./static/become-a-pro/become-a-pro.module').then(m => m.BecomeAProModule)
  },
  {
    path: 'realtor-signup',
    canLoad: [GuestGuard],
    loadChildren: () => import('./static/become-an-agent/become-an-agent.module').then(m => m.BecomeAnAgentModule)
  },
  {
    path: 'u',
    canLoad: [],
    loadChildren: () => import('./painter-profile/painter-profile.module').then(m => m.PainterProfileModule)
  },
  {
    path: 'login',
    canActivate: [GuestGuard],
    component: LogInComponent,
    data: {
      name: 'login',
      title: 'homepainter - Sign In To Your Account'
    }
  },
  {
    path: 'forgot-password',
    canActivate: [GuestGuard],
    component: ResetPasswordComponent,
    data: {
      name: 'reset-password',
      title: 'homepainter - Reset Password'
    }
  },
  {
    path: 'view-project',
    canActivate: [],
    children: [
      {
        path: '',
        redirectTo: '/',
        pathMatch: 'full'
      },
      {
        path: ':projectId',
        canActivate: [],
        component: ViewProjectComponent,
        data: {
          name: 'view-project',
          title: 'homepainter | view-project'
        },
      },
      {
        path: ':projectId/:viewTarget',
        canActivate: [],
        component: ViewProjectComponent,
        data: {
          name: 'view-project',
          title: 'homepainter | view-project'
        },
      },
    ]
  },
  {
    path: '',
    canActivate: [],
    component: HomeComponent,
    data: {
      name: 'home',
      title: 'homepainter - Explore Painters & Get Quotes Online',
    }
  },

  // legacy
  { path: 'cart', redirectTo: 'project', pathMatch: 'prefix' },
  { path: 'become-a-realtor', redirectTo: 'realtor-signup', pathMatch: 'prefix' },
  { path: 'price-estimate', redirectTo: 'details', pathMatch: 'prefix' },
  { path: 'locations', redirectTo: '/', pathMatch: 'prefix' },
  { path: 'home', redirectTo: '/', pathMatch: 'full' },
  { path: 'become-a-pro', redirectTo: 'painter-signup', pathMatch: 'prefix' },
  { path: 'become-an-agent', redirectTo: 'realtor-signup', pathMatch: 'prefix' },

  // catch all else
  {
    path: '**',
    component: PageNotFoundComponent,
    data: {
      name: 'page not found',
      title: 'homepainter - 404 Not Found'
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    relativeLinkResolution: 'legacy',
    anchorScrolling: 'enabled',
})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
