import {Injectable} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {LocalStorageService} from './local-storage.service';
import {environment} from '../../environments/environment';
import {Customer} from '../models/user/customer';
import {Contractor} from '../models/user/contractor';
import {SocketIoService} from './socket.io.service';
import {HpCookieService} from './hp-cookie.service';
import {ApiRequestService} from './api-request.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private cookieService: HpCookieService, private apiRequestService: ApiRequestService,
              private localStorageService: LocalStorageService, private socketIoService: SocketIoService,
              private router: Router) {}

  public async upsertCustomer(body: any): Promise<HttpResponse<any>> {
    if (environment.angularServe) {
      await new Promise(res => setTimeout(res, 1000));
      this.cookieService.devSetCookie('hp_roles', 'customer');
      const customer = new Customer(body);
      customer.updateLastSeenOnline(new Date());
      this.localStorageService.saveCustomer(customer);
      return new HttpResponse<any>({status: 200});
    }

    const resp = await this.apiRequestService.post('/api/upsert-customer', body);

    if (resp.status === 200 || resp.status === 201) {
      this.localStorageService.saveCustomer(resp.body);
    }
    this.socketIoService.connect();

    return resp;
  }

  public async createAgent(body: any): Promise<HttpResponse<any>> {
    if (environment.angularServe) {
      await new Promise(res => setTimeout(res, 1000));
      this.cookieService.devSetCookie('hp_roles', 'agent');
      this.localStorageService.saveCustomer(new Customer());
      return new HttpResponse<any>({status: 200});
    }

    const resp = await this.apiRequestService.post('/api/become-an-agent', body);

    if (resp.status === 200 || resp.status === 201) {
      this.localStorageService.saveCustomer(resp.body);
    }
    this.socketIoService.connect();

    return resp;
  }

  public async createPro(body: any): Promise<HttpResponse<any>> {
    if (environment.angularServe) {
      body.accountStatus = 'approved';
      await new Promise(res => setTimeout(res, 1000));
      this.cookieService.devSetCookie('hp_roles', 'contractor');
      this.localStorageService.saveContractor(new Contractor(body));
      return new HttpResponse<any>({status: 200});
    }

    const resp = await this.apiRequestService.post('/api/become-a-pro', body);

    if (resp.status === 200 || resp.status === 201) {
      this.localStorageService.saveContractor(resp.body);
    }
    this.socketIoService.connect();

    return resp;
  }

  public async startLoginSequence(email: string): Promise<HttpResponse<any>> {
    if (environment.angularServe) {
      await new Promise(res => setTimeout(res, 1000));
      return new HttpResponse<any>({status: 200});
    }

    return await this.apiRequestService.post('/auth/start-login-sequence', { email });
  }

  public async login(body: any): Promise<HttpResponse<any>> {
    if (environment.angularServe) {
      await new Promise(res => setTimeout(res, 3000));
      this.cookieService.devSetCookie('hp_roles', 'customer');
      this.localStorageService.saveContractor(new Contractor({_id: 'loggedInUser', firstName: 'foo', lastName: 'bar'}));
      return new HttpResponse<any>({status: 200, body: { __t: 'customer' } });
    }

    const resp = await this.apiRequestService.post('/auth/login', body);
    this.socketIoService.connect();
    console.log("login",resp)

    if (resp.status === 200) {
      resp.body.__t === 'customer'
        ? this.localStorageService.saveCustomer(resp.body)
        : this.localStorageService.saveContractor(resp.body);
    }

    return resp;
  }

  public async changePassword(body: any): Promise<HttpResponse<any>> {
    const resp = await this.apiRequestService.post('/auth/change-password', body);

    return resp;
  }

  public async insuranceUpdate(body: any): Promise<HttpResponse<any>> {
    const resp = await this.apiRequestService.post('/api/update-insurance-info', body);

    return resp;
  }

  public async stripeUrl(): Promise<HttpResponse<any>> {
    const resp = await this.apiRequestService.get('/api/stripe-get-account-link');

    return resp;
  }

  public async insuranceUpdatePdf(body: any): Promise<HttpResponse<any>> {
    const resp = await this.apiRequestService.post('/api/files/upload-insurance', body);

    return resp;
  }

  public async getgeneralSettings(): Promise<HttpResponse<any>> {
    const resp = await this.apiRequestService.get('/auth/retrieve-user-personal-info');

    return resp;
  }
  public async getinsurance(): Promise<HttpResponse<any>> {
    const resp = await this.apiRequestService.get('/auth/retrieve-insurance-info');

    return resp;
  }

  public async generalSettings(body: any): Promise<HttpResponse<any>> {
    const resp = await this.apiRequestService.post('/auth/update-user-personal-info', body);

    return resp;
  }

  public async loginWithJwt(token: string): Promise<HttpResponse<any>> {
    if (environment.angularServe) {
      await new Promise(res => setTimeout(res, 3000));
      this.cookieService.devSetCookie('hp_roles', 'customer');
      this.localStorageService.saveCustomer(new Customer({_id: 'loggedInUser', firstName: 'foo', lastName: 'bar'}));
      return new HttpResponse<any>({status: 200, body: { __t: 'customer' } });
    }

    const resp = await this.apiRequestService.post('/auth/login-with-jwt', { token });
    this.socketIoService.connect();
    console.log("login jwt",resp)
    if (resp.status === 200) {
      resp.body.__t === 'customer'
        ? this.localStorageService.saveCustomer(resp.body)
        : this.localStorageService.saveContractor(resp.body);
    }

    return resp;
  }

  public async requestPasswordReset(body: any): Promise<HttpResponse<any>> {
    return await this.apiRequestService.post('/auth/request-password-reset', body);
  }

  public async resetPassword(body: any): Promise<HttpResponse<any>> {
    const resp = await this.apiRequestService.post('/auth/reset-password', body);

    if (resp.status === 200) {
      resp.body.__t === 'customer'
        ? this.localStorageService.saveCustomer(resp.body)
        : this.localStorageService.saveContractor(resp.body);
    }

    return resp;
  }

  public async logout() {
    if (environment.angularServe) {
      await new Promise(res => setTimeout(res, 1000));
      this.cookieService.devRemoveCookie('hp_roles');
    }

    if (this.cookieService.isLoggedIn() && !environment.angularServe) {
      const resp = await this.apiRequestService.post('/auth/logout');
      if (resp.status !== 200) {

      }
    } else if (environment.angularServe) {
      this.cookieService.devRemoveCookie('hp_roles');
    }
    this.localStorageService.reset();
    this.socketIoService.disconnect();
    this.router.navigateByUrl('/');
  }
}
