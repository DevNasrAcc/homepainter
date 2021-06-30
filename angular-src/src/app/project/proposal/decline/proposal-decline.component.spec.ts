import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {ProposalDeclineComponent} from './proposal-decline.component';

describe('ContractorProposalComponent', () => {
  let component: ProposalDeclineComponent;
  let fixture: ComponentFixture<ProposalDeclineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalDeclineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalDeclineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
