import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {DisplayPhotoElementComponent} from './display-photo-element.component';

describe('DisplayPhotoElementComponent', () => {
  let component: DisplayPhotoElementComponent;
  let fixture: ComponentFixture<DisplayPhotoElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayPhotoElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayPhotoElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
