import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FlightSearchComponent } from '../../Components/flight-search/flight-search.component';
import { FlyairSkyComponent } from '../../Components/flyair-sky/flyair-sky.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/Auth/auth.service';
import { UtilityServiceService } from '../../Services/Admin-Services/UtilityService/utility-service.service';
import { SCROLL_FX } from '../../Misc/scroll-fx.directive';
import { FlyIconComponent } from '../../Components/fly-icon/fly-icon.component';
import { HomeService, HomeContent, DEFAULT_HOME } from '../../Services/Home/home.service';
import { SeoService } from '../../Services/Seo/seo.service';
import { FlyDragScrollDirective } from '../../Misc/drag-scroll.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FlightSearchComponent, FlyairSkyComponent, FlyIconComponent, FlyDragScrollDirective, ...SCROLL_FX],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  cms: any[] = [];
  content: HomeContent = DEFAULT_HOME;
  /** Promotions with an uploaded image render as "Special offers" cards. */
  promoCards: any[] = [];
  @ViewChild('promoTrack') promoTrack?: ElementRef<HTMLDivElement>;

  /** The carousel kicks in (auto-advance) only when there are enough cards to
   *  overflow the row. Below this, a static grid is enough. */
  get isPromoCarousel(): boolean { return this.promoCards.length > 4; }

  private promoTimer: any = null;
  private promoAnimating = false;

  /** Animate scrollLeft to a target over ~520ms. setInterval (not the native
   *  smooth-scroll, which is disabled under reduce-motion) so it always runs;
   *  native touch-swipe still works because the track is a real scroll
   *  container. */
  private tweenScroll(el: HTMLElement, target: number): void {
    const start = el.scrollLeft;
    const dist = target - start;
    if (Math.abs(dist) < 1) return;
    const dur = 520, t0 = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    this.promoAnimating = true;
    const timer = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - t0) / dur);
      el.scrollLeft = start + dist * ease(t);
      if (t >= 1) { clearInterval(timer); this.promoAnimating = false; }
    }, 16);
  }

  /** Advance one card. Loops to the start when it reaches the end (and to the
   *  end when stepping back from the start). */
  advancePromo(dir: 1 | -1 = 1): void {
    const el = this.promoTrack?.nativeElement;
    if (!el || this.promoAnimating) return;
    const card = el.querySelector('.fly-promo') as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap || '18') || 18;
    const step = card ? card.getBoundingClientRect().width + gap : 300;
    const maxLeft = el.scrollWidth - el.clientWidth;
    let target = el.scrollLeft + step * dir;
    if (dir === 1 && el.scrollLeft >= maxLeft - 4) target = 0;            // wrap to start
    else if (dir === -1 && el.scrollLeft <= 4) target = maxLeft;          // wrap to end
    this.tweenScroll(el, Math.max(0, Math.min(maxLeft, target)));
  }

  /** Manual nav arrows — advance + restart the 5s countdown so a manual nudge
   *  isn't immediately overridden by the auto-tick. */
  scrollPromos(dir: 1 | -1): void {
    this.advancePromo(dir);
    this.restartPromoAuto();
  }

  private restartPromoAuto(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopPromoAuto();
    if (!this.isPromoCarousel) return;
    this.promoTimer = window.setInterval(() => this.advancePromo(1), 5000);
  }
  private stopPromoAuto(): void {
    if (this.promoTimer) { clearInterval(this.promoTimer); this.promoTimer = null; }
  }
  /** Pause while the pointer is over the row (or touching it), resume after. */
  pausePromoAuto(): void { this.stopPromoAuto(); }
  resumePromoAuto(): void { this.restartPromoAuto(); }
  /** Fallback defaults if the admin hasn't set content.searchDefaults yet. */
  private readonly DEFAULT_SEARCH = { advanceDays: 7, travellers: 1 };
  /** Live, admin-configurable defaults — reads `content.searchDefaults` set in
   *  the Front Page editor; falls back to DEFAULT_SEARCH if the field is
   *  missing or contains a bad value. */
  get searchDefaults() {
    const sd: any = (this.content as any)?.searchDefaults || {};
    const advanceDays = Number.isFinite(+sd.advanceDays) && +sd.advanceDays > 0 ? +sd.advanceDays : this.DEFAULT_SEARCH.advanceDays;
    const travellers  = Number.isFinite(+sd.travellers)  && +sd.travellers  > 0 ? +sd.travellers  : this.DEFAULT_SEARCH.travellers;
    return { advanceDays, travellers };
  }

  // partner marquees (duplicated for a seamless loop). logo:'' falls back to the styled name.
  airlines = [
    { name: 'SriLankan',          logo: 'assets/partners/srilankan.svg' },
    { name: 'Emirates',           logo: 'assets/partners/emirates.svg' },
    { name: 'Qatar Airways',      logo: 'assets/partners/qatar.svg' },
    { name: 'Malaysia Airlines',  logo: 'assets/partners/malaysia.svg' },
    { name: 'FitsAir',            logo: 'assets/Fitsair_logo.png' },
    { name: 'Thai Airways',       logo: 'assets/partners/thai.svg' },
    { name: 'Singapore Airlines', logo: 'assets/partners/singapore.svg' },
    { name: 'Cathay Pacific',     logo: 'assets/partners/cathay.svg' },
  ];
  pays = [
    { name: 'mastercard',      logo: 'assets/partners/mastercard.svg' },
    { name: 'VISA',            logo: 'assets/partners/visa.svg' },
    { name: 'AMEX',            logo: 'assets/partners/amex.svg' },
    { name: 'Commercial Bank', logo: 'assets/partners/commercial-bank.svg' },
    { name: 'Sampath Bank',    logo: 'assets/partners/sampath.png' },
    { name: 'Nations Trust',   logo: 'assets/partners/nationstrust.png' },
    { name: 'Q+ Pay',          logo: '' },
    { name: 'LankaQR',         logo: 'assets/partners/lankaqr.png' },
  ];
  get airlinesLoop() { return [...this.airlines, ...this.airlines]; }
  get paysLoop() { return [...this.pays, ...this.pays]; }

  constructor(
    private authService: AuthService,
    private adminService: UtilityServiceService,
    private home: HomeService,
    private router: Router,
    private seo: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // SEO + social card + JSON-LD. Runs on server AND browser so the
    // prerendered HTML carries correct tags for crawlers + share scrapers.
    this.applyHomeSeo();

    // Editable home content (runs on server + browser; falls back to DEFAULT_HOME on error).
    this.home.get().subscribe({
      next: (c) => { if (c && (c as any).hero) this.content = { ...DEFAULT_HOME, ...(c as HomeContent) }; },
      error: () => { /* keep DEFAULT_HOME */ },
    });

    if (!isPlatformBrowser(this.platformId)) return;
    this.authService.requestAccessToken().subscribe({ next: () => {}, error: (err) => console.error('Error fetching access token:', err) });
    this.adminService.fetchCMS().subscribe({ next: (data) => (this.cms = data), error: (err) => console.error('Error fetching CMS:', err) });
    // Load Special Offers — only promotions that carry a marketing image
    // make it onto the home page. Promotions without an image stay backend-
    // only and silently apply in the pricing engine.
    this.adminService.fetchPromotions().subscribe({
      next: (data: any[]) => {
        // Render only complete cards: image + slug. Promotions without a
        // slug have no detail page to link to, so they'd render a broken
        // "no longer available" card if we let them through.
        this.promoCards = (data || []).filter(p => !!p.image_Url && !!p.slug);
        // Once cards exist + the view has painted, kick off the auto-advance.
        setTimeout(() => this.restartPromoAuto(), 350);
      },
      error: () => { /* silently degrade — section just won't render */ },
    });
  }

  ngOnDestroy(): void { this.stopPromoAuto(); }

  /** Home page SEO: title/description/OG/Twitter/canonical + Organization,
   *  WebSite (with site search action) JSON-LD for rich results. */
  private applyHomeSeo(): void {
    this.seo.apply({
      title: 'FlyAir — Fly your way | Compare & book flights',
      description: 'Compare and book flights across hundreds of airlines with transparent pricing, free 24-hour cancellation and round-the-clock support. Fly your way with FlyAir.',
      keywords: 'flight booking, cheap flights, compare airlines, airline tickets, FlyAir',
      url: '/',
      image: 'assets/og-default.jpg',
      imageAlt: 'FlyAir — compare and book flights across hundreds of airlines',
      type: 'website',
    });
    const base = this.seo.absolute('/');
    this.seo.setJsonLd('ld-organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'FlyAir',
      url: base,
      logo: this.seo.absolute('assets/flyair-logo.png'),
      sameAs: [] as string[],
    });
    this.seo.setJsonLd('ld-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'FlyAir',
      url: base,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${base}?dest={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    });
  }

  /** Build a customer-facing badge for the offer card (e.g. "10% off" / "Save $50"). */
  promoBadge(p: any): string {
    if (!p) return '';
    if (p.promotion_Type === 'Percentage') return `${p.amount}% off`;
    if (p.promotion_Type === 'Fixed')      return `Save $${p.amount}`;
    return '';
  }

  /** Extract a short airport-code-or-empty from a CMS string like
   *  "Chennai Intl Arpt, Chennai, India - MAA" → "MAA". */
  private toCode(v?: string | null): string {
    if (!v) return '';
    const m = v.match(/-\s*([A-Z0-9]{2,4})\s*$/);
    return m ? m[1] : v.trim();
  }

  /** YYYY-MM-DD that is `advanceDays` ahead of today. */
  private futureDate(advanceDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + advanceDays);
    return d.toISOString().slice(0, 10);
  }

  /** Destination for the featured-block CTA — an explicit code/city if the CMS
   *  provides one, else the title before a comma ("Tokyo, reimagined" → "Tokyo").
   *  Feeds openSearchFor so "Explore" prefills the search instead of opening a
   *  blank results page. */
  get featuredCity(): string {
    const f: any = this.content?.featured || {};
    return (f.destinationCode || f.city || (f.title || '').split(',')[0] || '').toString().trim();
  }

  /** Click handler for Destination cards, Promotion cards AND the featured block.
   *  Navigates to home with prefill query params; the flight-search component
   *  reads them and populates the form so the user can review before searching. */
  openSearchFor(target: { origin?: string | null, destination?: string | null, airline?: string | null, advanceDays?: number, travellers?: number }): void {
    const params: any = {
      origin: this.toCode(target.origin) || undefined,
      dest:   this.toCode(target.destination) || undefined,
      date:   this.futureDate(target.advanceDays ?? this.searchDefaults.advanceDays),
      pax:    target.travellers ?? this.searchDefaults.travellers,
    };
    if (target.airline) params.airline = this.toCode(target.airline);
    this.router.navigate(['/'], { queryParams: params });
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const search = document.querySelector('app-flight-search') as HTMLElement | null;
        if (search) window.scrollTo({ top: search.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
      }, 60);
    }
  }

  /** Smooth-scroll from the hero down to the first content section. */
  scrollDown(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const hero = document.querySelector('.fly-hero');
    const next = hero?.nextElementSibling as HTMLElement | null;
    if (next) {
      const y = next.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  }

  fillClass(color?: string): string {
    return color === 'red' ? 'fly-fill-red' : color === 'green' ? 'fly-fill-green' : 'fly-fill-blue';
  }
  badgeClass(color?: string): string {
    return color === 'red' ? 'fly-badge-red' : color === 'green' ? 'fly-badge-green' : 'fly-badge-blue';
  }

  // ----- Customer reviews -----
  /** Reviews block (falls back to baked defaults if the CMS payload omits it). */
  get reviews(): any { return (this.content as any)?.reviews || (DEFAULT_HOME as any).reviews; }
  /** Average star rating across the shown reviews, e.g. "4.7". */
  get reviewAvg(): string {
    const items = this.reviews?.items || [];
    if (!items.length) return '0';
    return (items.reduce((s: number, r: any) => s + (+r.rating || 0), 0) / items.length).toFixed(1);
  }
  /** Five booleans — true = a filled star (rounded to the nearest whole). */
  reviewStars(rating: number): boolean[] { return [1, 2, 3, 4, 5].map(n => n <= Math.round(rating || 0)); }
  /** Up to two initials for the avatar disc. */
  reviewInitials(name: string): string {
    return (name || '').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
  /** Cycle avatar tints so adjacent cards differ. */
  reviewTone(i: number): string { return ['blue', 'red', 'green', 'navy'][i % 4]; }

  // ----- CMS package inquiry -> WhatsApp (preserved) -----
  showCmsInquiryDialog = false;
  selectedCmsContent: any = null;
  inquiryName = '';
  inquiryContact = '';

  openCmsInquiry(content: any) {
    this.selectedCmsContent = content;
    this.inquiryName = '';
    this.inquiryContact = '';
    this.showCmsInquiryDialog = true;
  }

  sendCmsInquiryToWhatsApp() {
    const phone = '94788788788';
    const message =
      `New Package Inquiry*\n\n` +
      `Name:* ${this.inquiryName}\n` +
      `Contact:* ${this.inquiryContact}\n\n` +
      `*Package Details*\n` +
      `Package: ${this.selectedCmsContent.title}\n` +
      `Description: ${this.selectedCmsContent.description}\n` +
      `Price: ${this.selectedCmsContent.price}\n\n` +
      `Sent via booking portal`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    this.showCmsInquiryDialog = false;
  }
}
