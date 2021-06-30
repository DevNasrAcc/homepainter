import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {ExteriorDetailsComponent} from './exterior-details.component';

describe('ExteriorDetailsComponent', () => {
  let component: ExteriorDetailsComponent;
  let fixture: ComponentFixture<ExteriorDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExteriorDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExteriorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
