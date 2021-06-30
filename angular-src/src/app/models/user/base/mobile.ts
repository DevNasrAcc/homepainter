import {Equals} from '../../equals';

export class Mobile extends Equals {
  public number: string;
  public sendProjectNotices: boolean;
  public sendMessageNotices: boolean;

  constructor(obj) {
    super();

    if (obj === null || obj === undefined) {
      obj = {};
    }

    this.number = obj.number || '';
    this.sendProjectNotices = Boolean(obj.sendProjectNotices);
    this.sendMessageNotices = Boolean(obj.sendMessageNotices);
  }

  public isValid(): boolean {
    return this.number.length > 0;
  }
}
