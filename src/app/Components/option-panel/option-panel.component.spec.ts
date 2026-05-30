import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionPanelComponent } from './option-panel.component';

describe('OptionPanelComponent', () => {
  let component: OptionPanelComponent;
  let fixture: ComponentFixture<OptionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
