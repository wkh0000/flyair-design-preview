import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SubscriberService } from '../../Services/Subscriber/subscriber.service';
import { PageService } from '../../Services/Page/page.service';
import { environment } from '../../../environments/environment';

export interface FooterContent {
  brandText: string;
  newsletterLabel: string;
  newsletterPlaceholder: string;
  socials: { facebook?: string; instagram?: string; x?: string };
  bottomCopy: string;
  poweredByLabel: string;
  poweredByLink: string;
}

export const FOOTER_DEFAULT: FooterContent = {
  brandText: 'Any airline, any destination, one simple search. Fly your way — with the best fares, no hidden fees, and support that never sleeps.',
  newsletterLabel: 'Get fare drops & deals',
  newsletterPlaceholder: 'Your email',
  socials: { facebook: '#', instagram: '#', x: '#' },
  bottomCopy: '© 2026 FlyAir · All rights reserved.',
  poweredByLabel: 'Travellers Marketplace',
  poweredByLink: 'https://travellers.lk',
};

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  /** Footer content — DB override layered over the baked-in default. */
  cms: FooterContent = { ...FOOTER_DEFAULT };

  /** Company contact details, surfaced in the brand column. Baseline comes
   *  from build-time environment.company; the admin Company Profile editor
   *  overlays a saved override. IATA is intentionally NOT exposed publicly. */
  company = {
    companyName: environment.company?.companyName || 'FlyAir',
    address: environment.company?.address || '',
    city: environment.company?.city || '',
    district: environment.company?.district || '',
    country: environment.company?.country || '',
    email: environment.company?.email || '',
    phone: environment.company?.phone || '',
  };
  /** One-line address assembled from the parts that are set. */
  get companyAddress(): string {
    return [this.company.address, this.company.city, this.company.district, this.company.country]
      .map(s => (s || '').trim()).filter(Boolean).join(', ');
  }

  /** Newsletter form state. */
  email = '';
  subState: 'idle' | 'sending' | 'ok' | 'error' = 'idle';
  subMessage = '';

  constructor(private subs: SubscriberService, private pages: PageService) {}

  ngOnInit(): void {
    this.pages.get('footer').subscribe({
      next: (o) => {
        if (o && (o.brandText || o.newsletterLabel || o.socials)) {
          this.cms = { ...FOOTER_DEFAULT, ...o, socials: { ...FOOTER_DEFAULT.socials, ...(o.socials || {}) } };
        }
      },
      error: () => { /* keep default */ },
    });
    // Company contact override (admin Company Profile). IATA never surfaced.
    this.pages.get('company-profile').subscribe({
      next: (o: any) => {
        if (o && (o.companyName || o.email || o.address)) {
          this.company = {
            companyName: o.companyName || this.company.companyName,
            address: o.address ?? this.company.address,
            city: o.city ?? this.company.city,
            district: o.district ?? this.company.district,
            country: o.country ?? this.company.country,
            email: o.email || this.company.email,
            phone: o.phone || this.company.phone,
          };
        }
      },
      error: () => { /* keep baseline */ },
    });
  }

  subscribe(): void {
    const email = this.email.trim();
    if (!email || this.subState === 'sending') return;
    this.subState = 'sending';
    this.subMessage = '';
    this.subs.subscribe(email, 'footer').subscribe({
      next: (r) => { this.subState = 'ok'; this.subMessage = r?.message || 'Subscribed.'; this.email = ''; },
      error: (e) => { this.subState = 'error'; this.subMessage = e?.error?.message || 'Could not subscribe. Please check your email and try again.'; },
    });
  }
}
