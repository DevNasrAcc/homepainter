import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {CheckoutElementComponent} from './checkout-element.component';

describe('CheckoutElementComponent', () => {
  let component: CheckoutElementComponent;
  let fixture: ComponentFixture<CheckoutElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
