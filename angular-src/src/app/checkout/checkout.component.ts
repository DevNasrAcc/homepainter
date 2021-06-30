import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from '../services/local-storage.service';
import {Router} from '@angular/router';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {AnalyticsService} from '../services/analytics.service';

@Component({
  selector: 'app-project',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.less']
})
export class CheckoutComponent implements OnInit {

  constructor(private localStorageService: LocalStorageService, private materialize: Angular2MaterializeV1Service,
              private analytics: AnalyticsService, private router: Router) {
  }

  ngOnInit() {
    const customer = this.localStorageService.getCustomer();
    const project = this.localStorageService.getActiveProject();

    if (!customer.hasFilledOutContactInfo() || !project.isValid()) {
      this.materialize.toast({html: 'Please fill out your project before checking out.'});
      this.router.navigateByUrl('/project/details');
      return;
    }

    const details = this.analytics.eventAction.checkout.started;
    details.value.value = project.selectedProposal.price + 50;
    this.analytics.pageAction(details);
  }
}
