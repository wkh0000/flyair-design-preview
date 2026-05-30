import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Lightweight article shape returned in listings (no full body). */
export interface ArticleCard {
  id: number;
  title: string;
  slug: string;
  dek?: string | null;
  heroImageUrl?: string | null;
  heroImageAlt?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  categoryAccent?: string | null;
  tags?: string | null;
  authorName: string;
  featured: boolean;
  publishedAt: string;
  readingMinutes: number;
}

/** Full article shape (detail page + admin edit). */
export interface ArticleFull extends ArticleCard {
  body: string;
  heroImageCredit?: string | null;
  categoryId: number;
  category?: { id: number; name: string; slug: string; accent?: string | null } | null;
  authorTitle?: string | null;
  status: string;
  updatedAt?: string | null;
  createdAt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
}

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  blurb?: string | null;
  accent?: string | null;
  sortOrder: number;
  count?: number;
}

export interface PagedArticles {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: ArticleCard[];
}

export interface ArticleUpsert {
  title: string;
  slug?: string;
  dek?: string;
  body: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  heroImageCredit?: string;
  categoryId: number;
  tags?: string;
  authorName?: string;
  authorTitle?: string;
  status?: string;
  featured: boolean;
  publishedAt?: string;
  readingMinutes: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private base = `${environment.apiUrl}News`;

  constructor(private http: HttpClient) {}

  // ---------------- Public ----------------
  list(opts: {
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    pageSize?: number;
  } = {}): Observable<PagedArticles> {
    let params = new HttpParams();
    if (opts.category) params = params.set('category', opts.category);
    if (opts.tag) params = params.set('tag', opts.tag);
    if (opts.search) params = params.set('search', opts.search);
    if (opts.featured !== undefined) params = params.set('featured', String(opts.featured));
    if (opts.page) params = params.set('page', String(opts.page));
    if (opts.pageSize) params = params.set('pageSize', String(opts.pageSize));
    return this.http.get<PagedArticles>(this.base, { params });
  }

  getBySlug(slug: string): Observable<ArticleFull> {
    return this.http.get<ArticleFull>(`${this.base}/${encodeURIComponent(slug)}`);
  }

  getByCategory(slug: string, page = 1, pageSize = 9): Observable<{ category: NewsCategory; list: PagedArticles }> {
    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.http.get<{ category: NewsCategory; list: PagedArticles }>(
      `${this.base}/category/${encodeURIComponent(slug)}`, { params });
  }

  related(id: number, take = 3): Observable<ArticleCard[]> {
    const params = new HttpParams().set('take', String(take));
    return this.http.get<ArticleCard[]>(`${this.base}/related/${id}`, { params });
  }

  categories(): Observable<NewsCategory[]> {
    return this.http.get<NewsCategory[]>(`${this.base}/categories`);
  }

  sitemap(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/sitemap`);
  }

  // ---------------- Admin ----------------
  adminListArticles(opts: { status?: string; category?: string; search?: string } = {}): Observable<any[]> {
    let params = new HttpParams();
    if (opts.status) params = params.set('status', opts.status);
    if (opts.category) params = params.set('category', opts.category);
    if (opts.search) params = params.set('search', opts.search);
    return this.http.get<any[]>(`${this.base}/admin/articles`, { params });
  }

  adminGetArticle(id: number): Observable<ArticleFull> {
    return this.http.get<ArticleFull>(`${this.base}/admin/articles/${id}`);
  }

  createArticle(data: ArticleUpsert): Observable<any> {
    return this.http.post(`${this.base}/admin/articles`, data);
  }

  updateArticle(id: number, data: ArticleUpsert): Observable<any> {
    return this.http.put(`${this.base}/admin/articles/${id}`, data);
  }

  deleteArticle(id: number): Observable<any> {
    return this.http.delete(`${this.base}/admin/articles/${id}`);
  }

  /** Upload a hero/inline image (base64 data URI). Returns { url } absolute URL. */
  uploadImage(base64Image: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.base}/admin/upload`, { base64Image });
  }

  adminListCategories(): Observable<NewsCategory[]> {
    return this.http.get<NewsCategory[]>(`${this.base}/admin/categories`);
  }

  createCategory(data: Partial<NewsCategory>): Observable<any> {
    return this.http.post(`${this.base}/admin/categories`, data);
  }

  updateCategory(id: number, data: Partial<NewsCategory>): Observable<any> {
    return this.http.put(`${this.base}/admin/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.base}/admin/categories/${id}`);
  }
}
