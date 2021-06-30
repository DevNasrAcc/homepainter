import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HpCookieService {

  constructor(private cookieService: CookieService) { }

  public hasXsrfToken(): boolean {
    return this.cookieService.check('XSRF-TOKEN');
  }

  public getXsrfToken(): string {
    return this.cookieService.get('XSRF-TOKEN');
  }

  public devSetCookie(name: string, value: string) {
    this.cookieService.set(name, value);
  }

  public devRemoveCookie(name: string) {
    if (environment.angularServe) {
      this.cookieService.delete(name);
    }
  }

  public isGuest(): boolean {
    return !this.cookieService.check('hp_roles') || (
      !this.cookieService.get('hp_roles').includes('contractor') &&
      !this.cookieService.get('hp_roles').includes('customer') &&
      !this.cookieService.get('hp_roles').includes('customer')
    );
  }

  public isLoggedIn(): boolean {
    return this.cookieService.check('hp_roles') && (
      this.cookieService.get('hp_roles').includes('contractor') ||
      this.cookieService.get('hp_roles').includes('customer') ||
      this.cookieService.get('hp_roles').includes('customer')
    );
  }

  public isContractor(): boolean {
    return this.cookieService.check('hp_roles') && this.cookieService.get('hp_roles').includes('contractor');
  }

  public isCustomer(): boolean {
    return this.cookieService.check('hp_roles') && this.cookieService.get('hp_roles').includes('customer');
  }
}
