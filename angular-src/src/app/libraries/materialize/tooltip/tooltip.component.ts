import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import { isArray } from 'rxjs/internal-compatibility';

@Component({
  selector: 'materialize-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.less']
})
export class TooltipComponent implements OnInit, AfterViewInit, OnDestroy {

  private tooltipInstance: any;
  @Input() public data: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private materialize: Angular2MaterializeV1Service) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.tooltipInstance = this.materialize.initTooltip('.tooltipped');
  }

  ngOnDestroy(): void {
    if (isArray(this.tooltipInstance)) {
      for (let i = 0; i < this.tooltipInstance.length; i++) {
        this.tooltipInstance[i].destroy();
      }
    }
    else if(this.tooltipInstance) {
      this.tooltipInstance.destroy();
    }
  }

  public onClick(): void {
    // do not remove this function. It is empty on purpose. It fixes a bug with IOS and not opening the tooltip
  }
}
