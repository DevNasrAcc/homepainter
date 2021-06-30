import {HttpClient, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {

  constructor(private http: HttpClient) {
  }

  public get(url: string): Promise<HttpResponse<any>> {
    return new Promise((resolve) => {
      this.http.get(url, {observe: 'response'}).subscribe(resolve, resolve);
    });
  }

  public post(url: string, body: any = {}): Promise<HttpResponse<any>> {
    return new Promise((resolve) => {
      this.http.post(url, body, {observe: 'response'}).subscribe(resolve, resolve);
    });
  }
}
