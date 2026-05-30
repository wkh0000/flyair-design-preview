import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
  HttpResponse, HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * DemoApiInterceptor — only active when environment.demoMode is true (the
 * static GitHub Pages preview build).
 *
 *   • Maps GET /api/Pages/{key}        → /assets/static-api/Pages/{key}.json
 *   • Maps GET /api/News               → /assets/static-api/News/list.json
 *   • Maps GET /api/News/{slug}        → /assets/static-api/News/{slug}.json
 *   • Maps GET /api/News/categories    → /assets/static-api/News/categories.json
 *   • Maps GET /api/News/sitemap       → /assets/static-api/News/sitemap.json
 *   • Maps GET /api/News/related/{id}  → empty array (related is not pre-baked)
 *   • Maps GET /api/HomeContent        → /assets/static-api/HomeContent.json
 *   • Suppresses every non-GET request with a fake 0 status so the form
 *     handlers in the demo do not surface a network error.
 *
 * The interceptor is a no-op when demoMode is off, so the same codebase still
 * talks to the real backend on localhost during development.
 */
@Injectable()
export class DemoApiInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!(environment as any).demoMode) return next.handle(req);

    // Suppress non-GET writes silently. The form components already know how
    // to fall back to defaults / show success cosmetics from the snapshot.
    if (req.method !== 'GET') {
      return throwError(() => new HttpErrorResponse({
        status: 0, statusText: 'demo-mode (write suppressed)', url: req.url,
      }));
    }

    const target = this.rewrite(req.url);
    if (!target) return next.handle(req);

    // Special case: News/related/{id} — we never snapshotted relateds. Return
    // an empty array so the detail page renders without a console error.
    if (target === '__empty_array__') {
      return of(new HttpResponse({ status: 200, body: [] as any }));
    }

    return next.handle(req.clone({ url: target }));
  }

  /** Convert an API request URL into a static-asset URL, or return null. */
  private rewrite(url: string): string | null {
    // Strip query string for matching, but preserve nothing — the list call
    // pagination is collapsed into one snapshot.
    const u = url.split('?')[0];

    // Match anywhere after /api/ for flexibility (apiUrl may be '/api/' or absolute).
    const m = u.match(/\/api\/(.+)$/i) || u.match(/^\/?(api\/)?(HomeContent|Pages|News).*$/i);
    if (!m) return null;
    const rest = u.match(/\/api\/(.+)$/i)?.[1] ?? u.replace(/^\/?(api\/)?/i, '');
    if (!rest) return null;

    const parts = rest.split('/');

    if (parts[0] === 'HomeContent') return 'assets/static-api/HomeContent.json';

    if (parts[0] === 'Pages' && parts[1]) {
      return `assets/static-api/Pages/${parts[1]}.json`;
    }

    if (parts[0] === 'News') {
      if (!parts[1]) return 'assets/static-api/News/list.json';
      if (parts[1] === 'categories') return 'assets/static-api/News/categories.json';
      if (parts[1] === 'sitemap') return 'assets/static-api/News/sitemap.json';
      if (parts[1] === 'related') return '__empty_array__';
      if (parts[1] === 'category' && parts[2]) {
        // Fall back to the full list — category filter is not pre-baked
        return 'assets/static-api/News/list.json';
      }
      // Anything else: treat as slug
      return `assets/static-api/News/${parts[1]}.json`;
    }

    return null;
  }
}
