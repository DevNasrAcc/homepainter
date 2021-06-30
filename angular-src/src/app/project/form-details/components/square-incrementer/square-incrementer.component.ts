import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'form-details-square-incrementer',
  templateUrl: './square-incrementer.component.html',
  styleUrls: ['./square-incrementer.component.less']
})
export class SquareIncrementerComponent implements OnInit {

  @Output() public incremented: EventEmitter<any> = new EventEmitter<any>();
  @Output() public decremented: EventEmitter<any> = new EventEmitter<any>();

  @Input() private id: number;
  @Input() public autoIncrease: number;
  @Input() public title: string;
  private prevNumberCount: number;
  @Input() public numberCount: number;

  constructor() { }

  ngOnInit() {
    this.prevNumberCount = this.numberCount;
  }

  inputBoxChanged(): void {
    if(this.numberCount < 0) {
      this.numberCount = 0;
      return;
    }

    if(this.numberCount > 5)
      this.numberCount = 5;

    this.numberCount > this.prevNumberCount ?
      this.incremented.emit({id: this.id, count: this.numberCount}):
      this.decremented.emit({id: this.id, count: this.numberCount});

    this.prevNumberCount = this.numberCount;
  }

  increase(): void {
    if(this.autoIncrease > 1 && this.numberCount === 0)
      this.numberCount += this.autoIncrease;
    else
      this.numberCount++;

    this.numberCount = this.numberCount > 5 ? 5 : this.numberCount;
    this.prevNumberCount = this.numberCount;

    this.incremented.emit({id: this.id, count: this.numberCount});
  }

  decrease(): void {
    if(this.numberCount > 0)
      this.numberCount--;

    this.prevNumberCount = this.numberCount;

    this.decremented.emit({id: this.id, count: this.numberCount});
  }
}
