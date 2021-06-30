import {Equals} from '../../equals';

export class DetailsEstimate extends Equals {
  public primerGallons: number;
  public paintGallons: number;
  public totalGallons: number;
  public repairHours: number;
  public prepHours: number;
  public primingHours: number;
  public paintingHours: number;
  public laborHours: number;
  public laborCost: number;
  public materialCost: number;
  public totalCost: number;

  constructor(obj ?: any) {
    super();

    if (obj === null || obj === undefined)
      obj = {};

    this.primerGallons = obj.primerGallons || 0;
    this.paintGallons = obj.paintGallons || 0;
    this.totalGallons = obj.totalGallons || 0;
    this.repairHours = obj.repairHours || 0;
    this.prepHours = obj.prepHours || 0;
    this.primingHours = obj.primingHours || 0;
    this.paintingHours = obj.paintingHours || 0;
    this.laborHours = obj.laborHours || 0;
    this.laborCost = obj.laborCost || 0;
    this.materialCost = obj.materialCost || 0;
    this.totalCost = obj.totalCost || 0;
  }
}
