import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";

@Component({
  selector: 'general-feedback-element[asModal][fieldUpdated][formSubmit]',
  templateUrl: './general-feedback-element.component.html',
  styleUrls: ['./general-feedback-element.component.less']
})
export class GeneralFeedbackElementComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() asModal: boolean;
  @Input() open: boolean;
  @Output() close: EventEmitter<void>;
  @Output() fieldUpdated: EventEmitter<any>;
  @Output() formSubmit: EventEmitter<{value: {overallRating: number, additionalComment: string}, cb: Function}>;

  public formGroup: FormGroup;
  public submitting: boolean;
  private selectInstance: any;
  private modalInstance: any;

  constructor(private formBuilder: FormBuilder, private materialize: Angular2MaterializeV1Service) {
    this.close = new EventEmitter<void>();
    this.fieldUpdated = new EventEmitter<any>();
    this.formSubmit = new EventEmitter<{value: {overallRating: number, additionalComment: string}, cb: Function}>();
    this.submitting = false;
    this.formGroup = formBuilder.group({
      overallRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      feedbackAround: ['', [Validators.required]],
      additionalComment: ['', [Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.selectInstance = this.materialize.initSelect('#feedback_around');

    if (this.asModal) {
      this.modalInstance = this.materialize.initModal('#general_feedback_modal', {
        onCloseEnd: () => { this.close.emit(); }
      });
      if (this.open) this.modalInstance.open();
    }
  }

  ngAfterViewInit(): void {
    this.materialize.updateTextFields();
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

  public onEmojiClick(value: Number) {
    this.formGroup.get('overallRating').setValue(value);
    this.onFieldUpdated(value);
  }

  public onFieldUpdated(value: any) {
    this.fieldUpdated.emit(value);
  }

  public async onFormSubmit() {
    if (!this.formGroup.valid) return;
    this.submitting = true;
    this.setFormDisabled(true);

    this.formSubmit.emit({
      value: this.formGroup.value,
      cb: (success) => {
        this.submitting = false;
        this.setFormDisabled(false);
        if (success) {
          this.formGroup.reset();
          this.materialize.updateTextFields();
        }
      }
    });
  }

  private setFormDisabled(disabled: boolean) {
    disabled ? this.formGroup.disable() : this.formGroup.enable();
    this.selectInstance.el.disabled = disabled;
    this.selectInstance.destroy();
    this.selectInstance = this.materialize.initSelect('#feedback_around');
  }

}
