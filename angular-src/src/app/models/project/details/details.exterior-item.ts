import {Equals} from '../../equals';

export class DetailsExteriorItem extends Equals {
  public type: string;
  public sidingTypes: Array<string>
  public sidesToPaint: Array<string>;

  constructor(obj ?: any) {
    super();

    if(obj === null || obj === undefined) {
      obj = {};
    }

    this.type = obj.type || '';
    this.sidingTypes = obj.sidingTypes || [];
    this.sidesToPaint = obj.sidesToPaint || [];
  }

  validateExteriorItem(): boolean {
    let valid = true;

    if (this.type === 'siding') {
      valid = valid &&
        this.sidingTypes.length > 0 &&
        this.sidesToPaint.length > 0;
    }

    return valid;
  }
}
