import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {Details} from '../../../models/project/details/details';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";

@Component({
  selector: 'final-details-modal[open][details][close]',
  templateUrl: './final-details-modal.component.html',
  styleUrls: ['./final-details-modal.component.less']
})
export class FinalDetailsModalComponent implements OnInit, OnChanges, OnDestroy {

  private modalInstance: any;

  @Input() open: boolean;
  @Input() details: Details;

  @Output() close: EventEmitter<void>;

  constructor(private materialize: Angular2MaterializeV1Service) {
    this.details = new Details();
    this.close = new EventEmitter<void>();
  }

  ngOnInit() {
    this.modalInstance = this.materialize.initModal('#final_details_modal', {
      onCloseEnd: () => { this.close.emit(); }
    });

    if (this.open) {
      this.modalInstance.open();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.modalInstance && changes.open !== undefined) {
      if (!this.modalInstance.isOpen && changes.open.currentValue) {
        this.modalInstance.open();
      }
      else if (this.modalInstance.isOpen && !changes.open.currentValue) {
        this.modalInstance.close();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.modalInstance && this.modalInstance.isOpen) {
      this.modalInstance.close();
    }
  }

}
