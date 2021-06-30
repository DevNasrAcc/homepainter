import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {environment} from '../../environments/environment';
import {FinalData} from '../checkout/components/final/final.data';
import {Project} from "../models/project/project";

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private http: HttpClient, private materialze: Angular2MaterializeV1Service) {
  }

  public async getStripePublishableKey(): Promise<string> {
    if (environment.angularServe) {
      this.materialze.toast({html: 'Dev env. Returning developer public stripe key.'});
      return environment.developmentStripePublishableKey;
    }

    try {
      const resp = await this.http.get<any>('/api/stripe/get-publishable-key').toPromise();
      return resp.stripePublishableKey;
    } catch (ignored) {
      this.materialze.toast({
        html: 'There was an error retrieving the stripe publishable key. Please refresh the page and try again.',
        displayLength: 6000
      });
      return '';
    }
  }

  public async getStripeClientId(): Promise<{stripeClientId: string, stateValue: string}> {
    if (environment.angularServe) {
      this.materialze.toast({html: 'Dev env. Returning developer client id.'});
      return { stripeClientId: environment.developmentStripeClientId, stateValue: '' };
    }

    try {
      return await this.http.get<any>('/api/stripe/get-client-id-and-state-code').toPromise();
    } catch (ignored) {
      this.materialze.toast({
        html: 'There was an error retrieving the stripe client id. Please refresh the page and try again.',
        displayLength: 6000
      });
      return { stripeClientId: undefined, stateValue: undefined };
    }
  }

  public async createConnectAccount(stripeCode: string, stateValue: string) {
    if (environment.angularServe) {
      this.materialze.toast({html: 'Dev env. Returning.'});
      return true;
    }

    try {
      await this.http.post<any>('/api/complete-setup', { stripeCode, stateValue }).toPromise();
      return true;
    } catch (msg) {
      this.materialze.toast({
        html: 'There was an error creating your connect account. Error Message: ' + msg,
        displayLength: 6000
      });
      return false;
    }
  }

  public async upsertOrder(project: Project) {
    try {
      const resp = await this.http.post<{clientSecret: string}>('/api/upsert-order', project).toPromise();
      return resp.clientSecret;
    } catch (e) {
      console.log(e);
      this.materialze.toast({html: 'There was an error creating your stripe client secret / updating your order. ' +
          'You will not be able to checkout without this. Try reloading the page or contact us if the issue persists.',
        displayLength: 6000});
      return null;
    }
  }

  public async confirmCardPayment(stripeClientSecret: string, stripe: any, element: any, options: FinalData) {
    const address = options.billingAddressSameAsProperty
      ? options.address
      : options.billingAddress;

    return await stripe.confirmCardPayment(stripeClientSecret, {
      payment_method: {
        card: element,
        billing_details: {
          name: `${options.firstName} ${options.lastName}`,
          phone: options.phoneNumber,
          email: options.emailAddress,
          address: {
            line1: address.streetAddress,
            city: address.city,
            state: address.state,
            postal_code: address.zipCode.toUpperCase(),
            country: 'US'
          }
        }
      },
      setup_future_usage: 'off_session'
    });
  }
}
