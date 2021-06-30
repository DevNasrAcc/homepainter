import {Equals} from '../../equals';

export class DetailsDeckSize extends Equals {
  public name: string;
  public squareFootage: number;
  public label: string;

  public constructor(obj){
    super();

    if (obj === null || obj === undefined) {
      obj = {};
    }

    this.name = obj.name || '';
    this.squareFootage = obj.squareFootage || 0;
    this.label = obj.label || '';
  }

  public validateRoomSize(): boolean {
    return (this.name === 'unknown' || this.name === 'small' || this.name === 'medium' || this.name === 'large')
      && this.squareFootage > 0
      && !!this.label
  }
}
