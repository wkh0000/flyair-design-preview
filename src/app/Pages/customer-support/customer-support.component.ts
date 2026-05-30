import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Public customer-support flow at /support.
 *
 *   Step 1: pick a category (date change, refund, name correction, …)
 *   Step 2: enter booking ID + contact + free-text details, then submit
 *   Step 3: success (or inline error) — driven by the API response
 *
 * The form submits to POST /api/Support which persists a SupportRequest row
 * that the admin Support Inbox reads.
 */
@Component({
  selector: 'app-customer-support',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './customer-support.component.html',
  styleUrl: './customer-support.component.scss',
})
export class CustomerSupportComponent {
  step = 1;
  submitting = false;
  errorMessage = '';

  category = '';
  bookingId = '';
  name = '';
  email = '';
  phone = '';
  details = '';
  ticketRef: number | null = null;

  categories: string[] = [
    'Date and time change',
    'Cancel/Refund flights request',
    'Name correction',
    'Make payment',
    'Extend ticket time limit',
    'Seat preference',
    'Meal preference',
    'Wheelchair assistance',
    'Payment confirmation',
    'Payment Invoice Request',
    'Other',
  ];

  constructor(private http: HttpClient) {}

  /** Detail-step fields are complete enough to submit. */
  get canSubmit(): boolean {
    return (
      !!this.bookingId.trim() &&
      !!this.name.trim() &&
      this.isValidEmail(this.email) &&
      this.details.trim().length >= 10
    );
  }

  private isValidEmail(s: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());
  }

  next(): void {
    if (this.step === 1 && !this.category) return;
    if (this.step === 1) {
      this.step = 2;
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
      return;
    }
    if (this.step === 2) this.submit();
  }

  back(): void {
    if (this.step > 1 && this.step < 3) {
      this.errorMessage = '';
      this.step--;
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }
  }

  reset(): void {
    this.step = 1;
    this.submitting = false;
    this.errorMessage = '';
    this.category = '';
    this.bookingId = '';
    this.name = '';
    this.email = '';
    this.phone = '';
    this.details = '';
    this.ticketRef = null;
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  private submit(): void {
    if (!this.canSubmit || this.submitting) return;
    this.submitting = true;
    this.errorMessage = '';
    const body = {
      category: this.category,
      bookingId: this.bookingId.trim(),
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim() || null,
      details: this.details.trim(),
      source: 'support-page',
    };
    this.http.post<{ id: number; message: string }>(`${environment.apiUrl}Support`, body).subscribe({
      next: (res) => {
        this.submitting = false;
        this.ticketRef = res?.id ?? null;
        this.step = 3;
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message
          || 'We could not submit your request right now. Please try again or email info@flyair.lk.';
      },
    });
  }
}
