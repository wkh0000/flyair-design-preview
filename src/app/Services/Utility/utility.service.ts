import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  private airportEndpoint = `${environment.apiUrl}Airport`;

  constructor(private http: HttpClient) {}

  fetchAirports(): Observable<any> {
    return this.http.get<any>(this.airportEndpoint, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }
}
