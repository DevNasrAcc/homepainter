import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PriceEstimateComponent } from './price-estimate.component';

describe('PriceEstimateComponent', () => {
  let component: PriceEstimateComponent;
  let fixture: ComponentFixture<PriceEstimateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceEstimateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceEstimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
