import {AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {Subject} from "rxjs";
import {filter, takeUntil} from "rxjs/operators";
import {AuthService} from "../../../services/auth.service";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {LocalStorageService} from "../../../services/local-storage.service";
import {User} from "../../../models/user/base/user";
import {HpCookieService} from "../../../services/hp-cookie.service";
import {IDropdown} from "angular2-materialize-v1/lib/IInstance";
import {isPlatformBrowser, Location} from "@angular/common";

@Component({
  selector: 'materialize-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.less']
})
export class NavBarComponent implements OnInit, AfterViewInit, OnDestroy {
  private dropdown: IDropdown;
  private ngUnsubscribe: Subject<boolean>;

  public isNavbarTransparent: boolean;
  public isLoggedIn: boolean;
  public user: User;
  public isDropdownOpen: boolean;
  public numberOfUnreadConversations: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private authService: AuthService,
              public cookieService: HpCookieService, private localStorageService: LocalStorageService,
              private materializeService: Angular2MaterializeV1Service, private location: Location) {
    this.setNavbarTransparency();
    this.isLoggedIn = this.cookieService.isLoggedIn();
    this.user = this.cookieService.isContractor()
      ? this.localStorageService.getContractor()
      : this.localStorageService.getCustomer();
    this.numberOfUnreadConversations = 0;

    this.ngUnsubscribe = new Subject<boolean>();
    this.localStorageService.customerUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((user) => {this.user = user; this.isLoggedIn = this.cookieService.isLoggedIn()});
    this.localStorageService.contractorUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((user) => {this.user = user; this.isLoggedIn = this.cookieService.isLoggedIn()});
    this.router.events
      .pipe(filter((evt) => evt instanceof NavigationEnd))
      .subscribe(() => { this.setNavbarTransparency() });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.dropdown = <IDropdown>this.materializeService.initDropdown('#user-menu-trigger', {
      alignment: 'right',
      constrainWidth: false,
      coverTrigger: false,
      closeOnClick: false,
      onOpenStart: () => {this.isDropdownOpen = true},
      onCloseStart: () => {this.isDropdownOpen = false},
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  @HostListener("window:scroll")
  private onScroll() {
    this.setNavbarTransparency();
  }

  private setNavbarTransparency(): void {
    this.isNavbarTransparent = isPlatformBrowser(this.platformId) && this.location.isCurrentPathEqualTo('/') && window.scrollY === 0;
  }

  /**
   * IOS has an issue with the animation and selecting the correct li item.
   * See also - https://github.com/Dogfalo/materialize/issues/6494#issuecomment-706245869
   */
  public iosFixDropdown() {
    this.dropdown.close()
  }

  public navHome() {
    this.router.navigateByUrl('/');
  }

  public clearSelectedContractor() {
    this.localStorageService.clearSelectedContractorId();
  }

  public async logout() {
    await this.authService.logout();
    this.iosFixDropdown();
  }
}
