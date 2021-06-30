import {Email} from './email';
import {Mobile} from './mobile';
import {Equals} from '../../equals';
import {environment} from "../../../../environments/environment";

export class User extends Equals {
  public _id: string;
  public __t: string;
  public firstName: string;
  public lastName: string;
  public displayName: string;
  public picture: string;
  public email: Email;
  public mobile: Mobile;
  public lastSeenOnline: Date;
  public onlineStatus: 'online' | 'away' | 'offline';
  public acceptedTermsAndPrivacy: boolean;
  public schemaVersion: string;

  constructor(obj ?: any) {
    if(obj === null || obj === undefined)
      obj = {};

    super();

    this._id = obj._id || undefined;
    this.__t = obj.__t || undefined;
    this.firstName = obj.firstName || '';
    this.lastName = obj.lastName || '';
    this.displayName = obj.firstName + (obj.lastName ? ' ' + obj.lastName.charAt(0) : '');
    this.picture = obj.picture || '';
    this.email = new Email(obj.email);
    this.mobile = new Mobile(obj.mobile);
    this.acceptedTermsAndPrivacy = obj.acceptedTermsAndPrivacy === true;
    this.schemaVersion = obj.schemaVersion || environment.schemaVersion;

    this.updateLastSeenOnline(obj.lastSeenOnline || new Date(0));
  }

  public updateLastSeenOnline(lastSeenOnline: string | Date): void {
    this.lastSeenOnline = typeof lastSeenOnline === 'string' ? new Date(lastSeenOnline) : lastSeenOnline;
    this.onlineStatus = new Date().getTime() - this.lastSeenOnline.getTime() < 1000 * 60
      ? 'online'
      : new Date().getTime() - this.lastSeenOnline.getTime() < 1000 * 60 * 5
        ? 'away'
        : 'offline';
  }

  public validateName(): boolean {
    return this.firstName.length > 0 && this.lastName.length > 0;
  }

  public validateEmail(): boolean {
    return this.email.isValid();
  }

  public validatePhone(): boolean {
    return this.mobile.isValid();
  }

  public hasFilledOutContactInfo(): boolean {
    return this.validateName() && this.validateEmail();
  }
}
