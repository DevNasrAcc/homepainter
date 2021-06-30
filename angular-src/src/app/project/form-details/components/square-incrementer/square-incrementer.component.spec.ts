import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SquareIncrementerComponent} from './square-incrementer.component';

describe('SquareIncrementerComponent', () => {
  let component: SquareIncrementerComponent;
  let fixture: ComponentFixture<SquareIncrementerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SquareIncrementerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SquareIncrementerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
