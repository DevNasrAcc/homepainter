export class Banner {
  public el: HTMLElement;
  public options: {
    open?: boolean,
    onOpenStart?: Function,
    onOpenEnd?: Function,
    onCloseStart?: Function,
    onCloseEnd?: Function
  };
  public isOpen: boolean;

  constructor(element: HTMLElement, options?: any) {
    if (!options) options = {};

    this.el = element;
    this.options = options;
    this.isOpen = false;
    if (options.open) this.open();
  }

  public open(): void {
    if (this.el === undefined || this.isOpen) return;

    if (this.options.onCloseStart) this.options.onCloseStart();
    this.el.style.visibility = 'visible';
    this.isOpen = true;
    if (this.options.onCloseEnd) this.options.onCloseEnd();
  }

  public close(): void {
    if (this.el === undefined || !this.isOpen) return;

    if (this.options.onCloseStart) this.options.onCloseStart();
    this.el.style.visibility = 'hidden';
    this.isOpen = false;
    if (this.options.onCloseEnd) this.options.onCloseEnd();
  }

  public destroy(): void {
    this.el = undefined;
    this.options = undefined;
    this.isOpen = undefined;
  }
}
