import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {ProposalAcceptComponent} from './proposal-accept.component';

describe('ContractorProposalComponent', () => {
  let component: ProposalAcceptComponent;
  let fixture: ComponentFixture<ProposalAcceptComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalAcceptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalAcceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
