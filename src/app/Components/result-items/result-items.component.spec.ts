import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultItemsComponent } from './result-items.component';

describe('ResultItemsComponent', () => {
  let component: ResultItemsComponent;
  let fixture: ComponentFixture<ResultItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
