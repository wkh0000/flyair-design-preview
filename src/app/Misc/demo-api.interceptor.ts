import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
  HttpResponse, HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * DemoApiInterceptor — only active when environment.demoMode is true (the
 * static GitHub Pages preview build).
 *
 * The frontend constructs URLs using `${environment.apiUrl}` + the endpoint
 * name. In the demo env apiUrl is empty, so the resulting URLs look like
 *   `Pages/terms`  /  `News?…`  /  `HomeContent`
 * and resolve relative to the current page URL — which is broken on Pages.
 *
 * This interceptor rewrites those (regardless of any host or page prefix) to
 * static JSON snapshots under /assets/static-api/. It also:
 *   • Rewrites the local `../../../assets/DATA/*.json` fetches (airports etc.)
 *     to absolute URLs anchored at the GitHub Pages base href, so they
 *     resolve from any deep-linked route.
 *   • Suppresses every non-GET write with a 0-status error so demo form
 *     handlers fall through their existing error branches.
 *   • Suppresses legacy/admin endpoints that aren't snapshotted by returning
 *     an empty 200 — keeps the devtools console clean.
 */
@Injectable()
export class DemoApiInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!(environment as any).demoMode) return next.handle(req);

    const u = req.url.split('?')[0];
    const path = this.normalize(u);                                 // e.g. "Pages/terms"

    // ------- Legacy/admin endpoints we don't snapshot: silence them (GET *and* POST) -------
    // Done BEFORE the method check so admin/auth writes don't bubble up as
    // demo-mode errors. The frontend simply gets an empty success.
    if (/^(Auth|CMS|AdminUtility|admin)(\/|$)/i.test(path)) {
      return of(new HttpResponse({ status: 200, body: {} as any }));
    }

    // ------- Non-GET writes (contact, subscribe, support, etc.): silent failure -------
    if (req.method !== 'GET') {
      return throwError(() => new HttpErrorResponse({
        status: 0, statusText: 'demo-mode (write suppressed)', url: req.url,
      }));
    }

    // ------- Snapshotted endpoints -------
    const target = this.rewriteApi(path);
    if (target === '__empty_array__') return of(new HttpResponse({ status: 200, body: [] as any }));
    if (target === '__empty_object__') return of(new HttpResponse({ status: 200, body: {} as any }));
    if (target) {
      const abs = this.absUrl(target);
      // Pages/* that aren't snapshotted: fall through to empty object so
      // the frontend uses its baked-in defaults instead of showing 404 noise.
      if (target.includes('/Pages/')) {
        return next.handle(req.clone({ url: abs })).pipe(
          catchError(() => of(new HttpResponse({ status: 200, body: {} as any })))
        );
      }
      return next.handle(req.clone({ url: abs }));
    }

    // ------- Static-data JSON fetched with ../../../ paths -------
    // Rewrite to base-anchored URL so it works from any deep-linked route.
    const dataMatch = u.match(/(?:^|\/)assets\/DATA\/[\w.-]+$/i);
    if (dataMatch) {
      const abs = this.absUrl('assets/DATA/' + dataMatch[0].split('/').pop());
      return next.handle(req.clone({ url: abs }));
    }

    return next.handle(req);
  }

  /** Strip any URL prefix and reduce to a clean endpoint path (no leading slash). */
  private normalize(u: string): string {
    // Remove protocol+host if any
    const noHost = u.replace(/^https?:\/\/[^/]+/i, '');
    // Remove leading slashes and any "/api/" segment
    return noHost.replace(/^\/+/, '').replace(/^api\//i, '')
      // Remove a GitHub Pages base href prefix like "flyair-design-preview/"
      .replace(/^[\w-]+\//i, (m) => m === 'api/' ? '' : m);
  }

  /** Convert a normalized endpoint path to the static-asset target, or null. */
  private rewriteApi(rest: string): string | null {
    // Strip any leading repo-name (eg "flyair-design-preview/Pages/...") before matching
    const cleaned = rest.replace(/^flyair-design-preview\//i, '');
    const parts = cleaned.split('/');

    if (/^Home$/i.test(parts[0]) && !parts[1]) return 'assets/static-api/Home.json';
    if (/^HomeContent$/i.test(parts[0])) return 'assets/static-api/Home.json';

    if (/^Pages$/i.test(parts[0]) && parts[1]) {
      return `assets/static-api/Pages/${parts[1]}.json`;
    }

    if (/^News$/i.test(parts[0])) {
      if (!parts[1]) return 'assets/static-api/News/list.json';
      if (/^categories$/i.test(parts[1])) return 'assets/static-api/News/categories.json';
      if (/^sitemap$/i.test(parts[1])) return 'assets/static-api/News/sitemap.json';
      if (/^related$/i.test(parts[1])) return '__empty_array__';
      if (/^category$/i.test(parts[1])) return 'assets/static-api/News/list.json';
      return `assets/static-api/News/${parts[1]}.json`;
    }

    return null;
  }

  /** Resolve a relative asset path against document.baseURI (the GitHub Pages base href). */
  private absUrl(rel: string): string {
    if (!isPlatformBrowser(this.platformId) || typeof document === 'undefined') return rel;
    try {
      return new URL(rel, document.baseURI).toString();
    } catch {
      return rel;
    }
  }
}
