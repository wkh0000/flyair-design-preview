import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SubscriberService } from '../../Services/Subscriber/subscriber.service';
import { PageService } from '../../Services/Page/page.service';

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
  brandText: 'Every airline, one search. Fly your way — with the best fares, no hidden fees, and support that never sleeps.',
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
