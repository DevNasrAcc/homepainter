import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {DetailsRoomSize} from '../../../models/project/details/details.room-size';
import {DetailsRoomHeight} from '../../../models/project/details/details.room-height';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private isAreaServicedUrl: string = '/api/is-area-serviced/';

  private roomHeights: Array<DetailsRoomHeight>;
  private roomSizes: Array<DetailsRoomSize>;
  private lastZipCode: number;
  private getRoomHeightUrl: string = '/api/room-height/';
  private getRoomSizeUrl: string = '/api/room-size/';

  constructor(private http: HttpClient, private materialize: Angular2MaterializeV1Service) {
    this.lastZipCode = 0;
  }

  public async isAreaServiced(zipCode: number): Promise<boolean> {
    if (environment.angularServe) {
      return true;
    }

    try {
      return await this.http.get<boolean>(`${this.isAreaServicedUrl}${zipCode}`).toPromise();
    } catch (e) {
      this.materialize.toast({html: 'There was an error retrieving the zip code. Please try again or contact us at <a href="mailto:support@thehomepainter.com">support@thehomepainter.com</a>'});
      return false;
    }
  }

  public async getRoomHeights(zipCode: number, jobType: string, roomType: string): Promise<Array<DetailsRoomHeight>> {
    if (environment.angularServe) {
      this.roomHeights = [];
      this.roomHeights.push(new DetailsRoomHeight({name: 'average', height: 10, label: '10\' to 12\''}));
      this.roomHeights.push(new DetailsRoomHeight({name: 'aboveAverage', height: 12, label: '12\' to 15\''}));
      this.roomHeights.push(new DetailsRoomHeight({name: 'vaulted', height: 15, label: '15\' to 18\''}));
      this.lastZipCode = zipCode;
      return this.roomHeights;
    }
    try {
      const resp = await this.http.get<Array<DetailsRoomHeight>>(`${this.getRoomHeightUrl}${zipCode}/${jobType}/${roomType}`).toPromise();

      if (!Array.isArray(resp)) {
        return null;
      }

      this.roomHeights = [];
      for (let i = 0; i < resp.length; i++) {
        this.roomHeights.push(new DetailsRoomHeight(resp[i]));
      }

      this.lastZipCode = zipCode;
      return this.roomHeights;
    } catch (e) {
      this.materialize.toast({html: 'There was an error getting room sizes. Please contact: <a href=\'mailto:support@homepainter.com\'>support@homepainter.com</a>'});
      return null;
    }
  }

  public async getRoomSizes(zipCode: number, jobType: string, roomType: string): Promise<Array<DetailsRoomSize>> {
    if (environment.angularServe) {
      this.roomSizes = [];
      this.roomSizes.push(new DetailsRoomSize({name: 'small', length: 10, width: 10, label: '1\'x1\' or less'}));
      this.roomSizes.push(new DetailsRoomSize({name: 'medium', length: 12, width: 12, label: '2\'x2\' to 3\'x3\''}));
      this.roomSizes.push(new DetailsRoomSize({name: 'large', length: 15, width: 15, label: '4\'x4\' to 5\'x5\''}));
      this.lastZipCode = zipCode;
      return this.roomSizes;
    }
    try {
      const resp = await this.http.get<Array<DetailsRoomSize>>(`${this.getRoomSizeUrl}${zipCode}/${jobType}/${roomType}`).toPromise();

      if (!Array.isArray(resp)) {
        return null;
      }

      this.roomSizes = [];
      for (let i = 0; i < resp.length; i++) {
        this.roomSizes.push(new DetailsRoomSize(resp[i]));
      }

      this.lastZipCode = zipCode;
      return this.roomSizes;
    } catch (e) {
      this.materialize.toast({html: 'There was an error getting room sizes. Please contact: <a href=\'mailto:support@homepainter.com\'>support@homepainter.com</a>'});
      return null;
    }
  }

}
