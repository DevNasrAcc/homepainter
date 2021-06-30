import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {environment} from '../environments/environment';
import {DOCUMENT, isPlatformBrowser, isPlatformServer} from '@angular/common';
import {AnalyticsService} from './services/analytics.service';
import {Angular2MaterializeV1Service} from 'angular2-materialize-v1';
import {LocalStorageService} from './services/local-storage.service';
import {ProjectService} from './models/user/project.service';
import {RouterExtService} from './services/router-ext.service';
import {SocketIoService} from './services/socket.io.service';
import {HpCookieService} from './services/hp-cookie.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SeoService} from './services/seo.service';
import {IHousePainter} from './models/jsonLd';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean>;
  private intervalId: number;
  public jsonLd: IHousePainter;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private dom,
              private router: Router, private renderer: Renderer2, private analyticsService: AnalyticsService,
              private elementRef: ElementRef, private materialize: Angular2MaterializeV1Service,
              private localStorageService: LocalStorageService, private projectService: ProjectService,
              private cookieService: HpCookieService, private socketIoService: SocketIoService,
              private seoService: SeoService,
              private routerExtService: RouterExtService) // do not remove, keep on single line
  {
    this.socketIoService.connect();
    this.updateOnlineStatus();
    this.ngUnsubscribe = new Subject<boolean>();

    this.localStorageService.customerUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => { this.updateOnlineStatus(); });
    this.localStorageService.contractorUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => { this.updateOnlineStatus(); });

    this.seoService.jsonLdEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((jsonLd: IHousePainter) => { this.jsonLd = jsonLd; });

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd && isPlatformBrowser(this.platformId)) {
        const data = this.seoService.getDataFromActivatedRoute();
        this.seoService.updateAll(data);
        this.analyticsService.pageView(evt.urlAfterRedirects, data.name, data.title);
        this.addRemoveBlueBackground(evt.urlAfterRedirects);
        window.scrollTo(0, 0);
      }
    });
  }

  async ngOnInit() {
    // create the canonical url
    this.createCanonicalUrl();

    this.localStorageService.removeDeprecatedUsages();

    const project = this.localStorageService.getActiveProject();
    if (project.schemaVersion !== environment.schemaVersion) {
      this.localStorageService.saveActiveProject(await this.projectService.upgradeProjectSchema(project));
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && !this.cookieService.hasXsrfToken() && !environment.angularServe) {
      return window.location.reload();
    }
    this.addRemoveBlueBackground(this.router.url);
    this.materialize.autoInit();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
    this.socketIoService.disconnect();
  }

  private updateOnlineStatus() {
    if (isPlatformServer(this.platformId)) { return; }
    // logged in and has not been reporting online
    if (!this.intervalId && this.cookieService.isLoggedIn()) {
      this.socketIoService.updateOnlineStatus();
      this.intervalId = window.setInterval(() => { this.socketIoService.updateOnlineStatus(); }, 1000 * 60);
    }
    // user logged out, stop reporting online status
    if (this.intervalId && this.cookieService.isGuest()) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private createCanonicalUrl(): void {
    let url = this.dom.URL.replace('www.', '');
    if (url.includes('http://localhost:3001')) {
      url = url.replace('http://localhost:3001', 'https://staging.thehomepainter.com');
    }
    else if (url.includes('http://localhost:3000')) {
      url = url.replace('http://localhost:3000', 'https://thehomepainter.com');
 }

    const link: HTMLLinkElement = this.dom.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.dom.head.appendChild(link);
    link.setAttribute('href', url);
  }

  private addRemoveBlueBackground(url) {
    if (isPlatformServer(this.platformId)) { return; }

    const body = document.querySelector('body');
    if ((url.startsWith('/details') || url.startsWith('/messages')) && !body.classList.contains('blue')) {
      body.classList.add('blue', 'lighten-3');
    }
    else if ((!url.startsWith('/details') && !url.startsWith('/messages')) && body.classList.contains('blue')) {
      body.classList.remove('blue', 'lighten-3');
    }
  }
}
