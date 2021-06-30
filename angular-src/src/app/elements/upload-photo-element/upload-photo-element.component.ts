import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID
} from '@angular/core';
import {isPlatformServer} from "@angular/common";
import {GlobalImageService} from "../../services/global-image.service";
import {ImageFile} from "../../models/imageFile";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";

@Component({
  selector: 'upload-photo-element[id][existingPhotos][photosChanged][uploadingFiles]',
  templateUrl: './upload-photo-element.component.html',
  styleUrls: ['./upload-photo-element.component.less']
})
export class UploadPhotoElementComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() id: string;
  @Input() existingPhotos: Array<ImageFile>;

  @Output() photosChanged: EventEmitter<Array<ImageFile>>;
  @Output() uploadingFiles: EventEmitter<boolean>;

  public uploadInProgress: boolean;
  public notUploadedFiles: Array<ImageFile>;
  public displayShake: boolean;
  private verifyModal: any;
  public removeFile: ImageFile;
  public mobileTouchingPhoto: ImageFile;
  private eventListeners: Array<{element: HTMLElement, type: string, listener: any}>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private globalImageService: GlobalImageService,
              private materialize: Angular2MaterializeV1Service) {
    this.displayShake = false;
    this.existingPhotos = [];
    this.photosChanged = new EventEmitter<Array<ImageFile>>();
    this.uploadingFiles = new EventEmitter<boolean>();
    this.uploadInProgress = false;
    this.notUploadedFiles = [];
    this.removeFile = new ImageFile();
    this.mobileTouchingPhoto = undefined;
    this.eventListeners = [];
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.verifyModal = this.materialize.initModal('#verify_' + this.id.replace(' ', '_'));
  }

  ngOnDestroy(): void {
    while(this.eventListeners.length > 0) {
      const eventListener = this.eventListeners.pop();
      eventListener.element.removeEventListener(eventListener.type, eventListener.listener);
    }
  }

  private preventDefault(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  public onDragOver(evt) {
    this.preventDefault(evt);

    if (!this.displayShake) {
      this.displayShake = true;
    }
  }

  public onDragLeave(evt) {
    this.preventDefault(evt);

    if (this.displayShake) {
      this.displayShake = false;
    }
  }

  public onDrop(evt) {
    this.preventDefault(evt);
    this.displayShake = false;
    this.displayFiles(evt.dataTransfer.files, true);
  }

  public triggerPhotosClick() {
    if (isPlatformServer(this.platformId)) return;
    document.getElementById(this.id).click();
  }

  public async displayFiles(files: FileList, sendEvent: boolean) {
    if (!files || files.length === 0) return;

    const uploadedFiles = [];
    this.notUploadedFiles = await this.globalImageService.convertToLocalURL(files);
    if (!this.notUploadedFiles) return;

    this.uploadInProgress = true;
    this.uploadingFiles.emit(this.uploadInProgress);

    for (let i = 0; i < files.length; ++i) {
      this.notUploadedFiles[i].uploading = true;
      this.notUploadedFiles[i].progress = 0;
      try {
        uploadedFiles.push(await this.globalImageService.uploadPhoto(files[i], this.notUploadedFiles[i]));
      } catch (e) {
        this.materialize.toast({
          html: `<span>${files[i].name} failed to upload.</span><button class="btn-flat toast-action" onclick="M.Toast.dismissAll();">dismiss</button>`,
          displayLength: 6000
        });
      }
      this.notUploadedFiles[i].uploading = false;
      this.notUploadedFiles[i].uploaded = true;
    }

    this.uploadInProgress = false;
    this.uploadingFiles.emit(this.uploadInProgress);

    this.notUploadedFiles = [];
    this.existingPhotos = this.existingPhotos.concat(uploadedFiles);

    if (sendEvent)
      this.photosChanged.emit(this.existingPhotos);
  }

  public openModal(file: ImageFile) {
    this.removeFile = file;
    this.verifyModal.open();
  }

  public removeImage() {
    const index = this.existingPhotos.findIndex(o => o === this.removeFile);
    if (index >= 0) {
      this.existingPhotos.splice(index, 1);
      this.photosChanged.emit(this.existingPhotos);
    }
    this.removeFile = new ImageFile();
  }

  public setElementHeights() {
    if (isPlatformServer(this.platformId)) return;
    const elms: NodeListOf<HTMLElement> = document.querySelectorAll('.displayed-image');

    let greatestHeight = 0;
    for (let i = 0; i < elms.length; ++i) {
      greatestHeight = elms[i].parentElement.offsetHeight > greatestHeight
        ? elms[i].parentElement.offsetHeight
        : greatestHeight;
    }

    for (let i = 0; i < elms.length; ++i) {
      elms[i].parentElement.style.height = `${greatestHeight}px`;
    }
  }

  public addMobileTouchEvent(file: ImageFile) {
    if (isPlatformServer(this.platformId)) return;
    const element = document.getElementById(file.url);
    const touchstartListener = {
      element: element,
      type: 'touchstart',
      listener: ()=>{this.mobileTouchingPhoto = file}
    };
    const touchendListener = {
      element: element,
      type: 'touchend',
      listener: ()=>{this.mobileTouchingPhoto = undefined}
    };

    touchstartListener.element.addEventListener(touchstartListener.type, touchstartListener.listener);
    touchendListener.element.addEventListener(touchendListener.type, touchendListener.listener);

    this.eventListeners.push(touchstartListener);
    this.eventListeners.push(touchendListener);
    this.setElementHeights();
  }
}
