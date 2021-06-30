import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Banner} from "./banner";
import {isPlatformServer} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  public instances: Array<Banner>;
  public closeListeners: Array<any>;
  public options: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.instances = [];
    this.closeListeners = [];
  }

  public init(elms: string, options?: any): Array<Banner> | Banner {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (!options) options = {};
    let retVal: any = [];

    let elements: NodeListOf<HTMLElement> | HTMLElement;
    if (elms.charAt(0) === '#') {
      elms = elms.replace('#', '');
      elements = document.getElementById(elms);
    }
    else {
      elements = document.querySelectorAll(elms);
    }

    if (elements instanceof NodeList) {
      for (let i = 0; i < elements.length; ++i) {
        const banner = new Banner(elements[i], options);
        this.instances.push(banner);
        retVal.push(banner);
      }
    }
    else {
      retVal = new Banner(elements, options);
      this.instances.push(retVal);
    }

    const closeListenerElements = document.querySelectorAll('.banner-close');
    for (let i = 0 ; i < closeListenerElements.length; ++i) {
      closeListenerElements[i].addEventListener('click', this.handleBannerCloseClick);
    }
    this.closeListeners.concat(closeListenerElements);

    return retVal;
  }

  private handleBannerCloseClick() {
    // @ts-ignore
    let element: HTMLElement = this;
    while (element.parentElement && !element.classList.contains('banner')) {
      element = element.parentElement;
    }

    // top level element reached. Parent not found
    if (!element.classList.contains('banner')) return;

    const banner = new Banner(element, {open: true});
    banner.close();
    banner.destroy();
  }

  public getInstance(elements: NodeListOf<HTMLElement> | HTMLElement): Array<Banner> | Banner {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (elements instanceof NodeList) {
      const ret = [];
      for (let i = 0; i < this.instances.length; ++i) {
        ret.push(this.instances.filter(banner => banner.el === elements[i]));
      }
      return ret;
    }

    return this.instances.filter(banner => banner.el === elements);
  }

  public destroyAll(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    for (let i = 0; i < this.closeListeners.length; ++i) {
      this.closeListeners[i].removeEventListener('click', this.handleBannerCloseClick);
    }

    while (this.instances.length) {
      const instance = this.instances.pop();
      instance.destroy();
    }
  }

  public closeAll(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    for (const banner of this.instances) {
      if (banner.isOpen) {
        banner.close();
      }
    }
  }
}
