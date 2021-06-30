import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContractorCompleteComponent } from './contractor-complete.component';

describe('ContractorCompleteComponent', () => {
  let component: ContractorCompleteComponent;
  let fixture: ComponentFixture<ContractorCompleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractorCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractorCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
