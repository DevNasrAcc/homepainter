export class SocialMedia {
  public twitter: string;
  public facebook: string;
  public instagram: string;
  public google: string;

  constructor(obj?: any) {
    if (!obj) obj = {};

    this.twitter = obj.twitter || '';
    this.facebook = obj.facebook || '';
    this.instagram = obj.instagram || '';
    this.google = obj.google || '';
  }

  public hasSocialMedia(): boolean {
    return !!this.twitter || !!this.facebook || !!this.instagram || !!this.google;
  }
}
