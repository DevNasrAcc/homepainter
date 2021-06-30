import {Component, OnInit} from '@angular/core';
import {AnalyticsService} from "../../../../services/analytics.service";
import {Details} from "../../../../models/project/details/details";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {DetailsCommunicationService} from "../../services/details-communication.service";
import {ImageFile} from "../../../../models/imageFile";

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.less']
})
export class PhotosComponent implements OnInit {

  public details: Details;
  private uploadingFiles: boolean;

  constructor(private analytics: AnalyticsService, private localStorageService: LocalStorageService,
              private detailsCommunicationService: DetailsCommunicationService)
  {
    this.details = localStorageService.getProjectDetails();
    this.uploadingFiles = false;
    this.detailsCommunicationService.setProgress(this.details);
    this.validateForm();
  }

  ngOnInit() {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'photos';
    this.analytics.pageAction(details);
  }

  public onUpdatePhotos(obj: any, newPhotos: Array<ImageFile>) {
    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${obj.defaultName}_photos`;
    this.analytics.pageAction(details);

    obj.photos = newPhotos;
    this.validateForm();
  }

  public onUploadingFilesChange(uploading: boolean) {
    this.uploadingFiles = uploading;
    this.validateForm();
  }

  public validateForm(): void {
    let valid = !this.uploadingFiles;

    for (let room of this.details.interior) {
      if (room.requiresDrywallPhotos())
        valid = valid && room.photos.length > 0;
    }

    for (let structure of this.details.exterior) {
      valid = valid && structure.photos.length > 0;
    }

    this.detailsCommunicationService.formEvent(this.details, valid);
  }
}
