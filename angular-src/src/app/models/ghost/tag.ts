export class Tag {
  public name: string;
  public url: string;

  constructor(obj?: any) {
    if (!obj) obj = {};

    this.name = obj.name;
    this.url = obj.url;
  }
}
