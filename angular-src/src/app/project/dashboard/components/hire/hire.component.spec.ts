import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {HireComponent} from './hired.component';

describe('HiredComponent', () => {
  let component: HireComponent;
  let fixture: ComponentFixture<HireComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
