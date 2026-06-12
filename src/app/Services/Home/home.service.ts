import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Editable front-page content shape (mirrors the admin editor + backend JSON document). */
export interface HomeStat { icon?: string; value: string; label: string; }
export interface HomeFeature { icon: string; color: string; title: string; text: string; }
export interface HomeDestination {
  image: string; city: string; country?: string;
  badge?: string; badgeColor?: string; price?: string; link?: string;
  // Optional admin-configurable prefill targets for the on-click flight search:
  //   - originCode: IATA code we depart from when admin wants to override the
  //     consumer-side default (otherwise the home page picks its own default)
  //   - destinationCode: IATA code we land at (falls back to `code` then `city`)
  //   - airlineCode: optionally narrow the search to one carrier
  //   - code: legacy alias some content has used for destination code
  originCode?: string;
  destinationCode?: string;
  airlineCode?: string;
  code?: string;
}
export interface HomeOffer { icon: string; color: string; title: string; text: string; }
export interface HomeReview {
  name: string; location?: string; rating: number; quote: string;
  route?: string;        // e.g. "CMB → DXB" — shown as a small route chip
}

/** Global defaults that the home page uses when a destination/promotion card
 *  is clicked and we navigate to the search form. Optional in the API contract
 *  so older content payloads (without the field) continue to work. */
export interface HomeSearchDefaults {
  advanceDays: number;   // how many days from today to prefill as the departure date
  travellers: number;    // how many adult passengers to prefill
}

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
  reviews?: { eyebrow: string; title: string; lead?: string; items: HomeReview[]; };
  cta: {
    eyebrow: string; title: string; lead: string;
    primaryLabel: string; primaryLink: string; secondaryLabel: string; secondaryLink: string;
  };
  searchDefaults?: HomeSearchDefaults;
}

/** Baked-in default so the home + admin render fully before/without the API. */
export const DEFAULT_HOME: HomeContent = {
  hero: {
    eyebrow: 'Any airline, Any destination,',
    titleLine1: 'One simple search', titleAccent: 'Fly your way',
    lead: '',
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
    eyebrow: 'Member perks', title: 'More reasons to book with FlyAir',
    items: [
      { icon: 'percent-tag', color: 'red', title: '15% off your first booking', text: 'Use code FLYNEW15 at checkout on any flight.' },
      { icon: 'star', color: 'blue', title: 'Double reward miles', text: 'Earn 2× miles on every long-haul flight this month.' },
      { icon: 'seat', color: 'green', title: 'Free seat selection', text: 'Complimentary seat choice on Economy Plus and above.' },
    ],
  },
  reviews: {
    eyebrow: 'Loved by travellers', title: 'What our travellers say',
    lead: 'Real journeys booked with FlyAir — from quick city hops to long-haul family holidays.',
    items: [
      { name: 'Nimal Perera', location: 'Colombo, Sri Lanka', rating: 5, route: 'CMB → DXB',
        quote: 'Booked a last-minute Colombo–Dubai return and the fare was the best I found anywhere. My e-ticket landed in my inbox before I’d even closed the laptop.' },
      { name: 'Aisha Rahman', location: 'Dubai, UAE', rating: 5, route: 'DXB → CMB',
        quote: 'The free 24-hour cancellation saved me when a meeting moved. I changed my dates with zero fuss and not a single hidden charge.' },
      { name: 'Rohan Fernando', location: 'Kandy, Sri Lanka', rating: 4, route: 'CMB → SIN',
        quote: 'Comparing every airline in one search is exactly what I needed. Clean, fast, and the price I saw was the price I paid.' },
      { name: 'Priya Nair', location: 'Chennai, India', rating: 5, route: 'MAA → CMB',
        quote: 'Support actually answered at 2am when my connection changed. They rebooked me before I even reached the airport.' },
      { name: 'James Whitfield', location: 'London, UK', rating: 5, route: 'LHR → CMB',
        quote: 'I travel for work constantly and FlyAir has become my default. Transparent fares, instant tickets, no surprises at checkout.' },
      { name: 'Dilani Jayawardena', location: 'Colombo, Sri Lanka', rating: 4, route: 'CMB → SIN',
        quote: 'Paid in instalments with my Sampath card for a family trip to Singapore. It made a big booking feel completely manageable.' },
    ],
  },
  cta: {
    eyebrow: 'The sky is open', title: 'Begin a journey that feels première from the very first tap',
    lead: 'Search smarter, book in seconds, and travel with the calm of knowing every detail is handled.',
    primaryLabel: 'Get in touch', primaryLink: '/contact', secondaryLabel: 'Log in', secondaryLink: '/admin-login',
  },
  searchDefaults: { advanceDays: 7, travellers: 1 },
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
