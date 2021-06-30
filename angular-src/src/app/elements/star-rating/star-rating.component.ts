import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-star-rating[value]',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.less']
})
export class StarRatingComponent implements OnInit {

  @Input() public value: number;
  @Input() public size: 'tiny' | 'tiny-small' | 'small' | 'small-medium' | 'medium' | 'medium-large' | 'large';

  constructor() { }

  ngOnInit(): void {
  }

}
