import {User} from './base/user';

export class Customer extends User {
  public stripeCustomerId: string;
  public companyName: string;

  constructor(obj?: any) {
    if (obj === null || obj === undefined)
      obj = {};

    super(obj);

    this.stripeCustomerId = obj.stripeCustomerId;
    this.companyName = obj.companyName;
  }
}
