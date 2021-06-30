import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {MyProjectsComponent} from './dashboard.component';

describe('DashboardComponent', () => {
  let component: MyProjectsComponent;
  let fixture: ComponentFixture<MyProjectsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
