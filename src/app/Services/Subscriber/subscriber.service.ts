import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subscriber {
  id: number;
  email: string;
  subscribedAt: string;
  unsubscribedAt?: string | null;
  isActive: boolean;
  source?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SubscriberService {
  private base = `${environment.apiUrl}Subscribers`;

  constructor(private http: HttpClient) {}

  /** Public: subscribe an email (idempotent — resubscribing reactivates). */
  subscribe(email: string, source = 'footer'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.base, { email, source });
  }

  /** Admin: list subscribers. */
  list(includeInactive = false): Observable<{ rows: Subscriber[]; totalActive: number }> {
    return this.http.get<{ rows: Subscriber[]; totalActive: number }>(`${this.base}/admin?includeInactive=${includeInactive}`);
  }

  /** Admin: soft-delete (mark inactive) or hard-delete with ?hard=true. */
  remove(id: number, hard = false): Observable<any> {
    return this.http.delete(`${this.base}/admin/${id}?hard=${hard}`);
  }

  /** Admin: URL to download the CSV (open in a new tab). */
  csvUrl(): string {
    return `${this.base}/admin/export.csv`;
  }
}
