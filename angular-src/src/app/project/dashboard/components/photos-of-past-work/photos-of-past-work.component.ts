import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ImageFile} from '../../../../models/imageFile';
import {ImageViewerService} from '../../../../services/image-viewer.service';

@Component({
  selector: 'app-photos-of-past-work[photosOfPastWork]',
  templateUrl: './photos-of-past-work.component.html',
  styleUrls: ['./photos-of-past-work.component.less']
})
export class PhotosOfPastWorkComponent implements OnInit {

  @ViewChild('outerWrapper') private outerWrapper: ElementRef;

  @Input() public photosOfPastWork: Array<ImageFile>;
  public canMoveLeft: boolean;
  public canMoveRight: boolean;

  constructor(public imageViewerService: ImageViewerService) {
  }

  ngOnInit(): void {
  }

  public move(movementPX: number) {
    this.outerWrapper.nativeElement.scrollLeft += movementPX;
    this.updateArrows();
  }

  public updateArrows(): void {
    const max = this.outerWrapper.nativeElement.scrollWidth - this.outerWrapper.nativeElement.clientWidth;
    this.canMoveRight = this.outerWrapper.nativeElement.scrollLeft < max;
    this.canMoveLeft = this.outerWrapper.nativeElement.scrollLeft > 0;
  }
}
