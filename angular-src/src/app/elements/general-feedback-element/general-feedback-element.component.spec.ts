import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {GeneralFeedbackElementComponent} from './general-feedback-element.component';

describe('GeneralFeedbackElementComponent', () => {
  let component: GeneralFeedbackElementComponent;
  let fixture: ComponentFixture<GeneralFeedbackElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralFeedbackElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralFeedbackElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
