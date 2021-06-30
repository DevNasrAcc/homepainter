export class Equals {
  public equals(obj: any): boolean {
    return JSON.stringify(this) === JSON.stringify(obj);
  }
}
