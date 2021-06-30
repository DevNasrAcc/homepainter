import {DetailsDecorItem} from './details.decor-item';
import {DetailsRoomSize} from './details.room-size';
import {DetailsRoomHeight} from './details.room-height';
import {DetailsEstimate} from './details.estimate';
import {Equals} from '../../equals';
import {ImageFile} from "../../imageFile";

export class DetailsInteriorObject extends Equals {
  public defaultName: string;
  public type: string;
  public size: DetailsRoomSize;
  public height: DetailsRoomHeight;
  public items: DetailsDecorItem[];
  public photos: Array<ImageFile>;
  public estimates: DetailsEstimate;

  constructor(obj ?: any) {
    super();

    if (obj === null || obj === undefined) {
      obj = {};
    }

    this.defaultName = obj.defaultName || '';
    this.type = obj.type || '';
    this.size = new DetailsRoomSize(obj.size);
    this.height = new DetailsRoomHeight(obj.height);
    this.photos = [];
    for (let i = 0; obj.photos && i < obj.photos.length; ++i) {
      this.photos.push(new ImageFile(obj.photos[i]));
    }

    this.items = [];
    for (let i = 0; obj.items && i < obj.items.length; i++) {
      this.items.push(new DetailsDecorItem(obj.items[i]));
    }

    this.estimates = new DetailsEstimate(obj.estimates);
  }

  public validateRoom(): boolean {
    if (!this.size.validateRoomSize())
      return false;

    if (!this.height.validateRoomHeight())
      return false;

    if (this.items.length <= 0)
      return false;

    const index = {
      ceiling: -1,
      wall: -1,
      accentWall: -1,
      cabinets: -1,
      doorFrame: -1,
      door: -1
    };

    // sets the index values if the item exists in the items array
    for (let j = 0; j < this.items.length; j++) {
      if (index[this.items[j].type]) {
        index[this.items[j].type] = j;
      }
    }

    // wall check
    if (index.wall > -1 && !this.withinRange(this.items[index.wall].additionalDetails.amount, 1, 4)) {
      return false;
    }

    // accent wall check
    if (index.accentWall > -1 && !this.withinRange(this.items[index.accentWall].additionalDetails.amount, 1, 2)) {
      return false;
    }

    // wall accent and wall check
    if (index.wall > -1 && index.accentWall > -1) {
      const wallAmount = this.items[index.wall].additionalDetails.amount;
      const accentWallAmount = this.items[index.accentWall].additionalDetails.amount;
      if (
        !this.withinRange(wallAmount, 1, 3) ||
        !this.withinRange(accentWallAmount, 1, 2) ||
        !this.withinRange(wallAmount + accentWallAmount, 2, 4)
      ) {
        return false;
      }
    }

    // ceiling check
    if (index.ceiling > -1) {
      const ceilingType = this.items[index.ceiling].additionalDetails.ceilingType;
      if (ceilingType !== 'conventional' && ceilingType !== 'vaulted') {
        return false;
      }
    }

    // cabinet check
    if (index.cabinets > -1) {
      const cabinet = this.items[index.cabinets];
      if (
        !this.withinRange(cabinet.additionalDetails.numberOfCabinetDoors, 0, 30) ||
        !this.withinRange(cabinet.additionalDetails.numberOfCabinetDrawers, 0, 30) ||
        !this.withinRange(cabinet.additionalDetails.numberOfCabinetDrawers + cabinet.additionalDetails.numberOfCabinetDoors, 1, 60) ||
        (cabinet.additionalDetails.cabinetGrainType !== 'smooth' && cabinet.additionalDetails.cabinetGrainType !== 'grainy') ||
        (cabinet.additionalDetails.cabinetTreatment !== 'paint' && cabinet.additionalDetails.cabinetTreatment !== 'stain') ||
        (cabinet.additionalDetails.cabinetCondition !== 'bare' && cabinet.additionalDetails.cabinetCondition !== 'painted' && cabinet.additionalDetails.cabinetCondition !== 'stained') ||
        (cabinet.additionalDetails.cabinetCondition === 'painted' && cabinet.additionalDetails.cabinetTreatment === 'stain')
      ) {
        return false;
      }
    }

    // door frame check
    if (index.doorFrame > -1 && !this.withinRange(this.items[index.doorFrame].additionalDetails.amount, 1, 4)) {
      return false;
    }

    // door check
    if (index.door > -1 && !this.withinRange(this.items[index.door].additionalDetails.amount, 1, 4)) {
      return false;
    }

    return true;
  }

  private withinRange(numberToCheck: number, low: number, high: number): boolean {
    return numberToCheck >= low && numberToCheck <= high;
  }

  public requiresDrywallPhotos() {
    const wall = this.items.find(o => o.type === 'wall');
    return wall && wall.additionalDetails.conditions.includes('drywallRepair');
  }
}
