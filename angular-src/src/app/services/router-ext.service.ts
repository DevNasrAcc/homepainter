import { Injectable } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';

/** A router wrapper, adding extra functions. */
@Injectable()
export class RouterExtService {

  private loginRedirectUrl: string;
  private previousUrl: string;
  private currentUrl: string;

  constructor(private router : Router) {
    this.loginRedirectUrl = undefined;
    this.previousUrl = undefined;
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      }
    });
  }

  public getPreviousUrl(): string {
    return this.previousUrl;
  }

  public goToPreviousUrl(): Promise<boolean> {
    return this.router.navigateByUrl(this.previousUrl);
  }

  public setLoginRedirectUrl(url: string) {
    this.loginRedirectUrl = url;
  }

  public getAndClearLoginRedirectUrl(): string {
    const url = this.loginRedirectUrl;
    this.loginRedirectUrl = undefined;
    return url;
  }
}
