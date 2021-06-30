export class FinalData {
  public firstName: string;
  public lastName: string;
  public emailAddress: string;
  public phoneNumber: string;
  public address: {
    streetAddress: string,
    city: string,
    state: string,
    zipCode: string,
  };
  public billingAddress: {
    streetAddress: string,
    city: string,
    state: string,
    zipCode: string,
  };

  public stripeDataComplete: boolean;
  public billingAddressSameAsProperty: boolean;

  public constructor(obj?: any) {
    if (!obj) {
      obj = {};
    }

    this.firstName = obj.firstName || '';
    this.lastName = obj.lastName || '';
    this.emailAddress = obj.emailAddress || '';
    this.phoneNumber = obj.phoneNumber || '';
    this.address = {
      streetAddress: obj.address.streetAddress || '',
      city: obj.address.city || '',
      state: obj.address.state || '',
      zipCode: obj.address.zipCode || ''
    };
    this.billingAddress = {
      streetAddress: obj.billingAddress.streetAddress,
      city: obj.billingAddress.city,
      state: obj.billingAddress.state,
      zipCode: obj.billingAddress.zipCode
    };

    this.stripeDataComplete = obj.stripeDataComplete === undefined ? false : obj.stripeDataComplete;
    this.billingAddressSameAsProperty = obj.billingAddressSameAsProperty === undefined ? true : obj.billingAddressSameAsProperty;
  }
}
