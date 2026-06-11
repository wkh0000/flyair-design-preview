import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PageFooterWidgetsComponent } from '../../Components/page-footer-widgets/page-footer-widgets.component';
import { SeoService } from '../../Services/Seo/seo.service';

/**
 * Promotion detail page — public, shareable. Drives the Facebook share preview
 * via Open Graph tags so a posted link renders with image + title + subtitle.
 *
 * The visual chrome (subhero → hero image → body section) mirrors the legal-
 * shell pages on purpose so the whole site reads as one consistent feature.
 */
@Component({
  selector: 'app-promo-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PageFooterWidgetsComponent],
  templateUrl: './promo-detail.component.html',
  styleUrl: './promo-detail.component.scss',
})
export class PromoDetailComponent implements OnInit {
  promo: any | null = null;
  loading = true;
  notFound = false;
  /** Sanitised rich body for [innerHTML] — comes from the admin Detail Content. */
  bodyHtml: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private seo: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const slug = pm.get('slug');
      if (!slug) { this.notFound = true; this.loading = false; return; }
      this.load(slug);
    });
  }

  private load(slug: string): void {
    this.loading = true;
    this.http.get<any>(`/api/AdminUtility/promotions/by-slug/${encodeURIComponent(slug)}`).subscribe({
      next: p => {
        this.promo = p;
        this.bodyHtml = p.detail_Content
          ? this.sanitizer.bypassSecurityTrustHtml(p.detail_Content)
          : null;
        this.loading = false;
        this.applySeo();
      },
      error: () => { this.notFound = true; this.loading = false; },
    });
  }

  private applySeo(): void {
    if (!this.promo) return;
    const title = this.promo.title || this.promo.promotion_Name || 'Special offer';
    const description = this.promo.subtitle || this.discountLine() || 'Limited-time offer on FlyAir.';
    this.seo.apply({
      title: title,
      description: description,
      image: this.promo.image_Url || 'assets/og-default.jpg',
      imageAlt: title,
      url: `/promotions/${this.promo.slug}`,
      type: 'article',
    });
  }

  /** Marketing badge text ("8% off" / "Save $50"). */
  discountLine(): string {
    if (!this.promo) return '';
    if (this.promo.promotion_Type === 'Percentage') return `${this.promo.amount}% off`;
    if (this.promo.promotion_Type === 'Fixed')      return `Save $${this.promo.amount}`;
    return '';
  }

  /** Strip a trailing " - IATA" code from a scope string ("…, Dubai - DXB" → "…, Dubai"). */
  private cleanScope(v?: string | null): string {
    return (v || '').replace(/\s*-\s*[A-Z0-9]{2,4}\s*$/, '').trim();
  }

  /** Real fare conditions built from the promo data — shown when the offer has
   *  no rich detail content (replaces the old "coming soon" placeholder). */
  get conditionsText(): string {
    const p = this.promo;
    if (!p) return '';
    const disc = this.discountLine();
    let head: string;
    if (disc && p.applies_To_Airline)      head = `${disc} on ${this.cleanScope(p.applies_To_Airline)} flights.`;
    else if (disc && p.applies_To_Destination) head = `${disc} on flights to ${this.cleanScope(p.applies_To_Destination)}.`;
    else if (disc)                          head = `${disc} on eligible fares.`;
    else                                    head = 'A limited-time fare offer.';
    return `${head} Subject to seat availability and fare conditions at the time of booking; taxes and surcharges may apply. Use the search above for live fares.`;
  }

  /** YYYY-MM-DD that is N days from today, CLAMPED to the promo's effective
   *  range when one is set. Ensures the prefilled search lands on a date the
   *  customer can actually book under this promotion. */
  private futureDateClamped(advanceDays: number): string {
    const today = new Date();
    const target = new Date(today.getTime());
    target.setDate(target.getDate() + advanceDays);
    const ef = this.promo?.effective_From ? new Date(this.promo.effective_From) : null;
    const et = this.promo?.effective_To   ? new Date(this.promo.effective_To)   : null;
    let final = target;
    if (ef && final < ef) final = new Date(ef.getTime());
    if (et && final > et) final = new Date(et.getTime());
    return final.toISOString().slice(0, 10);
  }

  /** "Find flights" CTA — navigates to home with the prefilled search params. */
  findFlights(): void {
    if (!this.promo) return;
    const dest = (this.promo.applies_To_Destination || '').match(/-\s*([A-Z0-9]{2,4})\s*$/);
    const airline = (this.promo.applies_To_Airline || '').match(/-\s*([A-Z0-9]{2,4})\s*$/);
    const params: any = {
      dest: dest ? dest[1] : (this.promo.applies_To_Destination || '').trim() || undefined,
      date: this.futureDateClamped(7),
      pax: 1,
    };
    if (airline) params.airline = airline[1];
    else if (this.promo.applies_To_Airline) params.airline = (this.promo.applies_To_Airline as string).trim();
    this.router.navigate(['/'], { queryParams: params });
  }

  /** Hero image source: prefer the wide detail banner the admin uploaded;
   *  fall back to the card image. Drops to null when neither is set so the
   *  template can hide the figure entirely. */
  get heroImage(): string | null {
    return (this.promo?.detail_Image_Url || this.promo?.image_Url) || null;
  }

  /** Short IATA-or-fallback for the footer widget — drives which other
   *  promotions and which news show under "Related". */
  get destinationCode(): string | null {
    const v = this.promo?.applies_To_Destination;
    if (!v) return null;
    const m = (v as string).match(/-\s*([A-Z0-9]{2,4})\s*$/);
    return m ? m[1] : v.trim();
  }
}
