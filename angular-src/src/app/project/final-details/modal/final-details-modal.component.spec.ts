import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {FinalDetailsModalComponent} from './final-details-modal.component';

describe('FinalDetailsModalComponent', () => {
  let component: FinalDetailsModalComponent;
  let fixture: ComponentFixture<FinalDetailsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
