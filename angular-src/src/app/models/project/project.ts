import {Details} from './details/details';
import {Proposal} from './proposal/proposal';
import {Equals} from '../equals';
import {environment} from '../../../environments/environment';
import {User} from "../user/base/user";

export class Project extends Equals {
  public _id: string;
  public status: 'creating' | 'invitingPainters' | 'expired' | 'awaitingDownPaymentConfirmation' | 'booked';
  public owner: User;
  public details: Details;
  public promoCode: string;
  public proposals: Array<Proposal>;
  public selectedProposal: Proposal;
  public invitedContractors: Array<String>;
  public createdAt: Date;
  public schemaVersion: string;

  constructor(obj?: any) {
    super();

    if(obj === null || obj === undefined)
      obj = {};

    this._id = obj._id || undefined;
    this.status = obj.status || 'creating';
    this.owner = new User(obj.user);
    this.promoCode = obj.promoCode || '';
    this.details = new Details(obj.details);

    this.proposals = [];
    for (let i = 0; obj.proposals && i < obj.proposals.length; i++) {
      this.proposals.push(new Proposal(obj.proposals[i]));
    }

    this.selectedProposal = obj.selectedProposal ? new Proposal(obj.selectedProposal) : undefined;
    this.invitedContractors = obj.invitedContractors || [];
    this.createdAt = obj.createdAt;
    this.schemaVersion = obj.schemaVersion || environment.schemaVersion;
  }

  public getDisplayPhoto(): string {
    for (let i = 0; i < this.details.exterior.length; ++i) {
      if (this.details.exterior[i].photos.length > 0) {
        return this.details.exterior[i].photos[0].url;
      }
    }
    for (let i = 0; i < this.details.interior.length; ++i) {
      if (this.details.interior[i].photos.length > 0) {
        return this.details.interior[i].photos[0].url;
      }
    }
    return undefined;
  }

  public isValid(): boolean {
    for (let i = 0; i < this.proposals.length; i++) {
      if (!this.proposals[i].isValid())
        return false;
    }

    return this.details.isValid() && this.selectedProposal && this.selectedProposal.isValid();
  }

  public isCheckedOut(): boolean {
    return this.status === 'awaitingDownPaymentConfirmation' || this.status === 'booked';
  }
}
