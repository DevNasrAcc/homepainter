import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {QuotesComponent} from './applicants.component';

describe('ApplicantsComponent', () => {
  let component: QuotesComponent;
  let fixture: ComponentFixture<QuotesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
