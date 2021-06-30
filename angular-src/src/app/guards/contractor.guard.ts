import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot, UrlSegment,
  UrlTree
} from '@angular/router';
import {Observable} from 'rxjs';
import {HpCookieService} from "../services/hp-cookie.service";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {RouterExtService} from "../services/router-ext.service";

@Injectable({
  providedIn: 'root'
})
export class ContractorGuard implements CanActivate, CanLoad {

  constructor(private router: Router, private cookieService: HpCookieService,
              private materializeService: Angular2MaterializeV1Service,
              private routerExtensionService: RouterExtService) { }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkPermissionAndRedirect('/' + segments.map(o => o.path).join('/'));
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkPermissionAndRedirect(state.url);
  }

  private checkPermissionAndRedirect(returnUrl: string) {
    if (this.cookieService.isContractor()) {
      return true;
    }

    this.routerExtensionService.setLoginRedirectUrl(returnUrl);

    return this.router.parseUrl('/login');
  }

}
