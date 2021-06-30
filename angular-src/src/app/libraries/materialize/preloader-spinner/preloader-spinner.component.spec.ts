import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreloaderSpinnerComponent } from './preloader-spinner.component';

describe('PreloaderSpinnerComponent', () => {
  let component: PreloaderSpinnerComponent;
  let fixture: ComponentFixture<PreloaderSpinnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreloaderSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreloaderSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
