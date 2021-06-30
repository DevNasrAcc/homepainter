import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CompleteSetupComponent } from './complete-setup.component';

describe('CompleteSetupComponent', () => {
  let component: CompleteSetupComponent;
  let fixture: ComponentFixture<CompleteSetupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CompleteSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
