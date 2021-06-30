import {Equals} from '../../equals';

export class DetailsDecorItemAdditionalDetail extends Equals {
  // wall, accentWall, doorFrame, door
  public amount: number;

  // wall
  public conditions: Array<string>;

  // ceiling
  public ceilingType: string;

  // cabinets
  public cabinetGrainType: string;
  public cabinetTreatment: string;
  public numberOfCabinetDrawers: number;
  public numberOfCabinetDoors: number;
  public cabinetCondition: string;

  public constructor(obj ?: any) {
    super();

    if (obj === null || obj === undefined) {
      obj = {};
    }

    this.amount = obj.amount || 0;
    this.conditions = obj.conditions || [];
    this.ceilingType = obj.ceilingType || '';
    this.cabinetGrainType = obj.cabinetGrainType || '';
    this.cabinetTreatment = obj.cabinetTreatment || '';
    this.numberOfCabinetDrawers = obj.numberOfCabinetDrawers || 0;
    this.numberOfCabinetDoors = obj.numberOfCabinetDoors || 0;
    this.cabinetCondition = obj.cabinetCondition || '';
  }

}
