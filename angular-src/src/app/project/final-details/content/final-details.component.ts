import {Component, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {Details} from '../../../models/project/details/details';
import {AnalyticsService} from '../../../services/analytics.service';
import {LocalStorageService} from '../../../services/local-storage.service';
import {Router} from '@angular/router';
import {isPlatformBrowser} from "@angular/common";

declare var google: any; // materialize

@Component({
  selector: 'app-final-details[editable][showEstimates][details]',
  templateUrl: './final-details.component.html',
  styleUrls: ['./final-details.component.less']
})
export class FinalDetailsComponent implements OnInit {

  @Input() editable: boolean;
  @Input() showEstimates: boolean;
  @Input() details: Details;

  public charLen: number;
  public mapVisible: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private analytics: AnalyticsService,
              public localStorageService: LocalStorageService, private router: Router) {
    this.details = new Details();
    this.charLen = this.details.additionalDetailsComment.length;
    this.mapVisible = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {}

  // @ts-ignore
  public onMapLoad(mapInstance: google.maps.Map) {
    new google.maps.KmlLayer({
      url: 'https://us-east-1.linodeobjects.com/homepainter-kml-storage/zip' + this.details.address.zipCode + '.kml',
      suppressInfoWindows: true,
      map: mapInstance
    });
  }

  public toggleMap(){
    this.mapVisible = !this.mapVisible;
  }

  public clickedEdit(url, label): void {
    const details = this.analytics.eventAction.project.edit;
    details.label.value = label;
    this.analytics.pageAction(details);
    this.router.navigateByUrl(url);
  }

  public updateCharsRemaining() {
    this.charLen = this.details.additionalDetailsComment.length;
    this.localStorageService.saveProjectDetails(this.details);
  }

  public trackPageAction() {
    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'review_additional_details';
    this.analytics.pageAction(details);
  }
}
