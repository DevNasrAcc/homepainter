import { Equals } from '../equals';

export class ContractorInsurance extends Equals {
  public effectiveDate: Date;
  public expirationDate: Date;
  public verified: Boolean;
  public insured: Boolean;
  public fileLocation: string;

  constructor (obj?: any) {
    super();

    if(!obj) {
      obj = {};
    }

    this.effectiveDate = obj.effectiveDate;
    this.expirationDate = obj.expirationDate;
    this.verified = obj.verified;
    this.insured = obj.insured;
    this.fileLocation = obj.fileLocation || '';
  }
}
