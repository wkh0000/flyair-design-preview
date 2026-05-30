import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type SupportStatus = 'new' | 'in-progress' | 'resolved' | 'closed';

export interface SupportRequest {
  id: number;
  category: string;
  bookingId: string;
  name: string;
  email: string;
  phone?: string | null;
  details: string;
  createdAt: string;
  status: SupportStatus;
  assignedTo?: string | null;
  internalNotes?: string | null;
  source?: string | null;
}

export interface SupportCounts {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface SupportRequestPayload {
  category: string;
  bookingId: string;
  name: string;
  email: string;
  phone?: string | null;
  details: string;
  source?: string;
}

export interface SupportUpdate {
  status?: SupportStatus;
  assignedTo?: string | null;
  internalNotes?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SupportService {
  private base = `${environment.apiUrl}Support`;

  constructor(private http: HttpClient) {}

  /** Public: file a new request from the /support flow. */
  submit(body: SupportRequestPayload): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.base, body);
  }

  /** Admin: list with optional status / category filter. */
  list(opts: { status?: string; category?: string; take?: number } = {}):
    Observable<{ rows: SupportRequest[]; counts: SupportCounts }> {
    const q = new URLSearchParams();
    if (opts.status)   q.set('status', opts.status);
    if (opts.category) q.set('category', opts.category);
    q.set('take', String(opts.take ?? 200));
    return this.http.get<{ rows: SupportRequest[]; counts: SupportCounts }>(
      `${this.base}/admin?${q.toString()}`,
    );
  }

  /** Admin: update status / assignment / internal notes. */
  update(id: number, body: SupportUpdate): Observable<any> {
    return this.http.patch(`${this.base}/admin/${id}`, body);
  }

  /** Admin: permanently delete a request. */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.base}/admin/${id}`);
  }
}
