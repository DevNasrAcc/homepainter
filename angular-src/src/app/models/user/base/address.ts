import {Equals} from '../../equals';

export class Address extends Equals {
  private zipCodeRegEx: RegExp = /^\d{5}$/;

  public streetAddress: string;
  public city: string;
  public state: string;
  public zipCode: number;

  constructor(obj) {
    super();

    if(obj === null || obj === undefined)
      obj = {};

    this.streetAddress = obj.streetAddress || '';
    this.city = obj.city || '';
    this.state = obj.state || '';
    this.zipCode = obj.zipCode || null;
  }

  public validateJobLocation(): boolean {
    return this.zipCode && this.zipCodeRegEx.test(this.zipCode.toString());
  }

  public isValid(): boolean {
    return this.streetAddress.length > 0 && this.city.length > 0 && this.state.length > 0 && this.validateJobLocation();
  }
}
