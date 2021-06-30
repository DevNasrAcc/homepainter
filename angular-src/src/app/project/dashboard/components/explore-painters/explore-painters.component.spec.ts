import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {InvitePainterComponent} from './suggested.component';

describe('SuggestedComponent', () => {
  let component: InvitePainterComponent;
  let fixture: ComponentFixture<InvitePainterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitePainterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitePainterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
