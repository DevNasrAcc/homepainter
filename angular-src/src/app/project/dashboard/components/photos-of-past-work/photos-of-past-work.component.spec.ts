import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {PhotosOfPastWorkComponent} from './photos-of-past-work.component';

describe('PhotosOfPastWorkComponent', () => {
  let component: PhotosOfPastWorkComponent;
  let fixture: ComponentFixture<PhotosOfPastWorkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotosOfPastWorkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotosOfPastWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
