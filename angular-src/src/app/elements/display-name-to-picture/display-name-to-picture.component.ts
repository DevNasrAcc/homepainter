import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-display-name-to-picture[width][height][displayName]',
  templateUrl: './display-name-to-picture.component.html',
  styleUrls: ['./display-name-to-picture.component.less']
})
export class DisplayNameToPictureComponent implements OnInit {

  @Input() public width: number;
  @Input() public height: number;
  @Input() private displayName: string;
  public firstChar: string;
  public secondChar: string;

  constructor() { }

  ngOnInit(): void {
    if (!this.displayName) this.displayName = 'na';
    const split = this.displayName.split(' ');
    this.firstChar = split[0].charAt(0).toLowerCase();
    this.secondChar = split.length > 1 ? split[1].charAt(0).toLowerCase() : split[0].length > 1 ? split[0].charAt(1).toLowerCase() : undefined;
  }

  public getFillColor(): string {
    switch (this.displayName.toLowerCase().charCodeAt(0) % 5) {
      case 0:
        return '#daffd7';
      case 1:
        return '#ffd7db';
      case 2:
        return '#ffead7';
      case 3:
        return '#d7ddff';
      case 4:
        return '#cfcfcf';
    }
  }

}
