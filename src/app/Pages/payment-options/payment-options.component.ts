import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PayOption {
  icon: string;
  title: string;
  tag: string;
  desc: string;
  link: string;
}

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-options.component.html',
  styleUrl: './payment-options.component.scss',
})
export class PaymentOptionsComponent implements OnInit {
  options: PayOption[] = [
    {
      icon: 'credit_card',
      title: 'Make Payment Online',
      tag: 'Credit / Debit Cards',
      desc: 'Pay instantly with Visa, Mastercard or Amex through our secure gateway. Your booking is confirmed and ticketed in seconds.',
      link: '/cards',
    },
    {
      icon: 'account_balance',
      title: 'Bank Deposit',
      tag: 'Pay by transfer',
      desc: 'Prefer to pay by transfer? Deposit the fare into our account via ATM or internet banking and we will issue your ticket.',
      link: '/bank-transfer',
    },
    {
      icon: 'payments',
      title: 'Credit Card EMI',
      tag: 'Easy instalments',
      desc: 'Travel now and pay over time. Split the cost into easy monthly instalments with our selected partner banks.',
      link: '/instalments',
    },
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }
}
