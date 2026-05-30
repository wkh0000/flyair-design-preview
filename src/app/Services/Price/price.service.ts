import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FlightRequest {
  identifier: any;
  id: any;
  pid: any
}


@Injectable({
  providedIn: 'root',
})
export class PriceService {
  private apiUrl = environment.apiUrl; // Assuming the base URL is stored in the environment file

  constructor(private http: HttpClient) {}

  get(key: string): any | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null; // Parse JSON or return null if not found
  }

  AirPrice(data: any): Observable<any> {
    const token = this.get('accessToken'); // Replace with the actual token
    // Define headers
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.token}`,
    });

    const url = `${environment.apiUrl}AirPrice/air-price`;
    console.log("AirPrice payload:", data);

    return this.http.post(url, data, { headers });
  }
}
