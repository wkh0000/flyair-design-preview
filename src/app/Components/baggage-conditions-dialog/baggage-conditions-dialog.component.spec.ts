import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaggageConditionsDialogComponent } from './baggage-conditions-dialog.component';

describe('BaggageConditionsDialogComponent', () => {
  let component: BaggageConditionsDialogComponent;
  let fixture: ComponentFixture<BaggageConditionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaggageConditionsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaggageConditionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
