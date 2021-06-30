import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InsuranceInfoComponent } from './insurance-info.component';

describe('InsuranceInfoComponent', () => {
  let component: InsuranceInfoComponent;
  let fixture: ComponentFixture<InsuranceInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
