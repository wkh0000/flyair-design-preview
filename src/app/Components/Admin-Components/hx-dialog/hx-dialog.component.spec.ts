import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HxDialogComponent } from './hx-dialog.component';

describe('HxDialogComponent', () => {
  let component: HxDialogComponent;
  let fixture: ComponentFixture<HxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HxDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
