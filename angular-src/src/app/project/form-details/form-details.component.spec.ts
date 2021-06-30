import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {FormDetailsComponent} from './form-details.component';

describe('PriceEstimateComponent', () => {
  let component: FormDetailsComponent;
  let fixture: ComponentFixture<FormDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
