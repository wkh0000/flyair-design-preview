import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLimitationsComponent } from './admin-limitations.component';

describe('AdminLimitationsComponent', () => {
  let component: AdminLimitationsComponent;
  let fixture: ComponentFixture<AdminLimitationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLimitationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLimitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
