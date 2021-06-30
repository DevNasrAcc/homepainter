import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {UploadPhotoElementComponent} from './upload-photo-element.component';

describe('UploadPhotoElementComponent', () => {
  let component: UploadPhotoElementComponent;
  let fixture: ComponentFixture<UploadPhotoElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadPhotoElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadPhotoElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
