import {Inject, Injectable, OnDestroy, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService implements OnDestroy {

  private readonly resizeListener: {type: 'resize', func: EventListenerOrEventListenerObject, options: any};
  private previousWidth: number;
  private currentWidth: number;
  private screenResizeSource: Subject<void>;
  public screenResize$: Observable<void>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.resizeListener = {type: 'resize', func: () => { this.onResize(); }, options: false};
      window.addEventListener(this.resizeListener.type, this.resizeListener.func, this.resizeListener.options);
    }
    this.screenResizeSource = new Subject<void>();
    this.screenResize$ = this.screenResizeSource.asObservable();
    this.onResize();
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener(this.resizeListener.type, this.resizeListener.func, this.resizeListener.options);
    }
  }

  private onResize() {
    this.previousWidth = this.currentWidth;
    this.currentWidth = isPlatformServer(this.platformId) ? 600 : window.innerWidth;
    this.screenResizeSource.next();
  }

  public isMobile(): boolean {
    return this.currentWidth <= 600;
  }

  public isTablet(): boolean {
    return this.currentWidth > 600 && this.currentWidth <= 992;
  }

  public isMobileOrTablet(): boolean {
    return this.isMobile() || this.isTablet();
  }

  public isDesktop(): boolean {
    return this.currentWidth > 992;
  }

  public isMobileBefore(): boolean {
    return !this.isMobile() && this.previousWidth <= 600;
  }

  public isTabletBefore(): boolean {
    return !this.isTablet() && this.previousWidth > 600 && this.previousWidth <= 992;
  }

  public isMobileOrTabletBefore(): boolean {
    return !this.isMobile() && !this.isTablet() && this.previousWidth <= 992;
  }

  public isDesktopBefore(): boolean {
    return !this.isDesktop() && this.previousWidth > 992;
  }
}
