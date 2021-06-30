import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";

@Component({
  selector: 'form-details-room-details-select',
  templateUrl: './room-details-select.component.html',
  styleUrls: ['./room-details-select.component.less']
})
export class RoomDetailsSelectComponent implements AfterViewInit, OnChanges {

  private selectInstance: any;
  @Output() public change: EventEmitter<any>;

  @Input() public id: string;
  @Input() public selected: any;
  @Input() public disabled: boolean;

  constructor(private materialize: Angular2MaterializeV1Service) {
    this.change = new EventEmitter<any>();
  }

  ngAfterViewInit(): void {
    this.selectInstance = this.materialize.initSelect(`#${this.id}`);

    if (!this.selectInstance)
      return;

    this.selectInstance.wrapper.firstElementChild.disabled = this.disabled;

    if (this.selected !== '')
      this.selectInstance.wrapper.firstElementChild.value = this.selected;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectInstance && changes.disabled) {
      this.selectInstance.wrapper.firstElementChild.disabled = changes.disabled.currentValue;
    }
  }

}
