export class StripeData {
  public complete: boolean;
  public stripe: any;
  public element: any;

  constructor() {
    this.complete = false;
    this.stripe = {};
    this.element = {};
  }
}
