import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {AreaNotServicedComponent} from './area-not-serviced.component';

describe('AreaNotServicedComponent', () => {
  let component: AreaNotServicedComponent;
  let fixture: ComponentFixture<AreaNotServicedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaNotServicedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaNotServicedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
