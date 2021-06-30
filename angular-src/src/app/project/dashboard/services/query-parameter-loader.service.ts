import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {Project} from "../../../models/project/project";
import {LocalStorageService} from "../../../services/local-storage.service";
import {ApiRequestService} from "../../../services/api-request.service";
import {HpCookieService} from "../../../services/hp-cookie.service";
import {RouterExtService} from "../../../services/router-ext.service";

@Injectable({
  providedIn: 'root'
})
export class QueryParameterLoaderService {

  constructor(public router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService,
              private localStorageService: LocalStorageService, private apiRequestService: ApiRequestService,
              private cookieService: HpCookieService, private routerExtensionService: RouterExtService) { }

  public async load() {
    const projectId = this.activatedRoute.snapshot.queryParams.projectId || this.localStorageService.getActiveProject()._id;

    if (projectId) {
      if (!this.cookieService.isLoggedIn()) {
        this.routerExtensionService.setLoginRedirectUrl(this.router.url);
        return await this.router.navigateByUrl('/login');
      }

      const resp = await this.apiRequestService.get(`/api/retrieve-project/${projectId}`);
      if (resp.status === 200 && resp.body)
        this.localStorageService.saveActiveProject(new Project(resp.body));
      else
        console.log('Could not retrieve project with id [%s]', projectId);
    }

    if (projectId) {
      const route = this.router.url.split(/[#?]/)[0];
      await this.router.navigateByUrl(route);
    }
  }
}
