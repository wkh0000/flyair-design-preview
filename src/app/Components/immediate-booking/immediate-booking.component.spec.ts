import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmediateBookingComponent } from './immediate-booking.component';

describe('ImmediateBookingComponent', () => {
  let component: ImmediateBookingComponent;
  let fixture: ComponentFixture<ImmediateBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmediateBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmediateBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
