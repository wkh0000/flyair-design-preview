import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { NewsService, ArticleCard, NewsCategory, PagedArticles } from '../../Services/News/news.service';
import { SeoService } from '../../Services/Seo/seo.service';
import { environment } from '../../../environments/environment';
import { PageFooterWidgetsComponent } from '../../Components/page-footer-widgets/page-footer-widgets.component';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PageFooterWidgetsComponent],
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
})
export class NewsListComponent implements OnInit, OnDestroy {
  categories: NewsCategory[] = [];
  featured: ArticleCard | null = null;
  articles: ArticleCard[] = [];
  page = 1;
  totalPages = 1;
  total = 0;
  pageSize = 9;
  loading = true;
  activeCategory: string | null = null;
  activeCategoryObj: NewsCategory | null = null;
  activeTag: string | null = null;
  newsletterDone = false;

  private subs = new Subscription();

  constructor(
    private news: NewsService,
    private route: ActivatedRoute,
    private seo: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.news.categories().subscribe({
      next: (c) => (this.categories = c || []),
      error: () => (this.categories = []),
    });

    this.subs.add(
      combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([pm, qm]) => {
        this.activeCategory = pm.get('slug');
        this.activeTag = qm.get('tag');
        this.page = 1;
        this.load();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.seo.clearJsonLd('news-collection-jsonld');
    this.seo.clearJsonLd('news-breadcrumb-jsonld');
  }

  private load(): void {
    this.loading = true;

    // Featured lead only on the main index, page 1 (not when filtering by category or tag).
    if (!this.activeCategory && !this.activeTag && this.page === 1) {
      this.news.list({ featured: true, pageSize: 1 }).subscribe({
        next: (r) => (this.featured = r.items?.[0] || null),
        error: () => (this.featured = null),
      });
    } else {
      this.featured = null;
    }

    this.news.list({ category: this.activeCategory || undefined, tag: this.activeTag || undefined, page: this.page, pageSize: this.pageSize }).subscribe({
      next: (r: PagedArticles) => {
        // Avoid duplicating the featured story in the grid on the index.
        this.articles = (this.featured && this.page === 1)
          ? (r.items || []).filter((a) => a.id !== this.featured!.id)
          : (r.items || []);
        this.total = r.total;
        this.totalPages = r.totalPages || 1;
        this.loading = false;
        this.applySeo();
      },
      error: () => {
        this.articles = [];
        this.loading = false;
        this.applySeo();
      },
    });

    this.activeCategoryObj = this.activeCategory
      ? this.categories.find((c) => c.slug === this.activeCategory) || null
      : null;
  }

  private applySeo(): void {
    const cat = this.categories.find((c) => c.slug === this.activeCategory) || this.activeCategoryObj;
    const isCat = !!this.activeCategory;
    const isTag = !isCat && !!this.activeTag;
    const title = isCat
      ? `${cat?.name || 'Category'} News`
      : isTag
        ? `${this.activeTag} — Aviation News`
        : 'FlyAir Newsroom — Aviation News, Airlines, Airports & Aircraft';
    const description = isCat
      ? (cat?.blurb || `Latest ${cat?.name} aviation news, analysis and updates from the FlyAir Newsroom.`)
      : isTag
        ? `Aviation news tagged "${this.activeTag}" from the FlyAir Newsroom.`
        : 'In-depth aviation news from the FlyAir Newsroom: airlines, airports, aircraft and fleet, safety, routes, sustainability and travel technology — updated regularly.';
    const url = isCat ? `news/category/${this.activeCategory}` : isTag ? `news?tag=${encodeURIComponent(this.activeTag!)}` : 'news';

    this.seo.apply({
      title,
      description,
      keywords: isCat
        ? `${cat?.name}, aviation news, ${cat?.name} news, FlyAir`
        : 'aviation news, airline news, airport news, aircraft news, flight news, aviation industry, FlyAir Newsroom',
      url,
      type: 'website',
      image: this.featured?.heroImageUrl || 'assets/flyair-logo.png',
    });

    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: this.seo.absolute(url),
      isPartOf: { '@type': 'WebSite', name: 'FlyAir Newsroom', url: this.seo.absolute('news') },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [this.featured, ...this.articles].filter(Boolean).slice(0, 12).map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: this.seo.absolute(`news/${a!.slug}`),
          name: a!.title,
        })),
      },
    };
    this.seo.setJsonLd('news-collection-jsonld', itemList);

    const crumbs: any[] = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: this.seo.absolute('') },
      { '@type': 'ListItem', position: 2, name: 'Newsroom', item: this.seo.absolute('news') },
    ];
    if (isCat) crumbs.push({ '@type': 'ListItem', position: 3, name: cat?.name || 'Category', item: this.seo.absolute(url) });
    this.seo.setJsonLd('news-breadcrumb-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs,
    });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  pageList(): number[] {
    const out: number[] = [];
    const max = Math.min(this.totalPages, 7);
    let start = Math.max(1, this.page - 3);
    let end = Math.min(this.totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }

  tagList(csv?: string | null): string[] {
    return (csv || '').split(',').map((t) => t.trim()).filter(Boolean);
  }

  /** Total published articles across all categories (independent of current filter). */
  get grandTotal(): number {
    const sum = this.categories.reduce((s, c) => s + (c.count || 0), 0);
    return sum || this.total;
  }

  submitNewsletter(ev: Event): void {
    ev.preventDefault();
    this.newsletterDone = true;
  }

  trackById(_i: number, a: ArticleCard): number { return a.id; }
}
