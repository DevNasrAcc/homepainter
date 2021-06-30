import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {DisplayNameToPictureComponent} from './display-name-to-picture.component';

describe('DisplayNameToPictureComponent', () => {
  let component: DisplayNameToPictureComponent;
  let fixture: ComponentFixture<DisplayNameToPictureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayNameToPictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayNameToPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
