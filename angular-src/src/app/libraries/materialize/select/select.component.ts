import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import { isPlatformServer } from '@angular/common';

declare var M; // materialize

@Component({
  selector: 'materialize-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.less']
})

export class SelectComponent implements AfterViewInit, OnChanges {

  private selectInstance: any;

  @Input() public materializeOptions: any;
  @Input() public id: string;
  @Input() public labelText: string;
  @Input() public labelError: string;
  @Input() public data: Array<{ value: any, text?: string, disabled?: boolean }>;
  @Input() public selected: any;
  @Input() public disabled: boolean;

  @Output() public change: EventEmitter<any>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.change = new EventEmitter<any>();
  }

  ngAfterViewInit(): void {
    this.destroySelect();
    const optionsHtml = this.createOptions();
    this.initSelect(optionsHtml);
    this.selectInstance.wrapper.firstElementChild.value = this.selected;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectInstance && changes.data) {
      this.data = changes.data.currentValue;
      this.destroySelect();
      const optionsHtml = this.createOptions();
      this.initSelect(optionsHtml);
      this.selectInstance.wrapper.firstElementChild.value = this.selected;
    }
    if (this.selectInstance && changes.disabled) {
      this.disabled = changes.disabled.currentValue;
      this.selectInstance.wrapper.firstElementChild.disabled = this.disabled;
    }
    if (changes.labelText) {
      this.labelText = changes.labelText.currentValue;
    }
    if (changes.labelError) {
      this.labelError = changes.labelError.currentValue;
    }
    if (this.selectInstance && changes.selected) {
      this.destroySelect();
      const optionsHtml = this.createOptions();
      this.initSelect(optionsHtml);
      this.selectInstance.wrapper.firstElementChild.value = this.selected;
    }
  }

  private initSelect(innerHTML) {
    if (isPlatformServer(this.platformId)) {
      return null;
    }

    const element = document.getElementById(this.id);
    if (element !== null) {
      element.innerHTML = innerHTML;
      this.selectInstance = M.FormSelect.init(element, this.materializeOptions);
    }
  }

  private destroySelect() {
    if (!this.selectInstance) {
      return;
    }
    this.selectInstance.destroy();
  }

  private createOptions(tempSelect?: any): string {
    let html = '';
    for (let i = 0; i < this.data.length; i++) {
      // tslint:disable-next-line:max-line-length
      html += `<option ${this.data[i].disabled ? 'disabled' : ''} ${this.data[i].value === this.selected ? 'selected' : ''} value="${this.data[i].value}">${this.data[i].text || this.data[i].value}</option>`;
    }
    return html;
  }
}
