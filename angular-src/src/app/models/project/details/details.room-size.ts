import {Equals} from '../../equals';

export class DetailsRoomSize extends Equals {
  private labelRegEx: RegExp = /^([0-9]{1,2}'x[0-9]{1,2}' (to|or) ([0-9]{1,2}'x[0-9]{1,2}'|less))|([0-9]{1,2}'x[0-9]{1,2}')$/;

  public name: string;
  public length: number;
  public width: number;
  public label: string;

  public constructor(obj?: any){
    super();

    if (obj === null || obj === undefined) {
      obj = {};
    }

    this.name = obj.name || '';
    this.length = obj.length || 0;
    this.width = obj.width || 0;
    this.label = obj.label || '';
  }

  public validateRoomSize(): boolean {
    return (this.name === 'small' || this.name === 'medium' || this.name === 'large' || this.name === 'custom')
      && this.length >= 1 && this.length <= 50
      && this.width >= 1 && this.width <= 50
      && this.labelRegEx.test(this.label);
  }
}
