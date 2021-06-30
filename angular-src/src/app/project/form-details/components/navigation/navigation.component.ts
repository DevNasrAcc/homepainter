import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'form-details-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.less']
})
export class NavigationComponent implements OnInit {

  @Input() public enabled: boolean;
  @Input() public btnTxt: string;

  @Output() private nextButtonClicked: EventEmitter<void>;
  @Output() private saveAndReturnLaterClicked: EventEmitter<void>;
  @Output() private backButtonClicked: EventEmitter<void>;

  constructor() {
    this.enabled = false;
    this.btnTxt = '';

    this.nextButtonClicked = new EventEmitter<void>();
    this.saveAndReturnLaterClicked = new EventEmitter<void>();
    this.backButtonClicked = new EventEmitter<void>();
  }

  ngOnInit() {}

  public async next(): Promise<any> {
    this.nextButtonClicked.emit();
  }

  public saveAndReturnLater(): void {
    this.saveAndReturnLaterClicked.emit();
  }

  public async back(): Promise<any> {
    this.backButtonClicked.emit();
  }

}
