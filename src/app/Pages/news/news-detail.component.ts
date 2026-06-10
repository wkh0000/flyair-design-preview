import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NewsService, ArticleFull, ArticleCard } from '../../Services/News/news.service';
import { SeoService } from '../../Services/Seo/seo.service';
import { ShareBarComponent } from '../../Components/share-bar/share-bar.component';
import { PageFooterWidgetsComponent } from '../../Components/page-footer-widgets/page-footer-widgets.component';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ShareBarComponent, PageFooterWidgetsComponent],
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss'],
})
export class NewsDetailComponent implements OnInit, OnDestroy {
  article: ArticleFull | null = null;
  related: ArticleCard[] = [];
  loading = true;
  notFound = false;
  shareUrl = '';

  /** First tag on the article (used to filter related promotions + news in
   *  the shared footer widget). Empty when the article has no tags. */
  get primaryTag(): string | null {
    const tags = this.article?.tags;
    if (!tags) return null;
    const first = (tags.split(',')[0] || '').trim();
    return first || null;
  }

  private subs = new Subscription();

  constructor(
    private news: NewsService,
    private route: ActivatedRoute,
    private seo: SeoService,
    private location: Location,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  /** Go back to the previous page, or to the Newsroom if there's no history. */
  goBack(): void {
    if (isPlatformBrowser(this.platformId) && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/news']);
    }
  }

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap.subscribe((pm) => {
        const slug = pm.get('slug');
        if (slug) this.fetch(slug);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.seo.clearJsonLd('news-article-jsonld');
    this.seo.clearJsonLd('news-article-breadcrumb');
  }

  private fetch(slug: string): void {
    this.loading = true;
    this.notFound = false;
    this.related = [];
    this.news.getBySlug(slug).subscribe({
      next: (a) => {
        this.article = a;
        this.loading = false;
        this.shareUrl = this.seo.absolute(`news/${a.slug}`);
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
        this.applySeo(a);
        this.news.related(a.id, 3).subscribe({
          next: (r) => (this.related = r || []),
          error: () => (this.related = []),
        });
      },
      error: () => {
        this.article = null;
        this.notFound = true;
        this.loading = false;
        this.seo.apply({
          title: 'Article not found',
          description: 'The article you are looking for could not be found.',
          url: `news/${slug}`,
        });
      },
    });
  }

  private applySeo(a: ArticleFull): void {
    const url = `news/${a.slug}`;
    const image = a.ogImageUrl || a.heroImageUrl || 'assets/og-default.jpg';
    const keywords = a.metaKeywords || a.tags || undefined;

    this.seo.apply({
      title: a.metaTitle || a.title,
      description: a.metaDescription || a.dek || '',
      keywords: keywords || undefined,
      url: a.canonicalUrl || url,
      image,
      imageAlt: a.heroImageAlt || a.title,
      type: 'article',
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt || a.publishedAt,
      author: a.authorName,
      section: a.category?.name || a.categoryName || undefined,
      tags: this.tagList(a.tags),
    });

    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: (a.title || '').slice(0, 110),
      description: a.metaDescription || a.dek || '',
      image: [this.seo.absolute(a.heroImageUrl || image)],
      datePublished: a.publishedAt,
      dateModified: a.updatedAt || a.publishedAt,
      author: { '@type': 'Organization', name: a.authorName || 'FlyAir Newsroom', url: this.seo.absolute('news') },
      publisher: {
        '@type': 'Organization',
        name: 'FlyAir',
        logo: { '@type': 'ImageObject', url: this.seo.absolute('assets/flyair-logo.png') },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': this.seo.absolute(url) },
      articleSection: a.category?.name || a.categoryName || undefined,
      keywords: keywords || undefined,
      url: this.seo.absolute(url),
    };
    this.seo.setJsonLd('news-article-jsonld', articleLd);

    this.seo.setJsonLd('news-article-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: this.seo.absolute('') },
        { '@type': 'ListItem', position: 2, name: 'Newsroom', item: this.seo.absolute('news') },
        ...(a.category ? [{ '@type': 'ListItem', position: 3, name: a.category.name, item: this.seo.absolute(`news/category/${a.category.slug}`) }] : []),
        { '@type': 'ListItem', position: a.category ? 4 : 3, name: a.title, item: this.seo.absolute(url) },
      ],
    });
  }

  tagList(csv?: string | null): string[] {
    return (csv || '').split(',').map((t) => t.trim()).filter(Boolean);
  }

  initials(name?: string): string {
    if (!name) return 'FA';
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  }

  trackById(_i: number, a: ArticleCard): number { return a.id; }
}
