import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

interface OneWayFlightRequest {
  onewaydeparture: string;
  onewaydestination: string;
  onewaydepartureDate: string;
  onewayflexibility: number;
  onewaydirectFlights: boolean;
  passengers: {
    adult: number;
    child: number;
    infant: number;
  };
  selectedClass: string;
}

interface ReturnFlightRequest {
  returndeparture: string;
  returndestination: string;
  returndepartureDate: string;
  returnreturnDate: string;
  returnflexibility: number;
  returndirectFlights: boolean;
  passengers: {
    adult: number;
    child: number;
    infant: number;
  };
  selectedClass: string;
}

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  private apiUrl = environment.apiUrl; // Assuming the base URL is stored in the environment file
  private flightDataSubject = new BehaviorSubject<{ results: any; formattedData: any } | null>(null);
  flightData$ = this.flightDataSubject.asObservable(); // Expose as observable for components

  constructor(private http: HttpClient) {}

  get(key: string): any | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null; // Parse JSON or return null if not found
  }

  // Method to book a one-way flight
  bookOneWayFlight(request: OneWayFlightRequest): Observable<any> {
    const token = this.get('accessToken'); // Replace with the actual token
    // Define headers
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.token}`,
    });

    const url = `${this.apiUrl}FlightSearch/one-way`;
    return this.http.post(url, request, { headers });
  }

  // Method to book a return flight
  bookReturnFlight(request: ReturnFlightRequest): Observable<any> {
    const token = this.get('accessToken'); // Replace with the actual token

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.token}`,
    });

    const url = `${this.apiUrl}FlightSearch/return`; // API endpoint for return flight booking
    return this.http.post(url, request, { headers });
  }

  setFlightData(data: { results: any; formattedData: any }) {
    this.flightDataSubject.next(data); // Update the BehaviorSubject
  }

  getFlightData() {
    return this.flightDataSubject.value; // Get the current value if needed
  }

  getAirportByIATA(iataCode: string): Observable<any> {
    return this.http.get<{ [key: string]: any }>('https://raw.githubusercontent.com/mwgg/Airports/master/airports.json').pipe(
      map(data => data[iataCode.toUpperCase()] || null),
      catchError(error => {
        console.error('Error fetching airport data:', error);
        return throwError(() => new Error('Failed to fetch airport data'));
      })
    );
  }

}
