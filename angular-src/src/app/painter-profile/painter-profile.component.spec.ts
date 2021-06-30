import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainterProfileComponent } from './painter-profile.component';

describe('PainterProfileComponent', () => {
  let component: PainterProfileComponent;
  let fixture: ComponentFixture<PainterProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PainterProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PainterProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
