import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FinalComponent } from './final.component';

describe('FinalComponent', () => {
  let component: FinalComponent;
  let fixture: ComponentFixture<FinalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
