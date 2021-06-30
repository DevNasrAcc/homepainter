import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {environment} from '../../environments/environment';
import {EMPTY, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {catchError, mergeMap, take} from "rxjs/operators";
import {ngServeData} from "../../environments/ngServeData";

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<boolean> {
  constructor(private router: Router, private http: HttpClient) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    if (environment.angularServe) {
      try {
        return of(ngServeData.paintersList[route.paramMap.get('id')]);
      } catch (e) {
        this.router.navigateByUrl('/page-not-found');
        return EMPTY;
      }
    }

    return this.http.get(`${environment.baseUrl}/api/retrieve-painters/` + route.paramMap.get('id')).pipe(
      take(1),
      mergeMap((painters: any) => {
        if (painters && painters.length > 0) {
          return of(painters[0]);
        }
        else {
          this.router.navigateByUrl('/page-not-found');
          return EMPTY;
        }
      }),
      catchError((error: any) => {
        this.router.navigateByUrl('/page-not-found');
        return EMPTY;
      })
    )
  }
}
