import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorkbenchService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get(key: string): any | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  StartSession(data: any): Observable<any> {
    const token = this.get('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.token}`,
    });

    const url = `${this.apiUrl}Workbench/initialize`;
    return this.http.post(url, data, { headers });
  }

  StartPNRSession(data: any): Observable<any> {
    const token = this.get('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.token}`,
      PNRDevKit: data
    });

    const url = `${this.apiUrl}IssueTicket/start-session`;
    return this.http.post(url, null, { headers });
  }


  MakePayment(data: any): Observable<any> {
    const token = this.get('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.token}`,
    });

    const url = `${this.apiUrl}IssueTicket/make-payment`;
    return this.http.post(url, data, { headers });
  }

}
