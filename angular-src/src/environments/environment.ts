import { constants } from './constants';

export const environment = {
  production: false,
  qualityAssurance: false,
  development: false,
  angularServe: true,
  baseUrl: 'http://localhost:4200',
  appName: constants.appName,
  appTitle: constants.appTitle,
  schemaVersion: constants.schemaVersion,
  localStorageNames: constants.localStorageNames,
  developmentStripePublishableKey: constants.developmentStripePublishableKey,
  developmentStripeClientId: constants.developmentStripeClientId,
  contactInfo: {
    customerService: '+1-000-000-0000',
    technicalSupport: '+1-000-000-0000',
    billingSupport: '+1-000-000-0000',
    billPayment: '+1-000-000-0000',
    sales: '+1-000-000-0000',
    creditCardSupport: '+1-000-000-0000'
  }
};
