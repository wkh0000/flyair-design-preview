import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl; // Assuming the base URL is stored in the environment file

  constructor(private http: HttpClient) {}

  get(key: string): any | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null; // Parse JSON or return null if not found
  }

  Commit(workbenchId: any): Observable<any> {
    const token = this.get('accessToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.token}`,
      reservationIdDevKit: workbenchId
    });

    const url = `${this.apiUrl}AddTraveller/commit`;
    return this.http.post(url, null, { headers});
  }

}
