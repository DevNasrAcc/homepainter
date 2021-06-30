import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HpCookieService} from '../../services/hp-cookie.service';
import {RouterExtService} from '../../services/router-ext.service';

@Component({
  selector: 'app-view-project',
  template: ''
})
export class ViewProjectComponent {

  constructor(private router: Router, private activateRoute: ActivatedRoute, private cookieService: HpCookieService,
              private routerExtService: RouterExtService) {
    const projectId = this.activateRoute.snapshot.params.projectId;
    const viewTarget = this.activateRoute.snapshot.params.viewTarget;

    if (cookieService.isGuest()) {
      this.routerExtService.setLoginRedirectUrl('/view-project/' + projectId);
      this.router.navigateByUrl('/login');
    }
    else if (cookieService.isCustomer() && viewTarget === 'quote') {
      this.router.navigate(['project', 'view-quotes'], { queryParams: { projectId } });
    }
    else if (cookieService.isCustomer()) {
      this.router.navigate(['project', 'details'], { queryParams: { projectId } });
    }
    else {
      this.router.navigate(['quote-project', projectId]);
    }
  }

}
