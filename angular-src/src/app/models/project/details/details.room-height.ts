import {Equals} from '../../equals';

export class DetailsRoomHeight extends Equals {
  private labelRegEx: RegExp = /^([0-9]{1,2}' (to|or) ([0-9]{1,2}'|less))|([0-9]{1,2}')$/;

  public name: string;
  public height: number;
  public label: string;

  public constructor(obj?: any) {
    super();

    if (obj === null || obj === undefined) {
      obj = {};
    }

    this.name = obj.name || '';
    this.height = obj.height || 0;
    this.label = obj.label || '';
  }

  public validateRoomHeight(): boolean {
    return (this.name === 'average' || this.name === 'aboveAverage' || this.name === 'vaulted' || this.name === 'custom')
      && this.height >= 6 && this.height <= 20
      && this.labelRegEx.test(this.label);
  }
}
