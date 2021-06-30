import {Component, Inject, Input, PLATFORM_ID} from '@angular/core';
import {ImageFile} from "../../models/imageFile";
import {ImageViewerService} from "../../services/image-viewer.service";

@Component({
  selector: 'display-photo-element[photos]',
  templateUrl: './display-photo-element.component.html',
  styleUrls: ['./display-photo-element.component.less']
})
export class DisplayPhotoElementComponent {

  @Input() photos: Array<ImageFile>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public imageViewerService: ImageViewerService) {
  }

  ngOnInit() {
  }

}
