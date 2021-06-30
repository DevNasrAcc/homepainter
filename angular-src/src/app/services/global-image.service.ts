import {Injectable} from '@angular/core';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {HttpClient, HttpEvent, HttpEventType, HttpRequest} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ImageFile} from "../models/imageFile";

@Injectable({
  providedIn: 'root'
})
export class GlobalImageService {

  constructor(private http: HttpClient, private materialize: Angular2MaterializeV1Service) {}

  public async convertToLocalURL(photos: FileList): Promise<Array<ImageFile>> {
    const ret = [];

    for (let i = 0; i < photos.length; ++i) {
      if (photos instanceof FileList && !photos[i].type.match(/image\/*/)) {
        this.materialize.toast({html: 'Only images are allowed.', displayLength: 6000});
        return undefined;
      }

      const obj = new ImageFile({
        url: await this.readAsDataUrl(photos[i]),
        originalName: photos[i].name,
        size: photos[i].size,
        uploading: false,
        uploaded: false,
        progress: 0
      });
      ret.push(obj);
    }

    return ret;
  }

  private readAsDataUrl(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => { resolve(reader.result); };
      reader.onabort = () => { reject('File read rejected'); };
      reader.onerror = (err) => { reject('File read errored: ' + err); };
      // @ts-ignore
      reader.readAsDataURL(file);
    });
  }

  public async uploadPhoto(file: File, displayedFile: ImageFile): Promise<ImageFile> {
    if (environment.angularServe) {
      await this.wait();
      displayedFile.progress = 20;
      await this.wait();
      displayedFile.progress = 100;
      await this.wait();

      const rand = Math.floor((Math.random() * 7) + 1);
      return new ImageFile({
        originalName: `_exterior(${rand}).jpg`,
        size: 1567249,
        url: `https://us-east-1.linodeobjects.com/homepainter-images-development/example${rand}.JPG`
      });
    }

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append(file.name, file, file.name);

      const req = new HttpRequest('POST', '/api/files/upload-photo', formData, { reportProgress: true });
      this.http.request(req).subscribe((evt: HttpEvent<any>) => {
        switch (evt.type) {
          case HttpEventType.UploadProgress:
            displayedFile.progress = Math.round(evt.loaded / evt.total * 100);
            break;
          case HttpEventType.ResponseHeader:
            if (evt.status === 500) reject(evt);
            break;
          case HttpEventType.Response:
            resolve(new ImageFile(evt.body));
            break;
        }
      })
    });
  }

  private wait() {
    return new Promise(r => setTimeout(r, 1000));
  }
}
