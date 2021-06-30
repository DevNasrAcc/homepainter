import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NotificationSettingsComponent} from './communication-settings.component';

describe('CommunicationSettingsComponent', () => {
  let component: NotificationSettingsComponent;
  let fixture: ComponentFixture<NotificationSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
