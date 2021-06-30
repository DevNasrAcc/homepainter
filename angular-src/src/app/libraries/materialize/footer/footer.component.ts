import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {AnalyticsService} from '../../../services/analytics.service';
import {filter} from "rxjs/operators";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'materialize-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.less']
})
export class FooterComponent implements OnInit {

  public displayFooter: boolean;
  public year: number;

  constructor(private router: Router, private analytics: AnalyticsService, private authService: AuthService) {
    this.displayFooter = true;
    this.year = new Date().getFullYear();
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((evt) => evt instanceof NavigationEnd))
      .subscribe(evt => {this.updateDisplayFooter(evt)});
  }

  private updateDisplayFooter(evt) {
    this.displayFooter = !evt.url.startsWith('/details');
  }

  public async resetLocalStorage() {
    await this.authService.logout();
  }

  public externalLinkClicked(label) {
    const details = this.analytics.eventAction.static.externalLinkClicked;
    details.label.value = label;
    this.analytics.pageAction(details);
  }
}
