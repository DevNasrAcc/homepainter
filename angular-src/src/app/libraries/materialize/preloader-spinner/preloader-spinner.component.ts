import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-preloader-spinner',
  templateUrl: './preloader-spinner.component.html',
  styleUrls: ['./preloader-spinner.component.less']
})
export class PreloaderSpinnerComponent implements OnInit {

  @Input() size: string;

  constructor() { }

  ngOnInit(): void {
  }

}
