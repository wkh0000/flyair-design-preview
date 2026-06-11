import { Component, Input, OnInit, OnChanges, SimpleChanges, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NewsService } from '../../Services/News/news.service';
import { UtilityServiceService } from '../../Services/Admin-Services/UtilityService/utility-service.service';
import { FlyDragScrollDirective } from '../../Misc/drag-scroll.directive';

/**
 * Reusable "page footer widgets" block.
 *
 * Rendered at the bottom of every long-form page (promotion detail, legal
 * shell pages, news list, news detail). Composes three universally-relevant
 * surfaces:
 *
 *   1. Promotion cards — only promotions with an uploaded image. Filters by
 *      destinationCode when provided (so a Dubai article doesn't surface a
 *      Bangkok promo). Skips a specific promotion ID (used by the promotion
 *      detail page so the current promo doesn't list itself). Renders as a
 *      grid when ≤ 4 items, a snap-scrolling carousel when > 4.
 *   2. Recent / related news — most recent published articles. Filters by
 *      destinationCode or tag when provided.
 *   3. Partner marquees — same airlines + payments rows as the home page.
 *
 * The component is fully self-contained: it owns its data fetching, its own
 * partner arrays, and its own scroll-snap logic. Drop it anywhere.
 */
@Component({
  selector: 'app-page-footer-widgets',
  standalone: true,
  imports: [CommonModule, RouterModule, FlyDragScrollDirective],
  templateUrl: './page-footer-widgets.component.html',
  styleUrl: './page-footer-widgets.component.scss',
})
export class PageFooterWidgetsComponent implements OnInit, OnChanges, AfterViewInit {
  /** When set, both promotions and news are filtered to ones touching this code. */
  @Input() destinationCode?: string | null = null;
  /** Skip this promotion id (used on the promo detail page). */
  @Input() excludePromoId?: number | null = null;
  /** When set, news is filtered to articles tagged with this string. */
  @Input() newsTag?: string | null = null;
  /** Max promotion cards to render. Sensible default. */
  @Input() promoLimit = 8;
  /** Max news cards to fetch. Higher than the visible row so the related-news
   *  carousel has cards to scroll through. */
  @Input() newsLimit = 12;
  /** Toggle whole sections off when a host page already owns them. */
  @Input() showPromos = true;
  @Input() showNews = true;
  @Input() showPartners = true;

  promotions: any[] = [];
  news: any[] = [];

  // Partner data — duplicated from home for visual consistency. Kept here so
  // the widget needs nothing from the parent page.
  readonly airlines = [
    { name: 'SriLankan',          logo: 'assets/partners/srilankan.svg' },
    { name: 'Emirates',           logo: 'assets/partners/emirates.svg' },
    { name: 'Qatar Airways',      logo: 'assets/partners/qatar.svg' },
    { name: 'Malaysia Airlines',  logo: 'assets/partners/malaysia.svg' },
    { name: 'FitsAir',            logo: 'assets/Fitsair_logo.png' },
    { name: 'Thai Airways',       logo: 'assets/partners/thai.svg' },
    { name: 'Singapore Airlines', logo: 'assets/partners/singapore.svg' },
    { name: 'Cathay Pacific',     logo: 'assets/partners/cathay.svg' },
  ];
  readonly pays = [
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

  @ViewChild('promoTrack') promoTrack?: ElementRef<HTMLDivElement>;
  @ViewChild('newsTrack') newsTrack?: ElementRef<HTMLDivElement>;

  constructor(
    private http: HttpClient,
    private newsSvc: NewsService,
    private adminSvc: UtilityServiceService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void { this.fetchPromos(); this.fetchNews(); }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['destinationCode'] || changes['excludePromoId']) this.fetchPromos();
    if (changes['destinationCode'] || changes['newsTag'])        this.fetchNews();
  }
  ngAfterViewInit(): void { /* hook for future scroll/snap polish */ }

  private fetchPromos(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.adminSvc.fetchPromotions().subscribe({
      next: (data: any[]) => {
        const dest = (this.destinationCode || '').trim().toUpperCase();
        this.promotions = (data || [])
          // Same filter as home: image + slug both required. Without a slug
          // the card would link to /promotions/null and show the
          // "no longer available" page.
          .filter(p => !!p.image_Url && !!p.slug)
          .filter(p => !this.excludePromoId || p.id !== this.excludePromoId)
          .filter(p => {
            if (!dest) return true;
            const target = (p.applies_To_Destination || '').toUpperCase();
            return !target || target.includes(dest);
          })
          .slice(0, this.promoLimit);
      },
      error: () => { this.promotions = []; },
    });
  }

  private fetchNews(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const tag = (this.newsTag || this.destinationCode || '').trim();
    const opts: any = { page: 1, pageSize: this.newsLimit };
    if (tag) opts.tag = tag;
    this.newsSvc.list(opts).subscribe({
      next: (r: any) => {
        const items = (r && r.items) ? r.items : (Array.isArray(r) ? r : []);
        // Cap client-side too: the static demo snapshot ignores pageSize and
        // returns the full list, which would make an over-long carousel.
        this.news = items.slice(0, this.newsLimit);
      },
      error: () => { this.news = []; },
    });
  }

  /** Compute the badge text shown on the corner of each promo card. */
  promoBadge(p: any): string {
    if (!p) return '';
    if (p.promotion_Type === 'Percentage') return `${p.amount}% off`;
    if (p.promotion_Type === 'Fixed')      return `Save $${p.amount}`;
    return '';
  }

  /** True when we have enough promos to render as a snap-carousel. */
  get isPromoCarousel(): boolean { return this.promotions.length > 4; }
  /** Same threshold for the related-news row. */
  get isNewsCarousel(): boolean { return this.news.length > 4; }

  /** Programmatic horizontal scroll for the promotions carousel. */
  scrollPromos(dir: 1 | -1): void { this.scrollTrack(this.promoTrack, dir); }
  /** Programmatic horizontal scroll for the related-news carousel. */
  scrollNews(dir: 1 | -1): void { this.scrollTrack(this.newsTrack, dir); }

  /** Shared snap-scroll helper for both carousels. */
  private scrollTrack(ref: ElementRef<HTMLDivElement> | undefined, dir: 1 | -1): void {
    const el = ref?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: 'smooth' });
  }
}
