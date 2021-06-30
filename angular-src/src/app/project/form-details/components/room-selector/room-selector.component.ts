import {Component, OnInit} from '@angular/core';
import {DetailsInteriorObject} from '../../../../models/project/details/details.interior-object';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Details} from '../../../../models/project/details/details';
import {DetailsCommunicationService} from '../../services/details-communication.service';
import {AnalyticsService} from '../../../../services/analytics.service';

@Component({
  selector: 'form-details-room-selector',
  templateUrl: './room-selector.component.html',
  styleUrls: ['./room-selector.component.less']
})
export class RoomSelectorComponent implements OnInit {

  private details: Details;
  public roomObjects = [
    {title: 'Living Room', type: 'livingRoom', roomCount: 0, autoIncrease: 1},
    {title: 'Bedroom', type: 'bedRoom', roomCount: 0, autoIncrease: 1},
    {title: 'Bathroom', type: 'bathroom', roomCount: 0, autoIncrease: 1},
    {title: 'Dining Room', type: 'diningRoom', roomCount: 0, autoIncrease: 1},
    {title: 'Kitchen', type: 'kitchen', roomCount: 0, autoIncrease: 1},
    {title: 'Laundry Room', type: 'laundryRoom', roomCount: 0, autoIncrease: 1},
    {title: 'Entryway', type: 'entryway', roomCount: 0, autoIncrease: 1},
    {title: 'Hallway', type: 'hallway', roomCount: 0, autoIncrease: 1},
    {title: 'Stairway', type: 'stairway', roomCount: 0, autoIncrease: 1},
    {title: 'Sun Room', type: 'sunRoom', roomCount: 0, autoIncrease: 1},
    {title: 'Garage', type: 'garage', roomCount: 0, autoIncrease: 1},
    {title: 'Other', type: 'other', roomCount: 0, autoIncrease: 1}
  ];

  constructor(public localStorageService: LocalStorageService, private detailsCommunicationService: DetailsCommunicationService, private analytics: AnalyticsService) {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);
    this.validateForm();
  }

  ngOnInit() {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'room_selector';
    this.analytics.pageAction(details);

    // create a temporary cache so we can avoid a double for loop to increase room counts
    let cache: any = {};
    for(let i = 0; i < this.roomObjects.length; i++) {
      cache[this.roomObjects[i].type] = i;
    }

    for(let i = 0; i < this.details.interior.length; i++) {
      this.roomObjects[cache[this.details.interior[i].type]].roomCount++;
    }
  }

  // noinspection JSMethodCanBeStatic
  public onChildIncreased(obj): void {
    let numSimilarRooms = 0;

    for(let i = 0; i < this.details.interior.length; i++) {
      if(this.details.interior[i].type === this.roomObjects[obj.id].type)
        numSimilarRooms++;
    }

    const increaseAmount = obj.count - numSimilarRooms;

    for(let i = 0; i < increaseAmount; i++) {
      let detailsInteriorObj = new DetailsInteriorObject();
      detailsInteriorObj.type = this.roomObjects[obj.id].type;
      detailsInteriorObj.defaultName = `${this.roomObjects[obj.id].title} ${numSimilarRooms + 1}`;
      this.details.interior.push(detailsInteriorObj);
      this.sortInteriorByType();
      numSimilarRooms++;
    }

    this.validateForm();
  }

  // noinspection JSMethodCanBeStatic
  public onChildDecreased(obj): void {
    let numSimilarRooms = 0;

    for(let i = 0; i < this.details.interior.length; i++) {
      if(this.details.interior[i].type === this.roomObjects[obj.id].type)
        numSimilarRooms++;
    }

    let decreaseAmount = obj.count - numSimilarRooms;

    for(let i = this.details.interior.length - 1; i>= 0 && decreaseAmount !== 0; i--) {
      if(this.details.interior[i].type === this.roomObjects[obj.id].type) {
        this.details.interior.splice(i, 1);
        //increase the tracked amount, as it should be negative
        decreaseAmount++;
      }
    }

    this.validateForm();
  }

  private validateForm(): void {
    const valid = this.details.validateNumberOfInteriorRooms();

    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'room_selector';
    this.analytics.pageAction(details);

    this.detailsCommunicationService.formEvent(this.details, valid);
  }

  public sortInteriorByType(): void {
    this.details.interior.sort((obj1: DetailsInteriorObject, obj2: DetailsInteriorObject) => {
      return obj1.type < obj2.type ? -1 : obj1.type > obj2.type ? 1 : 0;
    });
  }
}
