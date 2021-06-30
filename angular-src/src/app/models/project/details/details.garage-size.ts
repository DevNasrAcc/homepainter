import { Equals } from '../../equals';

export class DetailsGarageSize extends Equals {

  public label: string;
  public size: number;

  public constructor(obj){
    super();

    if (obj === null || obj === undefined) {
      obj = {};
    }

    this.label = obj.label || '';
    this.size = obj.size || 0;
  }

  public validateGarageSize(): boolean {
    return this.size > 0 && this.size < 5 && !!this.label;
  }
}
