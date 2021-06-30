import {DetailsInteriorObject} from './details.interior-object';
import {DetailsExteriorObject} from './details.exterior-object';
import {DetailsEstimate} from './details.estimate';
import {Equals} from '../../equals';
import {Address} from '../../user/base/address';
import {environment} from '../../../../environments/environment';

export class Details extends Equals {
  public address: Address;
  public jobType: string;
  public decorType: string;
  public paintSupplier: string;
  public paintBrand: string;
  public paintProduct: string;
  public timeFrameStart: string;
  public timeFrameEnd: string;
  public expectedEndDate: string;
  public occupancy: string;
  public interior: Array<DetailsInteriorObject>;
  public exterior: Array<DetailsExteriorObject>;
  public additionalDetailsComment: string;
  public estimates: DetailsEstimate;
  public schemaVersion: string;

  constructor(obj ?: any) {
    super();

    if (obj === null || obj === undefined)
      obj = {};

    this.address = new Address(obj.address);
    this.jobType = obj.jobType || '';
    this.decorType = obj.decorType || '';
    this.paintSupplier = obj.paintSupplier || '';
    this.paintBrand = obj.paintBrand || '';
    this.paintProduct = obj.paintProduct || '';
    this.timeFrameStart = obj.timeFrameStart || '';
    this.timeFrameEnd = obj.timeFrameEnd || '';
    this.expectedEndDate = obj.expectedEndDate || '';
    this.occupancy = obj.occupancy || '';

    this.interior = [];
    for (let i = 0; obj.interior && i < obj.interior.length; i++) {
      this.interior.push(new DetailsInteriorObject(obj.interior[i]));
    }
    this.exterior = [];
    for (let i = 0; obj.exterior && i < obj.exterior.length; ++i) {
      this.exterior.push(new DetailsExteriorObject(obj.exterior[i]));
    }

    this.additionalDetailsComment = obj.additionalDetailsComment || '';
    this.estimates = new DetailsEstimate(obj.estimates);
    this.schemaVersion = obj.schemaVersion || environment.schemaVersion;
  }

  public getProgress(): number {
    // always start at 10% to have them feel like they have made progress already
    let progress = 0.10;

    if (this.address.validateJobLocation())
      progress += 0.10; // 20%

    if (this.validateJobType())
      progress += 0.10; // 30%

    if (this.validateDecorType()) {
      progress += 0.10; // 40%

      const progressCoverage = 0.40;

      if (this.isInteriorProject()) {
        const roomCount = this.interior.length;
        const numDividers = roomCount + 1;

        // room-selector
        if (this.validateNumberOfInteriorRooms()) {
          progress += (progressCoverage / numDividers);
        }

        // room-details pages
        for (let i = 0; i < roomCount; i++) {
          if (this.validateRoom(i)) {
            progress += (progressCoverage / numDividers);
          }
        }

      }
      if (this.isExteriorProject() || this.isDeckProject()) {
        const structureCount = this.exterior.length;
        const numDividers = structureCount + 1;

        // exterior-selector
        if (this.validateNumberOfExteriorStructures()) {
          progress += (progressCoverage / numDividers);
        }

        // exterior-details pages
        for (let i = 0; i < structureCount; i++) {
          if (this.validateStructure(i)) {
            progress += (progressCoverage / numDividers);
          }
        }

      }
    }

    // 20% is remaining. Divide it up...
    if (this.validatePaintSupplier()) {
      progress += (.20 / 4);
      // Only validate occupancy if the user has passed the paint supplier question so that exterior
      // projects don't start with 5% progress
      if (!this.isInteriorProject() || this.validateOccupancy()) {
        progress += (.20 / 4);
      }
    }

    if (this.validateTimeFrameStart() && this.validateTimeFrameEnd())
      progress += (.20 / 4);

    if (this.validateAdditionalComment())
      progress += (.20 / 4);

    return progress > 0.99 ? 1 : progress;
  }

  public isValid(): boolean {
    let res = this.address.validateJobLocation() && this.validateJobType() && this.validateDecorType();
    res = res && this.validateAllRooms() && this.validateAllStructures();
    return res && this.validateTimeFrameStart() && this.validateTimeFrameEnd() && this.validatePaintSupplier() && this.validateOccupancy();
  }

  public validateAddress(): boolean {
    return this.address.isValid();
  }

  public validateJobType(): boolean {
    return this.jobType === 'house'
      || this.jobType === 'townhouse';
  }

  public isInteriorProject(): boolean {
    return this.decorType === 'interior';
  }

  public isExteriorProject(): boolean {
    return this.decorType === 'exterior' && !this.exterior.find(e => e.type === 'deck');
  }

  public isDeckProject(): boolean {
    return this.decorType === 'exterior' && !!this.exterior.find(e => e.type === 'deck');
  }

  public validateDecorType(): boolean {
    return this.isInteriorProject() || this.isExteriorProject() || this.isDeckProject();
  }

  public validateNumberOfInteriorRooms(): boolean {
    return this.isInteriorProject() ? this.interior.length > 0 : this.interior.length === 0;
  }

  public validateNumberOfExteriorStructures(): boolean {
    return (this.isExteriorProject() || this.isDeckProject()) ? this.exterior.length > 0 : this.exterior.length === 0;
  }

  public validateAllRooms(): boolean {
    if (!this.validateNumberOfInteriorRooms()) {
      return false;
    }

    for (let i = 0; i < this.interior.length; i++) {
      if (!this.validateRoom(i)) {
        return false;
      }
    }

    return true;
  }

  public validateRoom(roomIndex: number): boolean {
    if (this.interior.length <= 0 || roomIndex < 0 || roomIndex > (this.interior.length - 1)) {
      return false
    }
    return this.interior[roomIndex].validateRoom();
  }

  public validateAllStructures(): boolean {
    if (!this.validateNumberOfExteriorStructures()) {
      return false;
    }

    for (let i = 0; i < this.exterior.length; i++) {
      if (!this.validateStructure(i)) {
        return false;
      }
    }

    return true;
  }

  public validateStructure(structureIndex: number): boolean {
    if (this.exterior.length <= 0 || structureIndex < 0 || structureIndex > (this.exterior.length - 1)) {
      return false;
    }

    return this.exterior[structureIndex].validateExterior();
  }

  public validatePaintSupplier(): boolean {
    return this.paintSupplier === 'painter' || this.paintSupplier === 'customer';
  }

  public validateTimeFrameStart(): boolean {
    return this.timeFrameStart === 'flexibleStartDate' || this.timeFrameStart ==='startWithinNextWeek' || this.timeFrameStart ==='startWithinNextMonth';
  }

  public validateTimeFrameEnd(): boolean {
    let valid = this.timeFrameEnd === 'flexibleEndDate' || this.timeFrameEnd ==='endDateInMind' ||
      this.timeFrameEnd ==='finishWithinAMonth' || this.timeFrameEnd === 'finishWithinThreeMonths';

    if (this.timeFrameEnd === "endDateInMind") {
      valid = valid && this.expectedEndDate.length > 0;
    }

    return valid;
  }

  public validateOccupancy(): boolean {
    return this.isInteriorProject() ? this.occupancy.length > 0 : true;
  }

  public validateAdditionalComment(): boolean {
    const stringArray = this.additionalDetailsComment.trim().split(" ");
    return stringArray.length > 4;
  }

  public getJobDetailsAsString(): string {
    return this.jobType && this.decorType
      ? `${this.jobType} / ${this.decorType}`
      : 'Awaiting Job Details';
  }

  public getWorkDetailsAsString(): string {
    let numStories = 0;
    for (let i = 0; i < this.exterior.length; ++i) {
      if (this.exterior[i].numberOfStories > numStories)
        numStories = this.exterior[i].numberOfStories;
    }

    if (this.isInteriorProject()) {
      return `${this.interior.length} room${this.interior.length === 1 ? '' : 's'}`;
    } else if (this.isExteriorProject()) {
      return `${numStories} ${numStories === 1 ? 'story' : 'stories'}`;
    } else {
      return `deck`;
    }
  }

  public getMaterialDetailsAsString(): string {
    return this.paintSupplier
      ? this.paintSupplier === 'customer' ? 'Customer will supply the paint' : 'Materials included'
      : 'Awaiting Paint Selection';
  }
}
