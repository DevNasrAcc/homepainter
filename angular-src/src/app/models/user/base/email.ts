import {Equals} from '../../equals';

export class Email extends Equals {
  private emailAddressRegEx: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  public address: string;
  public sendPromotional: boolean;
  public sendProductNews: boolean;
  public sendBlog: boolean;
  public sendProjectNotices: boolean;
  public sendMessageNotices: boolean;

  constructor(obj ?: any) {
    super();

    if (obj === null || obj === undefined) {
      obj = {};
    }

    this.address = obj.address || '';
    this.sendPromotional = Boolean(obj.sendPromotional);
    this.sendProductNews = Boolean(obj.sendProductNews);
    this.sendBlog = Boolean(obj.sendBlog);
    this.sendProjectNotices = Boolean(obj.sendProjectNotices);
    this.sendMessageNotices = Boolean(obj.sendMessageNotices);
  }

  public isValid(): boolean {
    return this.emailAddressRegEx.test(this.address);
  }
}
