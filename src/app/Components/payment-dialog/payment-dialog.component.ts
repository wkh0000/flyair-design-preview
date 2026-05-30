import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.scss'
})
export class PaymentDialogComponent {
  currentStep = 1;
  @Output() closed = new EventEmitter<void>();
@Output() cancel = new EventEmitter<void>();


  goToStep(step: number) {
    this.currentStep = step;
  }
  placeOrder() {
    console.log("close it");
    this.closed.emit(); // Replace with selected method
  }
}
