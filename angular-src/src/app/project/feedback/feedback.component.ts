import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {AbstractControl} from "@angular/forms";

@Component({
  selector: 'project-feedback[id][question][inputLabel][rating][comment]',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.less']
})
export class FeedbackComponent implements OnInit {

  @Input() id: string;
  @Input() question: string;
  @Input() inputLabel: string;
  @Input() rating: AbstractControl;
  @Input() comment: AbstractControl;

  constructor(private materialize: Angular2MaterializeV1Service) {
  }

  ngOnInit() {
  }

  public rate(value: number) {
    this.rating.setValue(value);
    setTimeout(() => this.materialize.updateTextFields(), 250);
  }

  public updateText(value) {
    this.comment.setValue(value);
  }

}
