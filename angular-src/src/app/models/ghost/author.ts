export class Author {
  public name: string;
  public profile_image: string;
  public url: string;

  constructor(obj?: any) {
    if (!obj) obj = {};

    this.name = obj.name;
    this.profile_image = obj.profile_image;
    this.url = obj.url;
  }
}
