import {Equals} from '../../equals';
import {Contractor} from '../../user/contractor';

export class Proposal extends Equals {
  public contractor: Contractor;
  public price: number;
  public message: string;
  public earliestStartDate: string;

  constructor(obj?: any) {
    super();

    if (obj === null || obj === undefined)
      obj = {};

    this.contractor = new Contractor(obj.contractor);
    this.price = obj.price || 0;
    this.message = obj.message || '';
    this.earliestStartDate = obj.earliestStartDate || '';
  }

  public isValid(): boolean {
    return this.contractor.isValidContractor() && this.price > 0 && this.earliestStartDate.length > 0;
  }
}
