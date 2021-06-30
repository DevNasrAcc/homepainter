import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Details} from '../../../../models/project/details/details';
import {AnalyticsService} from '../../../../services/analytics.service';
import {DetailsCommunicationService} from '../../services/details-communication.service';
import {DetailsExteriorItem} from "../../../../models/project/details/details.exterior-item";
import {DetailsDeckSize} from "../../../../models/project/details/details.deck-size";
import {DetailsGarageSize} from "../../../../models/project/details/details.garage-size";
import {Subject} from 'rxjs';
import {filter, takeUntil} from "rxjs/operators";
import {GlobalImageService} from "../../../../services/global-image.service";
import {ImageFile} from "../../../../models/imageFile";
import {isPlatformServer} from "@angular/common";
import {DetailsExteriorObject} from "../../../../models/project/details/details.exterior-object";

@Component({
  selector: 'form-details-exterior-details',
  templateUrl: './exterior-details.component.html',
  styleUrls: ['./exterior-details.component.less']
})
export class ExteriorDetailsComponent implements OnInit {

  private ngUnsubscribe: Subject<boolean>;

  public details: Details;
  private uploadingFiles: boolean;
  public selectedIndex: number;
  public paintItems: Array<{title: string, type: string, selected: boolean}>;
  public sidingTypes: Array<{title: string, sidingType: string, selected: boolean}>;
  public paintConditions: Array<{title: string, condition: string, selected: boolean}>;
  public sides: Array<{title: string, side: string, selected: boolean}>;
  public deckSizes: Array<DetailsDeckSize>;
  public garageSizes: Array<DetailsGarageSize>;

  public stories: Array<{ value: any, text?: string, disabled?: boolean }>;
  public squareFootage: number;

  // tslint:disable-next-line:max-line-length
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private localStorageService: LocalStorageService,
              private globalImageService: GlobalImageService, private analytics: AnalyticsService,
              private detailsCommunicationService: DetailsCommunicationService, private route: ActivatedRoute,
              private router: Router) {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);
    this.ngUnsubscribe = new Subject<boolean>();
    this.uploadingFiles = false;

    // if platform server, it does not have access to a local storage and therefore, no access to an index 0 of empty array
    if (isPlatformServer(this.platformId)) {
      this.details.exterior.push(new DetailsExteriorObject());
    }

    this.resetPageOnStructureChange();
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((evt) => evt instanceof NavigationEnd))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.resetPageOnStructureChange());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  private async resetPageOnStructureChange(): Promise<void> {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'exterior_details';
    this.analytics.pageAction(details);

    if (
      this.router.url.indexOf('/details/exterior-details') < 0 ||
      !this.route.snapshot.params.structureIndex ||
      isNaN(parseInt(this.route.snapshot.params.structureIndex)) ||
      parseInt(this.route.snapshot.params.structureIndex) < 0 ||
      parseInt(this.route.snapshot.params.structureIndex) > this.details.exterior.length
    ) {
      this.router.navigateByUrl('/page-not-found');
      return;
    }

    this.selectedIndex = parseInt(this.route.snapshot.params.structureIndex);
    this.initNumberOfStories();
    this.initPaintItems();
    this.initSidingTypes();
    this.initPaintConditions();
    this.initSides();
    this.initDeckSizes();
    this.initGarageSizes();

    this.detailsCommunicationService.setProgress(this.details);

    this.validateForm();
  }

  public initNumberOfStories(): void {
    this.stories = [];

    for (let i = 1; i < 6; i++) {
      const temp = {value: i, text: i.toString(), disabled: false};
      this.stories.push(temp);
    }

    if (this.details.exterior[this.selectedIndex].type !== 'deck') {


      if (this.details.exterior[this.selectedIndex].numberOfStories === 0) {
        this.details.exterior[this.selectedIndex].numberOfStories = 1;
        this.localStorageService.saveProjectDetails(this.details);
      }
    }
  }

  public initPaintItems(): void {
    let items = [
      {title: 'Exterior Walls', type: 'siding', selected: false},
      {title: 'Trim', type: 'trim', selected: false},
      {title: 'Soffit', type: 'soffit', selected: false},
      {title: 'Facia', type: 'facia', selected: false},
      {title: 'Window trim', type: 'windowTrim', selected: false},
      {title: 'Gutters', type: 'gutters', selected: false},
      {title: 'Exterior door', type: 'exteriorDoor', selected: false}
    ];

    if (this.details.exterior[this.selectedIndex].type !== 'shed') {
      items.push({title: 'Garage door', type: 'garageDoor', selected: false})
    }

    this.paintItems = [];
    for (let item of items) {
      this.paintItems.push(item);
    }

    for (let i = 0; i < this.details.exterior[this.selectedIndex].items.length; i++) {
      for (let j = 0; j < this.paintItems.length; j++) {
        if (this.details.exterior[this.selectedIndex].items[i].type === this.paintItems[j].type) {
          this.paintItems[j].selected = true;
          break;
        }
      }
    }
  }

  public initSidingTypes(): void {
    this.sidingTypes = [
      {title: 'Brick', sidingType: 'brick', selected: false},
      {title: 'Wood', sidingType: 'wood', selected: false},
      {title: 'Vinyl', sidingType: 'vinyl', selected: false},
      {title: 'Stucco', sidingType: 'stucco', selected: false},
      {title: 'Other', sidingType: 'other', selected: false},
    ];

    let siding = this.details.exterior[this.selectedIndex].items.find(e => e.type === 'siding');
    if (siding?.sidingTypes?.length > 0) {
      for (let sidingTypeOption of this.sidingTypes) {
        if (siding.sidingTypes.find(s => s === sidingTypeOption.sidingType)) {
          sidingTypeOption.selected = true;
        }
      }
    }
  }

  public initPaintConditions(): void {
    let items = [
      {title: 'Good', condition: 'good', selected: false},
      {title: 'Some flaking or chipping paint', condition: 'someFlaking', selected: false},
      {title: 'A lot of flaking or chipping paint', condition: 'aLotOfFlaking', selected: false},
    ];

    this.paintConditions = [];
    for (let item of items) {
      this.paintConditions.push(item);
    }

    for (let condition of this.paintConditions) {
      if (condition.condition === this.details.exterior[this.selectedIndex].paintCondition) {
        condition.selected = true;
        break;
      }
    }
  }

  public initSides(): void {
    let items = [
      {title: 'Front', side: 'front', selected: false},
      {title: 'Left', side: 'left', selected: false},
      {title: 'Right', side: 'right', selected: false},
      {title: 'Back', side: 'back', selected: false}
    ];

    this.sides = [];
    for (let item of items) {
      this.sides.push(item);
    }

    let sidingItem = this.details.exterior[this.selectedIndex].items.find((e) => e.type === 'siding');
    if (sidingItem) {

      //Initialize sidesToPaint
      for (let side of this.sides) {
        for (let s of sidingItem.sidesToPaint) {
          if (side.side === s) {
            side.selected = true;
          }
        }
      }
    }
  }

  public initDeckSizes(): void {
    let items = [
      new DetailsDeckSize({name: 'small', squareFootage: 300, label: '12x12 or less than 300 sq. ft'}),
      new DetailsDeckSize({name: 'medium', squareFootage: 400, label: '15x20 or 300-400 sq. ft'}),
      new DetailsDeckSize({name: 'large', squareFootage: 500, label: '20x20 or greater than 400 sq. ft'})
    ];

    this.deckSizes = [];
    for (let item of items) {
      this.deckSizes.push(item);
    }
  }

  public initGarageSizes(): void {
    let items = [
      new DetailsGarageSize({label: '1 Car', size: 1}),
      new DetailsGarageSize({label: '2 Car', size: 2}),
      new DetailsGarageSize({label: '3 Car', size: 3}),
      new DetailsGarageSize({label: '4 Car', size: 4})
    ];

    this.garageSizes = [];
    for (let item of items) {
      this.garageSizes.push(item);
    }
  }

  public incrementNumberOfStories() {
    if (this.details.exterior[this.selectedIndex].numberOfStories < 5) {
      this.details.exterior[this.selectedIndex].numberOfStories += 1;
    }
    this.numberOfStoriesChange();
  }

  public decrementNumberOfStories() {
    if (this.details.exterior[this.selectedIndex].numberOfStories > 1) {
      this.details.exterior[this.selectedIndex].numberOfStories -= 1;
    }
    this.numberOfStoriesChange();
  }

  public numberOfStoriesChange(evt?: any) {
    if (evt) {
      this.details.exterior[this.selectedIndex].numberOfStories = parseInt(evt.target.value);
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.exterior[this.selectedIndex].type}_height`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public onSquareFootageChange(evt?: any){
    if (evt){
      this.details.exterior[this.selectedIndex].squareFootage = parseInt(evt.target.value);
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.exterior[this.selectedIndex].type}_square_footage`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectPaintItem(index) {
    this.paintItems[index].selected = !this.paintItems[index].selected;

    // remove old item
    for (let i = 0; i < this.details.exterior[this.selectedIndex].items.length; i++) {
      if (this.details.exterior[this.selectedIndex].items[i].type === this.paintItems[index].type) {
        if (this.details.exterior[this.selectedIndex].items[i].type === 'siding') {
          this.sides.forEach( e => e.selected = false );
          this.sidingTypes.forEach( e => e.selected = false );
        }
        this.details.exterior[this.selectedIndex].items.splice(i, 1);
        break;
      }
    }

    if (this.paintItems[index].selected)
      this.details.exterior[this.selectedIndex].items.push(
        new DetailsExteriorItem({ type: this.paintItems[index].type})
      );

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `exterior_paint_item`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectSidesToPaint(index) {
    this.sides[index].selected = !this.sides[index].selected;

    let sidingItem = this.details.exterior[this.selectedIndex].items.find((e) => e.type === 'siding');
    if (!sidingItem) return;

    //remove old item
    for (let i = 0; i < sidingItem.sidesToPaint.length; i++) {
      if (sidingItem.sidesToPaint[i] === this.sides[index].side) {
        sidingItem.sidesToPaint.splice(i, 1);
      }
    }

    if (this.sides[index].selected) {
      sidingItem.sidesToPaint.push(this.sides[index].side);
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.exterior[this.selectedIndex].type}_sidesToPaint`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectSidingType(index) {
    this.sidingTypes[index].selected = !this.sidingTypes[index].selected;
    let siding = this.details.exterior[this.selectedIndex].items.find(e => e.type === 'siding');
    if (this.sidingTypes[index].selected) {
      if (!siding.sidingTypes.includes(this.sidingTypes[index].sidingType)) {
        siding.sidingTypes.push(this.sidingTypes[index].sidingType);
      }
    } else {
      siding.sidingTypes = siding.sidingTypes.filter(e => e !== this.sidingTypes[index].sidingType);
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.exterior[this.selectedIndex].type}_sidingType`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectDeckElevation(elevation: string) {
    this.details.exterior[this.selectedIndex].deckElevation = elevation;

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.exterior[this.selectedIndex].type}_deckElevation`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectDeckTreatment(treatment: string) {
    this.details.exterior[this.selectedIndex].deckTreatment = treatment;

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.exterior[this.selectedIndex].type}_deckTreatment`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectDeckSize(deckSize: DetailsDeckSize) {
    this.details.exterior[this.selectedIndex].deckSize = deckSize;

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.exterior[this.selectedIndex].type}_deckSize`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectGarageSize(garageSize: DetailsGarageSize) {
      this.details.exterior[this.selectedIndex].garageSize = garageSize;
      const details = this.analytics.eventAction.project.updated;
      details.label.value = `${this.details.exterior[this.selectedIndex].type}_garageSize`;
      this.analytics.pageAction(details);

      this.validateForm();
    }

  public selectPaintCondition(index) {
    for (let i = 0; i < this.paintConditions.length; i++) {
      if (i === index) {
        this.paintConditions[i].selected = true;
        this.details.exterior[this.selectedIndex].paintCondition = this.paintConditions[i].condition;
      } else {
        this.paintConditions[i].selected = false;
      }
    }

    if (this.paintConditions[index].selected) {
      this.details.exterior[this.selectedIndex].paintCondition = this.paintConditions[index].condition;
    } else {
      this.details.exterior[this.selectedIndex].paintCondition = '';
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.exterior[this.selectedIndex].type}_paintCondition`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public onSwitchToMobile() {
    this.detailsCommunicationService.switchToMobile();
  }

  public onFileListChange(photos: Array<ImageFile>) {
    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'exterior_photos';
    this.analytics.pageAction(details);

    this.details.exterior[this.selectedIndex].photos = photos;
    this.validateForm();
  }

  public onUploadingFilesChange(uploading: boolean) {
    this.uploadingFiles = uploading;
    this.validateForm();
  }

  public validateForm(): void {
    const valid = this.details.exterior[this.selectedIndex].validateExterior() && !this.uploadingFiles;
    this.detailsCommunicationService.formEvent(this.details, valid);
  }

}
