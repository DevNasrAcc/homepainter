import {DetailsDecorItemAdditionalDetail} from './details.decor-item.additional-detail';
import {Equals} from '../../equals';

export class DetailsDecorItem extends Equals {
  public type: string;
  public additionalDetails: DetailsDecorItemAdditionalDetail;

  constructor(obj ?: any) {
    super();

    if(obj === null || obj === undefined)
      obj = {};

    this.type = obj.type || '';
    this.additionalDetails = new DetailsDecorItemAdditionalDetail(obj.additionalDetails);
  }
}
