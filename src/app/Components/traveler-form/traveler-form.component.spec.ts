import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelerFormComponent } from './traveler-form.component';

describe('TravelerFormComponent', () => {
  let component: TravelerFormComponent;
  let fixture: ComponentFixture<TravelerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
