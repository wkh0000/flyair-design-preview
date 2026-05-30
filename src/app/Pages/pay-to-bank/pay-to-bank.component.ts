import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pay-to-bank',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pay-to-bank.component.html',
  styleUrl: './pay-to-bank.component.scss',
})
export class PayToBankComponent implements OnInit {
  bookingSteps: string[] = [
    'Search flight',
    'Select your flight',
    'Complete the booking details',
  ];

  account = [
    { label: 'Account Name', value: 'FlyAir (Pvt) Ltd.' },
    { label: 'Account Number', value: '0027 1001 0911' },
    { label: 'Account Branch', value: 'Old Moor Street' },
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }
}
