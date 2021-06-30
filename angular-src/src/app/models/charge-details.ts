export class ChargeDetails {
  public contractPrice: number;
  public serviceFee: number;
  public subtotal: number;
  public discount: number;
  public taxRate: number;
  public tax: number;
  public total: number;
  public downPaymentPercent: number;
  public downPaymentAmount: number;
  public dueLater: number;

  constructor(obj?: any) {
    if (!obj) obj = {};

    this.contractPrice = obj.contractPrice || 0;
    this.serviceFee = obj.serviceFee || 0;
    this.subtotal = obj.subtotal || 0;
    this.discount = obj.discount || 0;
    this.taxRate = obj.taxRate || 0;
    this.tax = obj.tax || 0;
    this.total = obj.total || 0;
    this.downPaymentPercent = obj.downPaymentPercent || 0;
    this.downPaymentAmount = obj.downPaymentAmount || 0;
    this.dueLater = this.total - this.downPaymentAmount;
  }
}
