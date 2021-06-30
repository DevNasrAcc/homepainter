import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {isPlatformServer} from "@angular/common";
import {ImageViewerService} from "../services/image-viewer.service";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ImageFile} from "../models/imageFile";

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.less']
})
export class ImageViewerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('image') private image: ElementRef;
  private ngUnsubscribe: Subject<boolean>;
  private eventListeners: Array<{element: HTMLElement, type: string, listener: any, options: any}>;

  public open: boolean;
  public images: Array<ImageFile>;
  public index: number;
  public imageProperties: { naturalZoom: number, zoom: number, cursor: string, width: number, height: number };

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private imageViewerService: ImageViewerService) {
    this.eventListeners = [];
    this.ngUnsubscribe = new Subject<boolean>();
    this.open = false;
    this.images = [];
    this.index = 0;
    this.imageProperties = {
      naturalZoom: 1,
      zoom: 1,
      cursor: 'auto',
      width: 0,
      height: 0,
    };

    this.imageViewerService.openImageViewerEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((input: {images: Array<ImageFile>, index: number}) => {
        this.openClose(input.images, input.index)
      });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.eventListeners.push({
      element: this.image.nativeElement,
      type: 'mouseover',
      listener: () => {this.imageMouseUpOver()},
      options: false
    });

    this.eventListeners.push({
      element: this.image.nativeElement,
      type: 'mouseup',
      listener: () => {this.imageMouseUpOver()},
      options: false
    });

    this.eventListeners.push({
      element: this.image.nativeElement,
      type: 'mousedown',
      listener: () => {this.imageMouseDown()},
      options: false
    });

    this.eventListeners.push({
      element: this.image.nativeElement,
      type: 'mousemove',
      listener: (evt) => {this.imageMouseMove(evt)},
      options: false
    });

    for (const eventListener of this.eventListeners) {
      eventListener.element.addEventListener(eventListener.type, eventListener.listener, eventListener.options);
    }
  }

  ngOnDestroy() {
    while(this.eventListeners.length > 0) {
      const eventListener = this.eventListeners.pop();
      eventListener.element.removeEventListener(eventListener.type, eventListener.listener, eventListener.options);
    }
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  public onImageLoad(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const naturalWidth = this.image.nativeElement.naturalWidth;
    const naturalHeight = this.image.nativeElement.naturalHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (naturalWidth < windowWidth && naturalHeight < windowHeight) {
      this.imageProperties.naturalZoom = this.imageProperties.zoom = 1;
      this.imageProperties.width = this.image.nativeElement.naturalWidth;
      this.imageProperties.height = this.image.nativeElement.naturalHeight;
    }
    else if (naturalWidth > windowWidth) {
      this.imageProperties.naturalZoom = this.imageProperties.zoom = windowWidth / naturalWidth;
      this.imageProperties.height = naturalHeight * this.imageProperties.zoom;
      this.imageProperties.width = windowWidth;
    }
    else if (naturalHeight > windowHeight) {
      this.imageProperties.naturalZoom = this.imageProperties.zoom = windowHeight / naturalHeight;
      this.imageProperties.height = windowHeight;
      this.imageProperties.width = naturalWidth * this.imageProperties.zoom;
    }
  }

  public imageMouseUpOver(): void {
    this.imageProperties.cursor = this.imageProperties.zoom !== this.imageProperties.naturalZoom ? 'grab' : 'auto'
  }

  public imageMouseDown(): void {
    this.imageProperties.cursor = this.imageProperties.zoom !== this.imageProperties.naturalZoom ? 'grabbing' : 'auto'
  }

  public imageMouseMove(evt): void {
    if (this.imageProperties.cursor === 'grabbing') {
      this.image.nativeElement.parentElement.scrollLeft -= evt.movementX;
      this.image.nativeElement.parentElement.scrollTop -= evt.movementY;
    }
  }

  public nextImage(): void {
    this.index = (this.index + 1) >= this.images.length ? 0 : this.index + 1;
  }

  public prevImage(): void {
    this.index = (this.index - 1) < 0 ? this.images.length - 1 : this.index - 1;
  }

  public zoomIn(): void {
    this.imageProperties.height *= 2;
    this.imageProperties.width *= 2;
    this.imageProperties.zoom *= 2;
  }

  public zoomOut(): void {
    this.imageProperties.height /= 2;
    this.imageProperties.width /= 2;
    this.imageProperties.zoom /= 2;
  }

  public openClose(images?: Array<ImageFile>, index?: number) {
    if (images) {
      this.images = images;
      this.index = index
    }
    this.open = !this.open;
    document.body.style.overflow = document.body.style.overflow === 'hidden' ? '' : 'hidden';
  }

}
