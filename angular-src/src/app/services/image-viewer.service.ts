import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {ImageFile} from "../models/imageFile";

@Injectable({
  providedIn: 'root'
})
export class ImageViewerService {

  private openImageViewerSource: Subject<{images: Array<ImageFile>, index: number}>;
  public openImageViewerEvent$: Observable<{images: Array<ImageFile>, index: number}>;

  constructor() {
    this.openImageViewerSource = new Subject<{images: Array<ImageFile>, index: number}>();
    this.openImageViewerEvent$ = this.openImageViewerSource.asObservable();
  }

  public openImageViewer(images: Array<ImageFile>, index: number) {
    this.openImageViewerSource.next({images, index});
  }
}
