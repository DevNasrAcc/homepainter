import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StripeComponent } from './stripe.component';

describe('StripeComponent', () => {
  let component: StripeComponent;
  let fixture: ComponentFixture<StripeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StripeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StripeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
