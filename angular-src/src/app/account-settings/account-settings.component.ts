import {AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Router} from "@angular/router";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {isPlatformBrowser} from "@angular/common";
import {ResponsiveService} from "../services/responsive.service";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.less']
})
export class AccountSettingsComponent implements OnInit, AfterViewInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean>;
  private pushpinInstance: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public router: Router,
              private materialize: Angular2MaterializeV1Service, public responsiveService: ResponsiveService) {
    this.ngUnsubscribe = new Subject<boolean>();
    this.responsiveService.screenResize$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (this.pushpinInstance && this.responsiveService.isDesktopBefore()) {
          this.pushpinInstance.destroy();
          this.pushpinInstance = undefined;
        }
        else if (!this.pushpinInstance && this.responsiveService.isMobileOrTabletBefore()) {
          this.pushpinInstance = this.materialize.initPushpin('#pushpin');
        }
      });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit() {
    if (this.responsiveService.isDesktop()) {
      this.pushpinInstance = this.materialize.initPushpin('#pushpin');
    }
  }

}
