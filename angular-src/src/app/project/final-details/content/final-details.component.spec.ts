import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {FinalDetailsComponent} from './final-details.component';

describe('FinalComponent', () => {
  let component: FinalDetailsComponent;
  let fixture: ComponentFixture<FinalDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
