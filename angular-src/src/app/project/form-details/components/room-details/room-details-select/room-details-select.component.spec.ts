import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {RoomDetailsSelectComponent} from './room-details-select.component';

describe('SelectComponent', () => {
  let component: RoomDetailsSelectComponent;
  let fixture: ComponentFixture<RoomDetailsSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomDetailsSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomDetailsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
