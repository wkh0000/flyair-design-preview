import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface SeoConfig {
  title: string;
  description?: string;
  keywords?: string;
  /** Path or absolute URL of the canonical page. */
  url?: string;
  /** Absolute or asset-relative image for social previews. */
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  /** Article-only metadata. */
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

/**
 * SSR-safe SEO service: drives <title>, meta description/keywords, Open Graph,
 * Twitter Cards, canonical <link>, and JSON-LD structured data.
 * Works on both the server (Angular SSR) and the browser so crawlers and
 * social-share scrapers receive fully-rendered tags.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteName = 'FlyAir Newsroom';
  private readonly siteUrl = (environment as any).siteUrl || 'http://localhost:4200';

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
  ) {}

  /**
   * The origin to build absolute OG/canonical URLs from. Prefers the LIVE serving
   * origin — in the browser this is window.location.origin; under Angular SSR the
   * DOCUMENT location reflects the incoming request's protocol+host — so social
   * previews automatically use whatever public domain serves the page once deployed,
   * with environment.siteUrl as the fallback (e.g. during prerender).
   */
  private base(): string {
    const origin = this.doc?.location?.origin;
    if (origin && /^https?:\/\//i.test(origin) && !/localhost|127\.0\.0\.1|about:|^null$/i.test(origin)) {
      return origin.replace(/\/+$/, '');
    }
    // In the browser, still trust a localhost origin (dev); on the server fall back to config.
    if (origin && /^https?:\/\//i.test(origin)) return origin.replace(/\/+$/, '');
    return this.siteUrl.replace(/\/+$/, '');
  }

  /** Resolve a path/relative image to an absolute URL for OG/canonical. */
  absolute(pathOrUrl?: string | null): string {
    const base = this.base();
    if (!pathOrUrl) return base;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const path = pathOrUrl.replace(/^\/+/, '');
    return `${base}/${path}`;
  }

  apply(cfg: SeoConfig): void {
    const url = this.absolute(cfg.url);
    const image = cfg.image ? this.absolute(cfg.image) : this.absolute('assets/flyair-logo.png');
    const type = cfg.type || 'website';
    const fullTitle = cfg.title.includes('FlyAir') ? cfg.title : `${cfg.title} | ${this.siteName}`;

    this.title.setTitle(fullTitle);

    this.upsert('description', cfg.description);
    this.upsert('keywords', cfg.keywords);

    // Open Graph
    this.upsertProp('og:title', cfg.title);
    this.upsertProp('og:description', cfg.description);
    this.upsertProp('og:type', type);
    this.upsertProp('og:url', url);
    this.upsertProp('og:image', image);
    this.upsertProp('og:image:alt', cfg.imageAlt || cfg.title);
    this.upsertProp('og:site_name', this.siteName);
    this.upsertProp('og:locale', 'en_US');

    // Twitter Card
    this.upsert('twitter:card', 'summary_large_image');
    this.upsert('twitter:title', cfg.title);
    this.upsert('twitter:description', cfg.description);
    this.upsert('twitter:image', image);
    this.upsert('twitter:image:alt', cfg.imageAlt || cfg.title);

    // Article-specific OG
    if (type === 'article') {
      this.upsertProp('article:published_time', cfg.publishedTime);
      this.upsertProp('article:modified_time', cfg.modifiedTime || cfg.publishedTime);
      this.upsertProp('article:author', cfg.author);
      this.upsertProp('article:section', cfg.section);
      // Clear any stale tag props, then add current ones.
      this.removeAll("meta[property='article:tag']");
      (cfg.tags || []).forEach(t => this.addProp('article:tag', t));
    } else {
      this.removeAll("meta[property^='article:']");
    }

    this.setCanonical(url);
  }

  /** Inject or replace a JSON-LD <script> block by id. */
  setJsonLd(id: string, schema: object): void {
    if (!this.doc?.head) return;
    let script = this.doc.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }

  clearJsonLd(id: string): void {
    const el = this.doc?.getElementById(id);
    if (el?.parentNode) el.parentNode.removeChild(el);
  }

  private setCanonical(url: string): void {
    if (!this.doc?.head) return;
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private upsert(name: string, content?: string | null): void {
    if (content) this.meta.updateTag({ name, content });
    else this.meta.removeTag(`name='${name}'`);
  }

  private upsertProp(property: string, content?: string | null): void {
    if (content) this.meta.updateTag({ property, content });
    else this.meta.removeTag(`property='${property}'`);
  }

  private addProp(property: string, content: string): void {
    this.meta.addTag({ property, content });
  }

  private removeAll(selector: string): void {
    this.doc?.head?.querySelectorAll(selector).forEach(el => el.parentNode?.removeChild(el));
  }
}
