import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'form-details-progress-bar[progress]',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.less']
})
export class ProgressBarComponent implements OnInit {

  @Input() public progress: number;
  @Output() private giveFeedbackClicked: EventEmitter<void>;

  constructor() {
    this.giveFeedbackClicked = new EventEmitter<void>();
  }

  ngOnInit() {
  }

  public onGiveFeedbackClicked(): void {
    this.giveFeedbackClicked.emit();
  }

}
