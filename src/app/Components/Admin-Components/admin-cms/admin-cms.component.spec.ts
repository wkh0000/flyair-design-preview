import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCmsComponent } from './admin-cms.component';

describe('AdminCmsComponent', () => {
  let component: AdminCmsComponent;
  let fixture: ComponentFixture<AdminCmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCmsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
