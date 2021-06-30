import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SchedulerComponent} from './scheduler.component';

describe('DateTimeSchedulerComponent', () => {
  let component: SchedulerComponent;
  let fixture: ComponentFixture<SchedulerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
