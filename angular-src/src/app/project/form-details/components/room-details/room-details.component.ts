import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {isPlatformServer} from '@angular/common';
import {filter, takeUntil} from 'rxjs/operators';
import {DetailsRoomSize} from '../../../../models/project/details/details.room-size';
import {DetailsDecorItem} from '../../../../models/project/details/details.decor-item';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Details} from '../../../../models/project/details/details';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {AnalyticsService} from '../../../../services/analytics.service';
import {DetailsDecorItemAdditionalDetail} from '../../../../models/project/details/details.decor-item.additional-detail';
import {LocationService} from '../../services/location.service';
import {DetailsCommunicationService} from '../../services/details-communication.service';
import {DetailsRoomHeight} from '../../../../models/project/details/details.room-height';
import {Subject} from 'rxjs';
import {GlobalImageService} from "../../../../services/global-image.service";
import {ImageFile} from 'src/app/models/imageFile';
import {DetailsInteriorObject} from 'src/app/models/project/details/details.interior-object';


@Component({
  selector: 'form-details-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.less']
})
export class RoomDetailsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean>;
  public uploadingFiles: boolean;

  public details: Details;
  public selectedIndex: number;
  public roomHeights: Array<DetailsRoomHeight>;
  public roomSizes: Array<DetailsRoomSize>;


  public numberOfWalls: number;
  public numberOfAccentWalls: number;
  public cabinetGrainType: any;
  public cabinetTreatment: any;
  public cabinetCondition: any;
  public numberOfCabinetDoors: number;
  public numberOfCabinetDrawers: number;
  public numberOfDoors: number;
  public numberOfDoorFrames: number;
  public holesAndCracks: boolean;
  public largeHolesAndCracks: boolean;
  public customDimensionInput: boolean;
  public customHeightInput: boolean;
  public customRoomSize: DetailsRoomSize;
  public customRoomHeight: DetailsRoomHeight;
  public data1: Array<{ value: any, text?: string, disabled?: boolean }>;
  public data2: Array<{ value: any, text?: string, disabled?: boolean }>;
  public dataAccentWall: Array<{ value: any, text?: string, disabled?: boolean }>;
  public data3: Array<{ value: any, text?: string, disabled?: boolean }>;
  public data4: Array<{ value: any, text?: string, disabled?: boolean }>;
  public data30: Array<{ value: any, text?: string, disabled?: boolean }>;
  public dataWall: Array<{ value: any, text?: string, disabled?: boolean }>;

  public paintItems = [
    {title: 'Walls', type: 'wall', selected: false},
    {title: 'Ceiling', type: 'ceiling', selected: false},
    {title: 'Accent Wall(s)', type: 'accentWall', selected: false},
    {title: 'Cabinets', type: 'cabinets', selected: false},
    {title: 'Baseboard', type: 'baseboard', selected: false},
    {title: 'Door Frame', type: 'doorFrame', selected: false},
    {title: 'Ceiling Trim', type: 'crownMolding', selected: false},
    {title: 'Door(s)', type: 'door', selected: false},
    {title: 'Window Trim', type: 'window', selected: false},
    {title: 'Fireplace Mantel', type: 'fireplaceMantel', selected: false}
  ];

  public ceilingTypes = [
    {title: 'Conventional (flat)', type: 'conventional', selected: false},
    {title: 'Vaulted (V-shaped)', type: 'vaulted', selected: false}
  ];

  public wallConditionItems = [
    {title: 'Unpainted Drywall', type: 'unpaintedDrywall', selected: false, desc: 'Are any walls new drywall?'},
    {title: 'Dark Walls', type: 'darkWalls', selected: false, desc: 'Are any walls painted dark?'},
    {title: 'Drywall Repair', type: 'drywallRepair', selected: false, desc: 'Do any walls have holes or cracks?'},
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private router: Router, private detailsCommunicationService: DetailsCommunicationService,
              private route: ActivatedRoute, private materialize: Angular2MaterializeV1Service,
              private analytics: AnalyticsService, public localStorageService: LocalStorageService,
              private locationService: LocationService, public globalImageService: GlobalImageService)
  {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);
    this.ngUnsubscribe = new Subject<boolean>();

    // if platform server, it does not have access to a local storage and therefore, no access to an index 0 of empty array
    if (isPlatformServer(this.platformId)) {
      this.details.interior.push(new DetailsInteriorObject());
    }

    this.resetPageOnRoomChange();

    // Temporary initialization of variables
    this.data1 = [];
    this.data2 = [];
    this.data3 = [];
    this.data4 = [];
    this.data30 = [];

    // Initialize select values
    for (let i = 0; i < 31; i++) {
      const temp = {value: i, text: i.toString()};
      if (i > 0) {
        if (i < 2) {
          this.data1.push(temp);
        }
        if (i < 3) {
          this.data2.push(temp);
        }
        if (i < 4) {
          this.data3.push(temp);
        }
        if (i < 5) {
          this.data4.push(temp);
        }
      }

      if (i >= 0) {
        this.data30.push(temp);
      }
    }

    if (this.numberOfAccentWalls === 0) {
      this.dataWall = this.data4;
    } else if (this.numberOfAccentWalls === 1) {
      this.dataWall = this.data3;
    } else if (this.numberOfAccentWalls === 2) {
      this.dataWall = this.data3;
    }

    if (this.numberOfWalls === 3) {
      this.dataAccentWall = this.data2;
    } else if (this.numberOfWalls < 3) {
      this.dataAccentWall = this.data2;
    }
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((evt) => evt instanceof NavigationEnd))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.resetPageOnRoomChange());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  private async resetPageOnRoomChange(): Promise<void> {
    if (
      this.router.url.indexOf('/details/room-details') < 0 ||
      !this.route.snapshot.params.roomIndex ||
      isNaN(parseInt(this.route.snapshot.params.roomIndex)) ||
      parseInt(this.route.snapshot.params.roomIndex) < 0 ||
      parseInt(this.route.snapshot.params.roomIndex) > this.details.interior.length
    ) {
      this.router.navigateByUrl('/page-not-found');
      return;
    }

    this.uploadingFiles = false;
    this.selectedIndex = parseInt(this.route.snapshot.params.roomIndex);
    this.roomHeights = [];
    this.roomSizes = [];
    this.initPaintItems();
    this.initWall();
    this.initCeilingTypes();
    this.initCabinets();
    this.initNumberOfDoorFrames();
    this.initNumberOfDoors();
    this.initWallConditionItems();

    if(this.details.interior[this.selectedIndex].size.name === 'custom'){
      this.customRoomSize = this.details.interior[this.selectedIndex].size;
      this.customDimensionInput = true;
    }
    else{
      this.customRoomSize = new DetailsRoomSize({name: 'custom', length: 1, width: 1});
      this.customDimensionInput = false;
    }

    if(this.details.interior[this.selectedIndex].height.name === 'custom'){
      this.customRoomHeight = this.details.interior[this.selectedIndex].height;
      this.customHeightInput = true;
    }
    else{
      this.customRoomHeight = new DetailsRoomHeight({name: 'custom', height: 6});
      this.customHeightInput = false;
    }

    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = this.details.interior[this.selectedIndex].type;
    this.analytics.pageAction(details);

    await this.getRoomSizes();
    await this.getRoomHeights();

    this.detailsCommunicationService.setProgress(this.details);

    this.validateForm();
  }

  public updateCustomLabel(customRoomSize: DetailsRoomSize){
    customRoomSize.label = customRoomSize.length + '\'x' + customRoomSize.width + '\'';
    this.validateForm();
  }

  public updateCustomHeightLabel(customRoomHeight: DetailsRoomHeight){
    customRoomHeight.label = customRoomHeight.height + '\'';
    this.validateForm();
  }

  public selectRoomSize(roomSize: DetailsRoomSize): void {
    if (roomSize.name === 'custom'){
      this.updateCustomLabel(roomSize);
      this.customDimensionInput = true;
    }
    else{
      this.customDimensionInput = false;
    }

    this.details.interior[this.selectedIndex].size = roomSize;

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_size`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectRoomHeight(roomHeight: DetailsRoomHeight) {
    if (roomHeight.name === 'custom'){
      this.updateCustomHeightLabel(roomHeight);
      this.customHeightInput = true;
    }
    else{
      this.customHeightInput = false;
    }

    this.details.interior[this.selectedIndex].height = roomHeight;

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_height`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public initPaintItems(): void {
    // set it all back to false
    for (let i = 0; i < this.paintItems.length; i++) {
      this.paintItems[i].selected = false;
    }

    if (this.details.interior.length < 1 || !this.details.interior[this.selectedIndex].items) {
      return;
    }

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      for (let j = 0; j < this.paintItems.length; j++) {
        if (this.details.interior[this.selectedIndex].items[i].type === this.paintItems[j].type) {
          this.paintItems[j].selected = true;
          break;
        }
      }
    }
  }

  public selectPaintItem(index): void {
    const details = this.analytics.eventAction.project.updated.clone();
    details.label.value = `${this.details.interior[this.selectedIndex].type}_paint_item`;
    this.analytics.pageAction(details);

    this.paintItems[index].selected = !this.paintItems[index].selected;
    if (index === 2) {
      if (this.paintItems[index].selected === false) {
        this.numberOfAccentWalls = 0;
        this.dataWall = this.data4;
      } else {
        if (this.numberOfWalls > 3) {
          this.numberOfWalls = 3;
        }
        this.numberOfAccentWalls = 1;
      }
    } else if (index === 0) {
      if (this.paintItems[index].selected === false) {
        this.numberOfWalls = 0;
      } else {
        if(this.details.interior[this.selectedIndex].defaultName.includes("Hallway")){
          this.numberOfWalls = 2;
        }else{
          this.numberOfWalls = 4;
        }
      }
    }

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === this.paintItems[index].type) {
        this.details.interior[this.selectedIndex].items.splice(i, 1);
        break;
      }
    }

    if (this.paintItems[index].selected) {
      const detailsDecorItem = new DetailsDecorItem();
      detailsDecorItem.type = this.paintItems[index].type;

      // set initial additional details if needed
      if (this.paintItems[index].type === 'ceiling') {
        for (let i = 0; i < this.ceilingTypes.length; i++) {
          if (this.ceilingTypes[i].selected) {
            detailsDecorItem.additionalDetails = new DetailsDecorItemAdditionalDetail({ceilingType: this.ceilingTypes[i].type});
          }
        }
      } else if (this.paintItems[index].type === 'cabinets') {
        detailsDecorItem.additionalDetails = new DetailsDecorItemAdditionalDetail({
          cabinetGrainType: this.cabinetGrainType,
          cabinetTreatment: this.cabinetTreatment,
          cabinetCondition: this.cabinetCondition
        });
      } else if (this.paintItems[index].type === 'door') {
        detailsDecorItem.additionalDetails = new DetailsDecorItemAdditionalDetail({amount: this.numberOfDoors});
      } else if (this.paintItems[index].type === 'doorFrame') {
        detailsDecorItem.additionalDetails = new DetailsDecorItemAdditionalDetail({amount: this.numberOfDoorFrames});
      } else if (this.paintItems[index].type === 'wall') {
        detailsDecorItem.additionalDetails = new DetailsDecorItemAdditionalDetail({amount: this.numberOfWalls});
      } else if (this.paintItems[index].type === 'accentWall') {
        detailsDecorItem.additionalDetails = new DetailsDecorItemAdditionalDetail({amount: this.numberOfAccentWalls});
      }

      this.details.interior[this.selectedIndex].items.push(detailsDecorItem);

      // return the number of walls and accent walls to a valid state
      if (this.paintItems[index].type === 'wall' || this.paintItems[index].type === 'accentWall') {
        this.selectNumberOfWalls();
        this.selectNumberOfAccentWalls();
      }

      // need to init some the condition items
      this.initWallConditionItems();
    }

    this.sortItemsToPaintByType(this.selectedIndex);

    this.validateForm();
  }

  public increment(surface) {

    if ('Wall' === surface) {
      if (this.numberOfWalls === 2 && this.numberOfAccentWalls === 2) {
        this.numberOfWalls += 1;
        this.numberOfAccentWalls -= 1;
        this.selectNumberOfWalls();
        this.selectNumberOfAccentWalls();
      } else {
        if (this.numberOfWalls < 4 && !(this.numberOfWalls + this.numberOfAccentWalls >= 4)) {
          this.numberOfWalls += 1;
          this.selectNumberOfWalls();
        }
      }
    } else if ('AccentWall' === surface) {
      if (this.numberOfAccentWalls === 1 && this.numberOfWalls === 3) {
        this.numberOfAccentWalls += 1;
        this.numberOfWalls -= 1;
        this.selectNumberOfWalls();
        this.selectNumberOfAccentWalls();
      }
      if (this.numberOfAccentWalls < 2 && !(this.numberOfWalls + this.numberOfAccentWalls >= 4)) {
        this.numberOfAccentWalls += 1;
        this.selectNumberOfAccentWalls();
      }
    } else if ('CabinetDoors' === surface) {
      if (this.numberOfCabinetDoors < 30) {
        this.numberOfCabinetDoors += 1;
        this.selectNumberOfCabinetDoors();
      }
    } else if ('CabinetDrawers' === surface) {
      if (this.numberOfCabinetDrawers < 30) {
        this.numberOfCabinetDrawers += 1;
        this.selectNumberOfCabinetDrawers();
      }
    } else if ('DoorFrames' === surface) {
      if (this.numberOfDoorFrames < 4) {
        this.numberOfDoorFrames += 1;
        this.selectNumberOfDoorFrames();
      }
    } else if ('Doors' === surface) {
      if (this.numberOfDoors < 4) {
        this.numberOfDoors += 1;
        this.selectNumberOfDoors();
      }
    }

  }

  public decrement(surface) {

    if ('Wall' === surface) {
      if (this.numberOfWalls > 1) {
        this.numberOfWalls -= 1;
        this.selectNumberOfWalls();
      }
    } else if ('AccentWall' === surface) {
      if (this.numberOfAccentWalls > 1) {
        this.numberOfAccentWalls -= 1;
        this.selectNumberOfAccentWalls();
      }
    } else if ('CabinetDoors' === surface) {
      if (this.numberOfCabinetDoors > 0) {
        this.numberOfCabinetDoors -= 1;
        this.selectNumberOfCabinetDoors();
      }
    } else if ('CabinetDrawers' === surface) {
      if (this.numberOfCabinetDrawers > 0) {
        this.numberOfCabinetDrawers -= 1;
        this.selectNumberOfCabinetDrawers();
      }
    } else if ('DoorFrames' === surface) {
      if (this.numberOfDoorFrames > 1) {
        this.numberOfDoorFrames -= 1;
        this.selectNumberOfDoorFrames();
      }
    } else if ('Doors' === surface) {
      if (this.numberOfDoors > 1) {
        this.numberOfDoors -= 1;
        this.selectNumberOfDoors();
      }
    }
  }

  public selectNumberOfWalls(evt?: any): void {

    if (this.numberOfWalls === 3) {
      this.dataAccentWall = this.data2;
    } else if (this.numberOfWalls < 3) {
      this.dataAccentWall = this.data2;
    }

    let accentWall = false;
    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'accentWall') {
        accentWall = true;
        break;
      }
    }

    if (evt) {
      if (accentWall) {
        if (parseInt(evt.target.value) === 4) {
          this.numberOfWalls = 3;
          this.numberOfAccentWalls = 1;
        } else if (parseInt(evt.target.value) === 3) {
          this.numberOfWalls = 3;
          this.numberOfAccentWalls = 1;
        } else if (parseInt(evt.target.value) === 2) {
          this.numberOfWalls = 2;
        } else if (parseInt(evt.target.value) === 1) {
          this.numberOfWalls = 1;
        }
      } else {
        this.numberOfWalls = parseInt(evt.target.value);
        this.numberOfAccentWalls = 0;
      }
    }

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'wall') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails.amount = this.numberOfWalls;
      } else if (this.details.interior[this.selectedIndex].items[i].type === 'accentWall') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails.amount = this.numberOfAccentWalls;
      }
    }

    const details = this.analytics.eventAction.project.updated.clone();
    details.label.value = `${this.details.interior[this.selectedIndex].type}_walls`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectNumberOfAccentWalls(evt?: any): void {
    if (this.numberOfAccentWalls === 0) {
      this.dataWall = this.data4;
    } else if (this.numberOfAccentWalls === 1) {
      this.dataWall = this.data3;
    } else if (this.numberOfAccentWalls === 2) {
      this.dataWall = this.data3;
    }

    if (evt) {
      if (parseInt(evt.target.value) === 2 && this.numberOfWalls >= 3) {
        this.numberOfWalls = 2;
        this.numberOfAccentWalls = 2;
      } else {
        if (this.numberOfWalls === 3) {
          this.numberOfAccentWalls = 1;
        } else {
          this.numberOfAccentWalls = parseInt(evt.target.value);
        }
      }
      return;
    }
    let accentWallIndex = -1;
    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'accentWall') {
        accentWallIndex = i;
        break;
      }
    }

    let wallIndex = -1;
    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'wall') {
        wallIndex = i;
        break;
      }
    }

    if (accentWallIndex !== -1) {
      this.details.interior[this.selectedIndex].items[accentWallIndex].additionalDetails.amount = this.numberOfAccentWalls;
    }

    if (wallIndex !== -1) {
      this.details.interior[this.selectedIndex].items[wallIndex].additionalDetails.amount = this.numberOfWalls;
    }

    const details = this.analytics.eventAction.project.updated.clone();
    details.label.value = `${this.details.interior[this.selectedIndex].type}_accent_walls`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public initWall(): void {
    this.numberOfWalls = 4;
    this.numberOfAccentWalls = 0;

    if (this.details.interior.length < 1 || !this.details.interior[this.selectedIndex].items) {
      return;
    }

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'wall' &&
        this.details.interior[this.selectedIndex].items[i].additionalDetails) {
        this.numberOfWalls = this.details.interior[this.selectedIndex].items[i].additionalDetails.amount;
      } else if (this.details.interior[this.selectedIndex].items[i].type === 'accentWall' &&
        this.details.interior[this.selectedIndex].items[i].additionalDetails) {
        this.numberOfAccentWalls = this.details.interior[this.selectedIndex].items[i].additionalDetails.amount;
      }
    }
  }

  public initWallConditionItems(): void {
    // set all items to false
    for (let i = 0; i < this.wallConditionItems.length; i++) {
      this.wallConditionItems[i].selected = false;
    }
    this.holesAndCracks = false;
    this.largeHolesAndCracks = false;

    // search to see if they have selected walls previously
    let wallItemIndex = -1;
    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'wall') {
        wallItemIndex = i;
        break;
      }
    }

    // if a previous wall item was not found, return
    if (wallItemIndex === -1) {
      return;
    }

    // select previously selected condition items if any
    // for each condition, i, in details
    for (let i = 0; i < this.details.interior[this.selectedIndex].items[wallItemIndex].additionalDetails.conditions.length; i++) {
      // for each condition, j, in the conditions list
      for (let j = 0; j < this.wallConditionItems.length; j++) {
        // if the conditions i and j are equal, then select the condition
        if (this.details.interior[this.selectedIndex].items[wallItemIndex].additionalDetails.conditions[i] ===
          this.wallConditionItems[j].type) {
          this.wallConditionItems[j].selected = true;
        }
      }
    }
  }

  public selectWallConditionItem(index): void {
    // get wall item index
    let wallItemIndex = -1;
    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'wall') {
        wallItemIndex = i;
        break;
      }
    }

    // reverse the selection of the clicked condition
    this.wallConditionItems[index].selected = !this.wallConditionItems[index].selected;

    // if darkWalls is selected, unselect unpaintedDrywall and none
    if (this.wallConditionItems[index].selected && this.wallConditionItems[index].type === 'darkWalls') {
      for (let i = 0; i < this.wallConditionItems.length; i++) {
        if (this.wallConditionItems[i].type === 'unpaintedDrywall') {
          this.wallConditionItems[i].selected = false;
        }
      }
    }

    // if unpaintedDrywall is selected, unselect dark walls and none
    if (this.wallConditionItems[index].selected && this.wallConditionItems[index].type === 'unpaintedDrywall') {
      for (let i = 0; i < this.wallConditionItems.length; i++) {
        if (this.wallConditionItems[i].type === 'darkWalls') {
          this.wallConditionItems[i].selected = false;
        }
      }
    }

    // Set the conditions array to contain each selected item from wallConditionItems
    this.details.interior[this.selectedIndex].items[wallItemIndex].additionalDetails.conditions = [];
    for (let i = 0; i < this.wallConditionItems.length; i++) {
      if (this.wallConditionItems[i].selected) {
        this.details.interior[this.selectedIndex].items[wallItemIndex].additionalDetails.conditions
          .push(this.wallConditionItems[i].type);
      }
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_wall_conditions`;
    this.analytics.pageAction(details);

    // validateForm
    this.validateForm();
  }

  public initCeilingTypes(): void {
    for (let i = 0; i < this.ceilingTypes.length; i++) {
      this.ceilingTypes[i].selected = false;
    }

    if (this.details.interior.length < 1 || !this.details.interior[this.selectedIndex].items) {
      return;
    }

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'ceiling' && this.details.interior[this.selectedIndex].items[i].additionalDetails) {

        for (let j = 0; j < this.ceilingTypes.length; j++) {
          if (this.details.interior[this.selectedIndex].items[i].additionalDetails.ceilingType === this.ceilingTypes[j].type) {
            this.ceilingTypes[j].selected = true;
            break;
          }
        }

        break;
      }
    }
  }

  public selectCeilingType(index): void {
    for (let i = 0; i < this.ceilingTypes.length; i++) {
      this.ceilingTypes[i].selected = false;
    }

    this.ceilingTypes[index].selected = true;

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'ceiling') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails = new DetailsDecorItemAdditionalDetail({ceilingType: this.ceilingTypes[index].type});
        break;
      }
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_ceiling_type`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public initCabinets(): void {
    let cabinetItemIndex = -1;
    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'cabinets') {
        cabinetItemIndex = i;
        break;
      }
    }

    if (cabinetItemIndex === -1) {
      // if no cabinet item exists, set all cabinet fields to false
      this.cabinetGrainType = 'smooth';
      this.cabinetTreatment = 'paint';
      this.cabinetCondition = 'bare';
      this.numberOfCabinetDoors = 0;
      this.numberOfCabinetDrawers = 0;
    } else {
      // if a cabinet item exists, set all cabinet fields equal to those from the paint estimate
      const cabinet = this.details.interior[this.selectedIndex].items[cabinetItemIndex];
      this.cabinetGrainType = cabinet.additionalDetails.cabinetGrainType || 'smooth';
      this.cabinetTreatment = cabinet.additionalDetails.cabinetTreatment || 'paint';
      this.cabinetCondition = cabinet.additionalDetails.cabinetCondition || 'bare';
      this.numberOfCabinetDoors = cabinet.additionalDetails.numberOfCabinetDoors || 0;
      this.numberOfCabinetDrawers = cabinet.additionalDetails.numberOfCabinetDrawers || 0;
    }

  }

  public selectNumberOfCabinetDoors(evt?: any): void {
    if (evt) {
      this.numberOfCabinetDoors = parseInt(evt.target.value);
    }
    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'cabinets') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails.numberOfCabinetDoors = this.numberOfCabinetDoors;
        break;
      }
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_cabinet_doors`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectNumberOfCabinetDrawers(evt?: any): void {

    if (evt) {
      this.numberOfCabinetDrawers = parseInt(evt.target.value);
    }


    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'cabinets') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails.numberOfCabinetDrawers = this.numberOfCabinetDrawers;
        break;
      }
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_cabinet_drawers`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectCabinetGrain(grain: string): void {
    this.cabinetGrainType = grain;

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'cabinets') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails.cabinetGrainType = this.cabinetGrainType;
        break;
      }
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_cabinet_grain`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public selectCabinetTreatment(): void {

    // Remove this line when implementing cabinet stain
    this.cabinetTreatment = 'paint';

    // Uncomment this line when implementing cabinet stain
    // this.cabinetTreatment = treatment;

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'cabinets') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails.cabinetTreatment = this.cabinetTreatment;
        break;
      }
    }

    this.validateForm();
  }

  public selectCabinetCondition(condition: string): void {
    this.cabinetCondition = condition;

    if (condition === 'painted') {
      this.selectCabinetTreatment();
    }

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'cabinets') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails.cabinetCondition = this.cabinetCondition;
        break;
      }
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_cabinet_condition`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public initNumberOfDoorFrames(): void {
    this.numberOfDoorFrames = 1;

    if (this.details.interior.length < 1 || !this.details.interior[this.selectedIndex].items) {
      return;
    }

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'doorFrame' && this.details.interior[this.selectedIndex].items[i].additionalDetails) {
        this.numberOfDoorFrames = this.details.interior[this.selectedIndex].items[i].additionalDetails.amount;
        break;
      }
    }
  }

  public selectNumberOfDoorFrames(evt?: any): void {
    if (evt) {
      this.numberOfDoorFrames = parseInt(evt.target.value);
    }
    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'doorFrame') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails = new DetailsDecorItemAdditionalDetail({amount: this.numberOfDoorFrames});
        break;
      }
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_door_frames`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public initNumberOfDoors(): void {
    this.numberOfDoors = 1;

    if (this.details.interior.length < 1 || !this.details.interior[this.selectedIndex].items) {
      return;
    }

    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (
        this.details.interior[this.selectedIndex].items[i].type === 'door' &&
        this.details.interior[this.selectedIndex].items[i].additionalDetails
      ) {
        this.numberOfDoors = this.details.interior[this.selectedIndex].items[i].additionalDetails.amount;
        break;
      }
    }
  }

  public selectNumberOfDoors(evt?: any): void {
    if (evt) {
      this.numberOfDoors = parseInt(evt.target.value);
    }
    for (let i = 0; i < this.details.interior[this.selectedIndex].items.length; i++) {
      if (this.details.interior[this.selectedIndex].items[i].type === 'door') {
        this.details.interior[this.selectedIndex].items[i].additionalDetails =
          new DetailsDecorItemAdditionalDetail({amount: this.numberOfDoors});
        break;
      }
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_doors`;
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public onSwitchToMobile() {
    this.detailsCommunicationService.switchToMobile();
  }

  public onFileListChange(photos: Array<ImageFile>) {
    const details = this.analytics.eventAction.project.updated;
    details.label.value = `${this.details.interior[this.selectedIndex].type}_photos`;
    this.analytics.pageAction(details);

    this.details.interior[this.selectedIndex].photos = photos;
    this.validateForm();
  }

  public onUploadingFilesChanged(uploading: boolean) {
    this.uploadingFiles = uploading;
    this.validateForm();
  }

  public validateForm(): void {
    const valid = this.details.validateRoom(this.selectedIndex) && !this.uploadingFiles;
    this.detailsCommunicationService.formEvent(this.details, valid);
  }

  private async getRoomHeights(): Promise<void> {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const zipCode = this.details.address.zipCode;
    const jobType = this.details.jobType;
    const roomType = this.details.interior[this.selectedIndex].type;
    this.roomHeights = await this.locationService.getRoomHeights(zipCode, jobType, roomType);
  }

  private async getRoomSizes(): Promise<void> {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const zipCode = this.details.address.zipCode;
    const jobType = this.details.jobType;
    const roomType = this.details.interior[this.selectedIndex].type;
    this.roomSizes = await this.locationService.getRoomSizes(zipCode, jobType, roomType);
  }

  public sortItemsToPaintByType(interiorIndex): void {
    this.details.interior[interiorIndex].items.sort((obj1: DetailsDecorItem, obj2: DetailsDecorItem) => {
      return obj1.type < obj2.type ? -1 : obj1.type > obj2.type ? 1 : 0;
    });
  }

}
