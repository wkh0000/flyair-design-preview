import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMarkupComponent } from './admin-markup.component';

describe('AdminMarkupComponent', () => {
  let component: AdminMarkupComponent;
  let fixture: ComponentFixture<AdminMarkupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMarkupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMarkupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
