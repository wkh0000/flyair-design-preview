import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PageService } from '../../Services/Page/page.service';

export interface Section { h: string; p: string; }
export interface Author { name: string; role: string; }
export interface InfoDoc {
  title: string;
  eyebrow: string;
  updated?: string;
  intro: string;
  sections: Section[];
  legalLinks?: boolean;       // show Privacy/Terms/Cookies footer links
  heroImage?: string;         // optional banner image at the top of the page
  heroImageAlt?: string;
  author?: Author;            // who wrote it
  editor?: Author;            // who reviewed/approved it
  reviewedAt?: string;        // ISO date the editor signed off
}

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.scss',
})
export class LegalComponent implements OnInit {
  page = 'privacy';
  doc!: InfoDoc;

  /** Built-in defaults — also consumed by the admin Pages editor as the starting content. */
  static readonly DEFAULTS: Record<string, InfoDoc> = {
    /* ---------- Legal trio ---------- */
    privacy: {
      title: 'Privacy Policy', eyebrow: 'Legal', updated: '22 May 2026', legalLinks: true,
      intro: 'FlyAir respects your privacy. This policy explains what we collect when you search and book, how we use it, and the choices you have.',
      sections: [
        { h: 'Information we collect', p: 'Booking details (travellers, routes, dates), contact information (name, email, phone), and payment data processed securely by our payment partners. We also collect basic device and usage data to improve the service.' },
        { h: 'How we use your information', p: 'To search fares, confirm bookings, issue e-tickets, provide support, prevent fraud, and — only with your consent — send relevant offers. We never sell your personal data.' },
        { h: 'Sharing', p: 'We share only what is necessary with airlines, the Travelport Galileo GDS, and payment providers to complete your booking, and with authorities where legally required.' },
        { h: 'Data security', p: 'Data is transmitted over encrypted connections and stored with access controls. Payment credentials are tokenised and never stored in plain text.' },
        { h: 'Your rights', p: 'You may access, correct, or request deletion of your personal data, and withdraw marketing consent at any time by contacting us.' },
        { h: 'Contact', p: 'Questions about privacy? Email support@flyair.com.' },
      ],
    },
    terms: {
      title: 'Terms & Conditions', eyebrow: 'Legal', updated: '22 May 2026', legalLinks: true,
      intro: 'These terms govern your use of the FlyAir booking platform. By searching or booking, you agree to them.',
      sections: [
        { h: 'Bookings & payments', p: 'A booking is confirmed only once payment is authorised and an e-ticket reference is issued. Prices are shown in the displayed currency and include applicable taxes and fees.' },
        { h: 'Fares & availability', p: 'Fares are live and may change until ticketed; seat availability is not guaranteed until confirmation. FlyAir is a booking agent — carriage is subject to each airline’s conditions of carriage.' },
        { h: 'Changes, cancellations & refunds', p: 'Change and refund rules depend on the fare and airline. Eligible refunds are processed to the original payment method; airline and service fees may apply.' },
        { h: 'Your responsibilities', p: 'You must provide accurate traveller details exactly as per passport, and ensure valid travel documents, visas and health requirements for your trip.' },
        { h: 'Liability', p: 'FlyAir is not liable for airline schedule changes, cancellations, or denied boarding, but will assist you in line with airline policies and applicable law.' },
        { h: 'Governing law', p: 'These terms are governed by the laws of Sri Lanka. Disputes are subject to the courts of Colombo.' },
      ],
    },
    cookies: {
      title: 'Cookie Policy', eyebrow: 'Legal', updated: '22 May 2026', legalLinks: true,
      intro: 'We use cookies and similar technologies to make FlyAir work, to remember your preferences, and to understand how the site is used.',
      sections: [
        { h: 'What cookies are', p: 'Small text files stored on your device that help a website remember information between visits.' },
        { h: 'Essential cookies', p: 'Required for core features such as search sessions, security, and completing a booking. These cannot be switched off.' },
        { h: 'Preference cookies', p: 'Remember choices like currency, language and recent searches to personalise your experience.' },
        { h: 'Analytics cookies', p: 'Help us measure traffic and improve the booking flow. They are only set with your consent.' },
        { h: 'Managing cookies', p: 'You can accept or decline non-essential cookies via the banner, or control them in your browser settings at any time.' },
        { h: 'Contact', p: 'Questions about cookies? Email support@flyair.com.' },
      ],
    },

    /* ---------- Company ---------- */
    about: {
      title: 'About Us', eyebrow: 'Company',
      intro: 'FlyAir offers the lowest air fares, hotel bookings and overseas holiday packages — a seamless way to plan and book your next journey.',
      sections: [
        { h: 'Who we are', p: 'FlyAir is a modern online travel company helping travellers across Sri Lanka and beyond book affordable air tickets, hotel accommodation and exciting holiday packages. We bring hundreds of airlines into one simple search so you always find the right fare.' },
        { h: 'What we do', p: 'We are a leading player for booking cheap air tickets to anywhere around the world. Our user-friendly search engine, sharp pricing and regular discounts on air tickets and hotel bookings make travel planning effortless — anywhere, any time.' },
        { h: 'Our promise', p: 'No hidden fees, free 24-hour cancellation on eligible fares, secure payments, and real human support whenever your plans change.' },
        { h: 'Get in touch', p: 'Head office: Colombo 03, Sri Lanka · +94 76 123 4567 · support@flyair.com.' },
      ],
    },
    support: {
      title: 'Customer Support', eyebrow: 'Help',
      intro: 'We’re here around the clock to help with bookings, changes, refunds and anything else about your trip.',
      sections: [
        { h: 'Contact channels', p: 'Phone: +94 76 123 4567 (24/7). Email: support@flyair.com. Live chat is available from the bottom-right of every page during business hours.' },
        { h: 'Manage your booking', p: 'Use “Manage booking” with your PNR and email to view your itinerary, request changes, or start a refund.' },
        { h: 'Refunds & changes', p: 'Most fares can be changed or refunded subject to airline rules. Submit a request and our team will confirm fees and process eligible refunds to your original payment method.' },
        { h: 'Response times', p: 'Live chat: instant. Email: within 4 hours. Refund processing: 5–14 business days depending on the airline and bank.' },
      ],
    },
    faq: {
      title: 'Frequently Asked Questions', eyebrow: 'Help',
      intro: 'Quick answers to the questions we hear most often.',
      sections: [
        { h: 'How do I book a flight?', p: 'Search your route and date on the home page, pick a fare, enter passenger details, and pay. You’ll receive an e-ticket confirmation by email instantly.' },
        { h: 'Which payment methods can I use?', p: 'Credit and debit cards (Visa, Mastercard, Amex), direct bank deposit, and instalment plans with selected banks. See Payments Information in the footer.' },
        { h: 'Can I cancel or change my booking?', p: 'Yes — eligible fares offer free cancellation within 24 hours of booking. After that, airline change/refund rules apply.' },
        { h: 'How do I get my boarding pass?', p: 'Use Airline Web Check-In (linked in the footer) with your airline confirmation, usually from 48 hours before departure.' },
        { h: 'Is my payment secure?', p: 'Yes. Payments are processed over encrypted connections and card data is tokenised — we never store your full card number.' },
        { h: 'I didn’t get my confirmation email', p: 'Check your spam folder, then contact support@flyair.com with your name and travel dates and we’ll resend it.' },
      ],
    },

    /* ---------- Our Products ---------- */
    'flight-tickets': {
      title: 'Flight Tickets', eyebrow: 'Our Products',
      intro: 'Book domestic and international flights from every airline at the best available fares.',
      sections: [
        { h: 'Every airline, one search', p: 'Compare full-service and low-cost carriers side by side — SriLankan, Emirates, Qatar Airways, Singapore Airlines, Cathay Pacific and many more — and pick the fare that suits you.' },
        { h: 'One-way & return', p: 'Search one-way or return journeys, filter by stops, airlines and layover points, and choose your cabin from Economy to Business.' },
        { h: 'Transparent pricing', p: 'The price you see includes taxes and fees. No hidden charges, with optional extras shown clearly before you pay.' },
        { h: 'Instant e-tickets', p: 'Receive your e-ticket and full itinerary by email the moment your booking is confirmed — ready for check-in.' },
      ],
    },

    /* ---------- Payments Information ---------- */
    'payment-options': {
      title: 'Payment Options', eyebrow: 'Payments Information',
      intro: 'Flexible, fee-friendly ways to pay for your travel — by card, by bank deposit, or in instalments.',
      sections: [
        { h: 'Make payment online', p: 'Pay instantly with your credit or debit card (Visa, Mastercard, Amex). Your booking is confirmed and ticketed in seconds. A convenience fee of 2% (VISA/Master) or 2.6% (Amex) may apply.' },
        { h: 'Bank deposit', p: 'Prefer to pay by transfer? Choose “Bank Deposit” at checkout, and we’ll email you a reservation copy with our account details. See Bank Transfer for step-by-step instructions.' },
        { h: 'Credit Card EMI / Instalments', p: 'Split the cost of your trip into easy monthly instalments with selected partner banks. See Instalment Plans for participating banks and tenures.' },
      ],
    },
    'bank-transfer': {
      title: 'Bank Transfer', eyebrow: 'Payments Information',
      intro: 'Transfer the price of your flight ticket into our account using your local bank ATM or internet banking.',
      sections: [
        { h: 'Step 1 — Book your flight online', p: '1) Search flight  2) Select your flight  3) Complete the booking details. At checkout choose the payment option “Bank Deposit” and click Confirm — we’ll email you a reservation copy.' },
        { h: 'Step 2 — Select your bank & transfer', p: 'FlyAir Sampath Bank account — Account Name: FlyAir (Pvt) Ltd · Account Number: 0027 1001 0911 · Branch: Old Moor Street. Transfers are also accepted to our Commercial Bank and Bank of Ceylon accounts.' },
        { h: 'Step 3 — Send us the slip', p: 'Email your deposit slip or transfer reference to support@flyair.com with your booking PNR. Once verified (usually within a few hours) we issue your ticket and email the confirmation.' },
        { h: 'Good to know', p: 'Bank transfer payments are fee-free. Tickets are held pending payment — please transfer before the fare expiry shown on your reservation copy.' },
      ],
    },
    cards: {
      title: 'Credit / Debit Cards', eyebrow: 'Payments Information',
      intro: 'We accept all major local and international credit and debit cards through a secure payment gateway.',
      sections: [
        { h: 'Accepted cards', p: 'Visa, Mastercard and American Express issued by Sampath, Standard Chartered, Nations Trust, HNB, Commercial Bank, HSBC, Seylan, Bank of Ceylon, NDB, DFCC, Union Bank, People’s Bank and all other banks.' },
        { h: 'Convenience fee', p: 'A convenience fee of 2% applies for VISA/Mastercard and 2.6% for American Express, shown clearly before you confirm payment.' },
        { h: 'Secure by design', p: 'All card payments are processed over an encrypted, PCI-compliant gateway with 3-D Secure (OTP) verification. FlyAir never stores your full card number.' },
      ],
    },
    instalments: {
      title: 'Instalment Plans', eyebrow: 'Payments Information',
      intro: 'Travel now and pay over time with flexible Credit Card EMI plans from our partner banks.',
      sections: [
        { h: 'How it works', p: 'Choose “Instalment Plan” at checkout, select your bank and preferred tenure (3, 6, 12 or 24 months), and complete the card payment. Your bank converts the purchase into easy monthly instalments.' },
        { h: 'Participating banks', p: 'Sampath, Commercial Bank, HNB, Nations Trust (American Express), Standard Chartered, Seylan and more. Available tenures and interest rates are set by each bank.' },
        { h: 'Eligibility', p: 'Instalment plans are available on eligible credit cards above a minimum spend. Terms, interest and any processing fees are governed by your card-issuing bank.' },
      ],
    },

    /* ---------- Other Information ---------- */
    'offers-promotions': {
      title: 'Deals & Offers', eyebrow: 'Save more',
      intro: 'Seasonal deals, fare sales and partner promotions to help you fly for less.',
      sections: [
        { h: '15% off your first booking', p: 'New to FlyAir? Use code FLYNEW15 at checkout to take 15% off your first flight booking (capped; selected fares).' },
        { h: 'Double reward miles', p: 'Earn double reward miles on all long-haul flights booked this month — automatically credited after travel.' },
        { h: 'Free seat selection', p: 'Complimentary standard seat selection on Economy Plus and above on participating airlines.' },
        { h: 'Bank card offers', p: 'Extra savings and instalment deals with Sampath, Commercial Bank, HNB and Nations Trust cards. Watch this page for current campaigns.' },
      ],
    },
    airlines: {
      title: 'Our Airlines', eyebrow: 'Network',
      intro: 'FlyAir partners with hundreds of full-service and low-cost carriers worldwide.',
      sections: [
        { h: 'Featured partners', p: 'SriLankan Airlines, Emirates, Qatar Airways, Singapore Airlines, Cathay Pacific, Malaysia Airlines, Thai Airways, FitsAir and many more.' },
        { h: 'Full-service & low-cost', p: 'Compare premium carriers with generous baggage and meals against budget fares — all in one search, with the inclusions shown for each fare brand.' },
        { h: 'Baggage & policies', p: 'Each airline sets its own baggage allowance, change and cancellation rules. We display these on the fare details so you can choose with confidence.' },
      ],
    },
    'web-checkin': {
      title: 'Online Check-in', eyebrow: 'Book & Manage',
      intro: 'Skip the airport queues — check in online directly with your operating airline.',
      sections: [
        { h: 'When to check in', p: 'Most airlines open web check-in 24–48 hours before departure and close it 1–3 hours before. Check your airline’s exact window in your confirmation email.' },
        { h: 'What you need', p: 'Your airline booking reference (PNR) and passenger surname. For international travel, have your passport and any required visas ready.' },
        { h: 'How to check in', p: 'Visit your operating airline’s website or app, enter your PNR and surname, choose your seat, and download or print your boarding pass.' },
        { h: 'Need help?', p: 'Can’t find your airline PNR? Contact support@flyair.com with your FlyAir booking reference and we’ll help you locate it.' },
      ],
    },
    sitemap: {
      title: 'Sitemap', eyebrow: 'Other Information',
      intro: 'A quick index of the main pages across FlyAir.',
      sections: [
        { h: 'Book & manage', p: 'Home / Flight search, Search results, Booking, Manage booking, Sign in.' },
        { h: 'Our products', p: 'Flight Tickets.' },
        { h: 'Payments information', p: 'Payment Options, Bank Transfer, Credit/Debit Cards, Instalment Plans.' },
        { h: 'Other information', p: 'Offers & Promotions, Airlines, Airline Web Check-In, Sitemap, Security.' },
        { h: 'Company & legal', p: 'About Us, Customer Support, FAQ, Contact Us, Privacy Policy, Terms & Conditions, Cookie Policy.' },
      ],
    },
    security: {
      title: 'Security', eyebrow: 'Trust & safety',
      intro: 'Your safety online is a priority. Here’s how we protect your data and payments.',
      sections: [
        { h: 'Encrypted everywhere', p: 'All traffic to FlyAir is served over HTTPS/TLS, so the information you send is encrypted in transit.' },
        { h: 'Secure payments', p: 'Card payments run through a PCI-DSS-compliant gateway with 3-D Secure (OTP). Card data is tokenised — your full number is never stored on our servers.' },
        { h: 'Account protection', p: 'Admin access is protected with hashed credentials and session controls. We continually monitor for suspicious activity.' },
        { h: 'Report a concern', p: 'Spotted something suspicious? Email security@flyair.com and our team will investigate promptly.' },
      ],
    },

    /* ---------- Book & Manage ---------- */
    baggage: {
      title: 'Baggage Allowance', eyebrow: 'Book & Manage',
      intro: 'Know exactly what you can carry. Allowances depend on the airline, route and fare brand you book.',
      sections: [
        { h: 'Cabin baggage', p: 'Most economy fares include one cabin bag (typically up to 7 kg) plus a small personal item. Premium and business cabins usually allow more. The exact limit is shown on each fare’s details before you pay.' },
        { h: 'Checked baggage', p: 'Checked allowance varies from 0 kg on the lightest low-cost fares to 30–40 kg on full-service and long-haul tickets. Pick the fare brand that matches how much you’re carrying.' },
        { h: 'Extra & excess baggage', p: 'Need more? Pre-purchasing extra baggage online is almost always cheaper than paying at the airport. Add bags during booking or via Manage Booking.' },
        { h: 'Special items', p: 'Sports gear, musical instruments and mobility aids may need to be declared in advance. Contact our Help Center and we’ll arrange it with the airline.' },
        { h: 'Restricted items', p: 'Power banks and spare lithium batteries must travel in cabin baggage, never checked. Sharp objects, liquids over 100 ml and other restricted items follow standard aviation security rules.' },
      ],
    },
    'flight-status': {
      title: 'Flight Status', eyebrow: 'Book & Manage',
      intro: 'Check whether your flight is on time before you head to the airport.',
      sections: [
        { h: 'How to check', p: 'Look up your flight by airline + flight number, or by route and date. We surface the latest scheduled, estimated and actual times directly from the airline.' },
        { h: 'Stay notified', p: 'Add your contact details at booking and we’ll alert you by email or SMS about gate changes, delays and cancellations for your flight.' },
        { h: 'If your flight is delayed or cancelled', p: 'The operating airline manages re-accommodation. Our Help Center can assist with rebooking options and, where eligible, refunds under the airline’s policy.' },
        { h: 'Plan your airport arrival', p: 'For domestic flights arrive 2 hours before departure; for international flights, 3 hours. Check-in and bag-drop close earlier than boarding.' },
      ],
    },

    /* ---------- Help & Support ---------- */
    refunds: {
      title: 'Refunds & Changes', eyebrow: 'Help & Support',
      intro: 'Plans change. Here’s how date changes, cancellations and refunds work on FlyAir.',
      sections: [
        { h: '24-hour free cancellation', p: 'Eligible fares can be cancelled free of charge within 24 hours of booking for a full refund — look for the “Free 24h cancellation” badge on the fare.' },
        { h: 'Date & time changes', p: 'Request a change from Manage Booking or the Help Center. Any airline change fee plus fare difference is shown before you confirm.' },
        { h: 'Cancellations & refunds', p: 'Refund eligibility and amount depend on the fare rules and airline. Submit a request and we’ll confirm the refundable value and process it to your original payment method.' },
        { h: 'Processing times', p: 'Approved refunds are typically returned in 5–14 business days depending on the airline and your bank. We keep you updated by email throughout.' },
        { h: 'Start a request', p: 'Open the Help Center, choose “Cancel/Refund flights request”, enter your Booking ID, and our team takes it from there.' },
      ],
    },
    advisories: {
      title: 'Travel Advisories', eyebrow: 'Help & Support',
      intro: 'Stay informed about entry rules, health requirements and disruptions that may affect your trip.',
      sections: [
        { h: 'Documents & visas', p: 'Carry a passport valid for at least six months beyond your travel dates, and check visa requirements for your destination and any transit points well before you fly.' },
        { h: 'Health requirements', p: 'Some destinations require vaccinations or health declarations. Check the latest guidance from the destination’s authorities and your airline before departure.' },
        { h: 'Weather & disruptions', p: 'During severe weather or operational disruptions, airlines may waive change fees. We’ll notify affected travellers and help you find the next best option.' },
        { h: 'Safety while travelling', p: 'Keep digital and physical copies of your travel documents, share your itinerary with someone you trust, and note local emergency numbers at your destination.' },
      ],
    },

    /* ---------- Company ---------- */
    careers: {
      title: 'Careers at FlyAir', eyebrow: 'Company',
      intro: 'Help millions travel more easily. Join a team that’s reimagining how the world books flights.',
      sections: [
        { h: 'Why FlyAir', p: 'We’re a fast-moving travel-tech team building a delightful booking experience on a modern stack. You’ll ship real features that travellers use every day.' },
        { h: 'How we work', p: 'Small autonomous squads, strong ownership, and a bias for shipping. We value clear communication, craftsmanship and kindness over ego.' },
        { h: 'Open roles', p: 'We’re always interested in talented Frontend (Angular) and Backend (.NET) engineers, product designers, and customer-experience specialists.' },
        { h: 'Perks', p: 'Flexible hours, learning budget, generous leave, and — naturally — travel discounts for you and your family.' },
        { h: 'Apply', p: 'Send your CV and a short note to careers@flyair.com. We read every application.' },
      ],
    },

    /* ---------- Payments ---------- */
    fees: {
      title: 'Fees & Charges', eyebrow: 'Payments',
      intro: 'Transparent pricing with no surprises. Here’s a clear breakdown of any fees that may apply.',
      sections: [
        { h: 'Fare price', p: 'The price you see for each fare already includes the base fare plus all applicable taxes and mandatory carrier charges — there are no hidden booking fees.' },
        { h: 'Card convenience fee', p: 'A convenience fee of 2% applies for VISA/Mastercard and 2.6% for American Express, shown clearly before you confirm. Bank transfer payments are fee-free.' },
        { h: 'Optional extras', p: 'Add-ons like extra baggage, seat selection or meals are priced separately and only charged if you choose them.' },
        { h: 'Change & cancellation fees', p: 'Airline change/cancellation fees plus any fare difference depend on the fare rules and are always displayed before you confirm a change.' },
        { h: 'Refund handling', p: 'We don’t charge a markup on refunds — eligible amounts are returned per the airline’s policy to your original payment method.' },
      ],
    },
  };

  constructor(private route: ActivatedRoute, private pages: PageService) {}

  ngOnInit(): void {
    this.route.data.subscribe((d) => {
      this.page = d['page'] || 'privacy';
      // Built-in default first (instant render / SSR), then overlay any admin override.
      this.doc = LegalComponent.DEFAULTS[this.page] || LegalComponent.DEFAULTS['privacy'];
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
      this.pages.get(this.page).subscribe({
        next: (o) => { if (o && o.title && Array.isArray(o.sections)) this.doc = o as InfoDoc; },
        error: () => { /* keep default */ },
      });
    });
  }
}
