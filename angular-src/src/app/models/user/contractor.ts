import {User} from './base/user';
import {ContractorInsurance} from './contractor.insurance';
import {Address} from './base/address';
import {SocialMedia} from "./base/socialMedia";
import {ImageFile} from "../imageFile";

export class Contractor extends User {
  public _id: string;
  public timezone: string;
  public title: string;
  public organizationName: string;
  public picture: string; //url
  public bio: string;
  public website: string;
  public numberOfEmployees: number;
  public founded: number;
  public rating: number;
  public ratingCount: number;
  public completedJobCount: number;
  public services: Array<string>;
  public address: Address;
  public accountStatus: string;
  public insurance: ContractorInsurance;
  public socialMedia: SocialMedia;
  public warranty: {
    timePeriod: string,
    duration: number
  };
  public tags: [
    {
    text: number,
    color: string,
    icon: string
    },
    {
    text: number,
    color: string,
    icon: string
    },
    {
    text: number,
    color: string,
    icon: string
    },
    ]
  public photosOfPastWork: Array<ImageFile>;

  constructor(obj?: any) {
    if (obj === null || obj === undefined)
      obj = {};

    super(obj);
    this.displayName = obj.organizationName || this.displayName;

    this._id = obj._id || '';
    this.timezone = obj.timezone || '';
    this.title = obj.title || '';
    this.organizationName = obj.organizationName || '';
    this.picture = obj.picture || '';
    this.bio = obj.bio || '';
    this.website = obj.website || '';
    this.numberOfEmployees = obj.numberOfEmployees || 0;
    this.founded = obj.founded || 0;
    this.rating = obj.rating || 0;
    this.ratingCount = obj.ratingCount || 0;
    this.completedJobCount = obj.completedJobCount || 0;
    this.services = obj.services || [];
    this.address = new Address(obj.address);
    this.accountStatus = obj.accountStatus || '';
    this.warranty = obj.warranty || '';
    this.tags = obj.tags || [{text: 1, color: 'blue',icon: 'search'},{text: 2, color: 'blue',icon: 'search'},{text: 2, color: 'blue',icon: 'search'}];
    this.insurance = new ContractorInsurance(obj.insurance);
    this.socialMedia = new SocialMedia(obj.socialMedia);

    this.photosOfPastWork = [];
    for (let i = 0; obj.photosOfPastWork && i < obj.photosOfPastWork.length; ++i) {
      this.photosOfPastWork.push(new ImageFile(obj.photosOfPastWork[i]));
    }
  }

  public isValidContractor(): boolean {
    return this.organizationName.length > 0 && this.picture.length > 0 && this.founded > 1800 && this.founded < 2100 &&
      this.rating >= 0 && this.rating <= 5;
  }
}
