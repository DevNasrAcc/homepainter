import {Equals} from '../../equals';
import {ImageFile} from "../../imageFile";
import {DetailsExteriorItem} from './details.exterior-item';
import {DetailsDeckSize} from './details.deck-size'
import {DetailsGarageSize} from './details.garage-size'

export class DetailsExteriorObject extends Equals {
  public defaultName: string;
  public type: string;
  public numberOfStories: number;
  public paintCondition: string;
  public deckElevation: string;
  public deckTreatment: string;
  public deckSize: DetailsDeckSize;
  public items: Array<DetailsExteriorItem>;
  public photos: Array<ImageFile>;
  public squareFootage: number;
  public garageSize: DetailsGarageSize;

  constructor(obj ?: any) {
    super();

    if(obj === null || obj === undefined)
      obj = {};

    this.defaultName = obj.defaultName || '';
    this.type = obj.type || '';
    this.numberOfStories = obj.numberOfStories || 1;
    this.paintCondition = obj.paintCondition || '';
    this.deckElevation = obj.deckElevation || '';
    this.deckTreatment = obj.deckTreatment || '';
    this.squareFootage = obj.squareFootage;
    this.deckSize = new DetailsDeckSize(obj.deckSize);
    this.garageSize = new DetailsGarageSize(obj.garageSize);
    this.items = [];
    for(let i = 0; obj.items && i < obj.items.length; i++) {
      this.items.push(new DetailsExteriorItem(obj.items[i]));
    }
    this.photos = [];
    for (let i = 0; obj.photos && i < obj.photos.length; ++i) {
      this.photos.push(new ImageFile(obj.photos[i]));
    }
  }

  public validateExterior(): boolean {
    let valid = true;
    valid = valid && this.paintCondition.length > 2 && this.defaultName.length > 2;
    switch (this.type) {
      case 'house':
        valid = valid && this.numberOfStories > 0 &&
          this.numberOfStories < 6 &&
          this.items.length > 0 &&
          this.squareFootage >= 1 && this.squareFootage <= 10000;
        break;
      case 'detachedGarage':
        valid = valid && this.garageSize.size > 0 && this.items.length > 0;
        break;
      case 'shed':
        valid = valid && this.items.length > 0;
        break;
      case 'deck':
        valid = valid && this.deckElevation.length > 2 && this.deckTreatment.length > 2 && this.deckSize.validateRoomSize();
        break;
      default:
        return false;
    }

    for (let item of this.items) {
      valid = valid && item.validateExteriorItem();
    }

    return valid;
  }
}
