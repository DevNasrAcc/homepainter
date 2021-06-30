import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {CustomerAbandonedProjectComponent} from './customer-abandoned-project.component';

describe('CustomerAbandonedProjectComponent', () => {
  let component: CustomerAbandonedProjectComponent;
  let fixture: ComponentFixture<CustomerAbandonedProjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerAbandonedProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerAbandonedProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
