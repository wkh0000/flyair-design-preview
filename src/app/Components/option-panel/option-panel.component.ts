import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-option-panel',
  standalone: true,
  imports: [],
  templateUrl: './option-panel.component.html',
  styleUrl: './option-panel.component.scss'
})
export class OptionPanelComponent {
@Input() IsDepartureSelected: Boolean = false

}
