import {Injectable} from '@angular/core';
import {Details} from '../../../models/project/details/details';
import {Router} from '@angular/router';
import {LocalStorageService} from '../../../services/local-storage.service';
import {LocationService} from './location.service';
import {RouterExtService} from "../../../services/router-ext.service";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private navigation = [
    { url: '/project/details', target: 'both'},
    { url: '/details/zip-code', target: 'both'},
    { url: '/details/type-of-home', target: 'both'},
    { url: '/details/project-selector', target: 'both'},
    { url: '/details/room-selector', target: 'interior'},
    { url: '/details/room-details', target: 'interior'},
    { url: '/details/exterior-selector', target: 'exterior' },
    { url: '/details/exterior-details', target: 'exterior'},
    { url: '/details/photos', target: 'both'},
    { url: '/details/paint-supply', target: 'both' },
    { url: '/details/occupancy', target: 'interior'},
    { url: '/details/scheduler', target: 'both'},
    { url: '/details/project-summary', target: 'both'},
    { url: '/details/review', target: 'both'},
    { url: '/project/explore-painters', target: 'both'}
  ];
  private EXIT_ROOM_DETAILS_NAVIGATION: string = 'EXIT_ROOM_DETAILS_NAVIGATION';

  constructor(private router: Router, private localStorageService: LocalStorageService,
              private locationService: LocationService, private routerExtService: RouterExtService) {

  }

  public async navigateNext() {
    const url = await this.getUrl(1);
    this.router.navigateByUrl(url);
  }

  public async navigateBack() {
    if (this.routerExtService.getPreviousUrl() === '/all-projects') {
      this.routerExtService.goToPreviousUrl();
      return;
    }
    const url = await this.getUrl(-1);
    this.router.navigateByUrl(url);
  }

  /**
   *
   * @param direction 1 to move forward and -1 to move backward
   */
  private async getUrl(direction: number): Promise<string> {
    const currUrl = this.router.url.split(/[?#]/)[0];
    const details = this.localStorageService.getProjectDetails();

    if (currUrl.indexOf('/details/zip-code') >= 0 && details.address.validateJobLocation()) {
      const serviced = await this.locationService.isAreaServiced(details.address.zipCode);

      if (!serviced)
        return '/details/area-not-serviced';
    }

    if (currUrl.indexOf('/details/room-details') >= 0) {
      const url = this.getRoomDetailsUrl(direction, currUrl, details);
      if (url !== this.EXIT_ROOM_DETAILS_NAVIGATION) {
        return url;
      }
    }

    if (currUrl.indexOf('/details/exterior-details') >= 0) {
      const url = this.getExteriorDetailsUrl(direction, currUrl, details);
      if (url !== this.EXIT_ROOM_DETAILS_NAVIGATION) {
        return url;
      }
    }

    let cursor = this.navigation.findIndex(elm => elm.url !== '/' && currUrl.indexOf(elm.url) >= 0);

    if (cursor < 0) {
      return '/page-not-found';
    }

    let next = this.navigation[cursor + direction];

    while (true) {
      cursor = cursor + direction;
      next = this.navigation[cursor];
      if (details.decorType === 'interior' && next.url === '/details/room-details') {
        const url = this.getRoomDetailsUrl(direction, currUrl, details);
        if (url !== this.EXIT_ROOM_DETAILS_NAVIGATION) {
          return url;
        }
      } else if (details.decorType === 'exterior' && next.url === '/details/exterior-details') {
        const url = this.getExteriorDetailsUrl(direction, currUrl, details);
        if (url !== this.EXIT_ROOM_DETAILS_NAVIGATION) {
          return url;
        }
      } else if(details.decorType === 'interior' && next.target === 'interior') {
        break;
      } else if(details.decorType === 'exterior' && next.target === 'exterior') {
        if (details.isDeckProject() && next.url === '/details/exterior-selector'){
          continue;
        }
        break;
      } else if(next.target === 'both'){
        break;
      }
    }
    return next.url;
  }

  private getExteriorDetailsUrl(direction: number, currUrl: string, details: Details): string {
    const exteriorDetailsIndex = this.navigation.findIndex(e => e.url === '/details/exterior-details');
    let structureIndex: any = currUrl.split('/')[3];

    if (structureIndex === undefined) {
      structureIndex = (direction === 1) ? 0 : (details.exterior.length - 1);
      return this.navigation[exteriorDetailsIndex].url + '/' + structureIndex;
    }

    structureIndex = parseInt(structureIndex);

    if (isNaN(structureIndex)) {
      return '/page-not-found';
    }
    else if ((direction === -1 && structureIndex === 0) || (direction === 1 && structureIndex === details.exterior.length - 1)) {
      return this.EXIT_ROOM_DETAILS_NAVIGATION;
    }
    else {
      structureIndex = structureIndex + direction;
      return this.navigation[exteriorDetailsIndex].url + '/' + structureIndex;
    }
  }

  private getRoomDetailsUrl(direction: number, currUrl: string, details: Details): string {
    const roomDetailsIndex = this.navigation.findIndex(elm => elm.url === '/details/room-details');
    let roomIndex: any = currUrl.split('/')[3];

    // roomIndex has not been defined yet. Start at 0 or max roomIndex based on direction
    if (roomIndex === undefined) {
      roomIndex = (direction === 1) ? 0 : (details.interior.length - 1);
      return this.navigation[roomDetailsIndex].url + '/' + roomIndex;
    }

    roomIndex = parseInt(roomIndex);

    // If roomIndex is not a number, we cannot go forward or backward.
    if (isNaN(roomIndex)) {
      return '/page-not-found';
    }
    // if going back and room index is 0, go to previous navigation url
    // if going forward and we're at the final room index, move to next navigation url
    else if((direction === -1 && roomIndex === 0) || (direction === 1 && roomIndex === details.interior.length - 1)) {
      return this.EXIT_ROOM_DETAILS_NAVIGATION;
    }
    // last case, increment or decrement roomIndex
    else {
      roomIndex = roomIndex + direction;
      return this.navigation[roomDetailsIndex].url + '/' + roomIndex;
    }
  }
}
