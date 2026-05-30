import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  createdAt: string;
  isRead: boolean;
  source?: string | null;
}

export interface ContactInquiryPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source?: string;
}

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private base = `${environment.apiUrl}Contact`;

  constructor(private http: HttpClient) {}

  /** Public: submit a contact-form message. */
  submit(body: ContactInquiryPayload): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.base, body);
  }

  /** Admin: paginated list (newest first). */
  list(unreadOnly = false, take = 200): Observable<{ rows: ContactInquiry[]; totalUnread: number }> {
    const q = new URLSearchParams();
    if (unreadOnly) q.set('unreadOnly', 'true');
    q.set('take', String(take));
    return this.http.get<{ rows: ContactInquiry[]; totalUnread: number }>(`${this.base}/admin?${q.toString()}`);
  }

  /** Admin: mark read/unread. */
  setRead(id: number, read: boolean): Observable<any> {
    return this.http.patch(`${this.base}/admin/${id}/read?read=${read}`, {});
  }

  /** Admin: permanently delete. */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.base}/admin/${id}`);
  }
}
