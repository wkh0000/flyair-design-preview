import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PageService } from '../../Services/Page/page.service';
import { InquiryService } from '../../Services/Inquiry/inquiry.service';

export interface ContactContent {
  eyebrow: string;
  heading: string;
  intro: string;
  formHeading: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

/** Built-in default — also the starting content for the admin Pages editor. */
export const CONTACT_DEFAULT: ContactContent = {
  eyebrow: 'Get in touch',
  heading: 'Contact Us',
  intro: "We’re here to help — questions about a booking, a refund, or you just want to connect. Reach out and our team will get back to you within hours.",
  formHeading: 'Send us a message',
  address: environment.address || 'Colombo 03, Sri Lanka',
  phone: environment.phone || '+94 76 123 4567',
  email: environment.email || 'support@flyair.com',
  hours: 'Open 24 hours · 7 days a week',
};

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  cms: ContactContent = { ...CONTACT_DEFAULT };

  // template still binds {{ address }} / tel: / mailto: / map → keep getters
  get address(): string { return this.cms.address; }
  get phone(): string { return this.cms.phone; }
  get email(): string { return this.cms.email; }

  mapUrl!: SafeResourceUrl;

  form = { name: '', email: '', phone: '', subject: '', message: '' };
  sent = false;
  sending = false;
  errorMsg = '';

  constructor(
    private sanitizer: DomSanitizer,
    private pages: PageService,
    private inquiries: InquiryService,
  ) {
    this.buildMap();
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
    this.pages.get('contact').subscribe({
      next: (o) => {
        if (o && (o.heading || o.address)) {
          this.cms = { ...CONTACT_DEFAULT, ...o };
          this.buildMap();
        }
      },
      error: () => { /* keep default */ },
    });
  }

  private buildMap(): void {
    const q = encodeURIComponent(this.cms.address);
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${q}&z=14&output=embed`
    );
  }

  submit(): void {
    if (this.sending) return;
    if (!this.form.name.trim() || !this.form.email.trim() || !this.form.message.trim()) return;
    this.sending = true;
    this.errorMsg = '';
    this.inquiries.submit({
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      phone: this.form.phone?.trim() || undefined,
      subject: this.form.subject?.trim() || undefined,
      message: this.form.message.trim(),
      source: 'contact-page',
    }).subscribe({
      next: () => { this.sending = false; this.sent = true; },
      error: (e) => {
        this.sending = false;
        this.errorMsg = (e?.error?.message) || 'Something went wrong sending your message. Please try again or email us directly.';
      },
    });
  }

  reset(): void {
    this.form = { name: '', email: '', phone: '', subject: '', message: '' };
    this.sent = false;
    this.errorMsg = '';
  }
}
