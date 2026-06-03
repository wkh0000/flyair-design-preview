import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Editable front-page content shape (mirrors the admin editor + backend JSON document). */
export interface HomeStat { icon?: string; value: string; label: string; }
export interface HomeFeature { icon: string; color: string; title: string; text: string; }
export interface HomeDestination { image: string; city: string; country?: string; badge?: string; badgeColor?: string; price?: string; link?: string; }
export interface HomeOffer { icon: string; color: string; title: string; text: string; }

export interface HomeContent {
  hero: {
    eyebrow: string; titleLine1: string; titleAccent: string; lead: string;
    badges: string[];
  };
  stats: HomeStat[];
  why: { eyebrow: string; title: string; lead: string; items: HomeFeature[]; };
  destinations: { eyebrow: string; title: string; ctaLabel?: string; ctaLink?: string; items: HomeDestination[]; };
  featured: { eyebrow: string; title: string; text: string; image: string; ctaLabel: string; ctaLink: string; };
  offers: { eyebrow: string; title: string; items: HomeOffer[]; };
  cta: {
    eyebrow: string; title: string; lead: string;
    primaryLabel: string; primaryLink: string; secondaryLabel: string; secondaryLink: string;
  };
}

/** Baked-in default so the home + admin render fully before/without the API. */
export const DEFAULT_HOME: HomeContent = {
  hero: {
    eyebrow: 'Every airline · one search',
    titleLine1: 'Your journey,', titleAccent: 'Fly your way',
    lead: 'Anywhere in the world. The best fares. One beautifully simple search — and the whole sky opens up.',
    badges: ['No hidden fees', 'Free 24h cancellation', 'Secure payments'],
  },
  stats: [
    { icon: 'globe', value: '500+', label: 'Airline partners' },
    { icon: 'plane-takeoff', value: '2M+', label: 'Trips booked' },
    { icon: 'map-pin', value: '40+', label: 'Countries served' },
    { icon: 'star', value: '4.8★', label: 'Traveller rating' },
  ],
  why: {
    eyebrow: 'Why FlyAir', title: 'Booking that finally feels effortless',
    lead: 'Everything you need to find, book and manage your trip — refined down to the last detail.',
    items: [
      { icon: 'search', color: 'blue', title: 'Smart fare search', text: 'Compare 500+ airlines in real time and lock in the lowest fare with fully transparent pricing.' },
      { icon: 'ticket', color: 'red', title: 'Instant e-tickets', text: 'Confirm in seconds and get your e-ticket and itinerary by email, ready for check-in.' },
      { icon: 'shield-check', color: 'green', title: 'Care that travels', text: 'Free 24-hour cancellation, easy refunds and real human support whenever your plans change.' },
    ],
  },
  destinations: { eyebrow: 'Popular right now', title: 'Where to next?', ctaLabel: 'View all destinations', ctaLink: '/result', items: [] },
  featured: { eyebrow: 'Featured destination', title: '', text: '', image: '', ctaLabel: 'Explore', ctaLink: '/result' },
  offers: {
    eyebrow: 'Special offers', title: 'Deals worth the detour',
    items: [
      { icon: 'percent-tag', color: 'red', title: '15% off your first booking', text: 'Use code FLYNEW15 at checkout on any flight.' },
      { icon: 'star', color: 'blue', title: 'Double reward miles', text: 'Earn 2× miles on every long-haul flight this month.' },
      { icon: 'seat', color: 'green', title: 'Free seat selection', text: 'Complimentary seat choice on Economy Plus and above.' },
    ],
  },
  cta: {
    eyebrow: 'The sky is open', title: 'Begin a journey that feels première from the very first tap',
    lead: 'Search smarter, book in seconds, and travel with the calm of knowing every detail is handled.',
    primaryLabel: 'Get in touch', primaryLink: '/contact', secondaryLabel: 'Log in', secondaryLink: '/admin-login',
  },
};

@Injectable({ providedIn: 'root' })
export class HomeService {
  private base = `${environment.apiUrl}Home`;

  constructor(private http: HttpClient) {}

  /** Public: fetch the home content document. */
  get(): Observable<Partial<HomeContent>> {
    return this.http.get<Partial<HomeContent>>(this.base);
  }

  /** Admin: save the full home content as a JSON string. */
  save(content: HomeContent): Observable<any> {
    return this.http.put(`${this.base}/admin`, { contentJson: JSON.stringify(content) });
  }
}
