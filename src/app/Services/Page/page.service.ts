import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Loads/saves admin overrides for static/info pages (contact, about, faq, legal…). */
@Injectable({ providedIn: 'root' })
export class PageService {
  private base = `${environment.apiUrl}Pages`;

  constructor(private http: HttpClient) {}

  /** Public: the saved override for a page key (empty object {} if none). */
  get(key: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${encodeURIComponent(key)}`);
  }

  /** Admin: save the override content for a page. */
  save(key: string, content: any): Observable<any> {
    return this.http.put(`${this.base}/admin/${encodeURIComponent(key)}`, { contentJson: JSON.stringify(content) });
  }

  /** Admin: which pages currently have an override. */
  listOverrides(): Observable<{ pageKey: string; updatedAt: string }[]> {
    return this.http.get<{ pageKey: string; updatedAt: string }[]>(`${this.base}/admin`);
  }

  /** Admin: remove an override (page reverts to its built-in default). */
  reset(key: string): Observable<any> {
    return this.http.delete(`${this.base}/admin/${encodeURIComponent(key)}`);
  }
}
