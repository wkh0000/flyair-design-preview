import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private static readonly ADMIN_FLAG_KEY = 'adminLoggedIn';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Save a key-value pair to local storage.
   * @param key Key to store.
   * @param value Value to store.
   */
  private set(key: string, value: any): void {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
  }

  /**
   * Retrieve a value from local storage.
   * @param key Key to retrieve.
   * @returns Parsed value from local storage.
   */
  private get(key: string): any {
    if (isPlatformBrowser(this.platformId)) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  }

  /**
   * Request access token from the API.
   * @returns Observable with the access token response.
   */
  public requestAccessToken(): Observable<any> {

    const apiUrl = `${environment.apiUrl}Auth/authorize`;
    const requestPayload = { pcc: environment.agency_pcc };

    return this.http.post<any>(apiUrl, requestPayload).pipe(
      tap((response) => {
        if (!response) return;
        const fetchTime = new Date().getTime();
        const expirationTime = fetchTime + response.expires_in * 1000;

        // Store token if needed (you may skip this if cookies are used fully)
        this.set('accessToken', {
          token: response.access_token,
          fetchTime,
          expirationTime,
        });
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Retrieve the token, requesting a new one if expired.
   * @returns Observable with the access token.
   */
  getAuthToken(): Observable<string> {
    const tokenData = this.get('accessToken'); // Retrieve token data from local storage.

    if (tokenData) {
      const currentTime = new Date().getTime(); // Current time in milliseconds.
      const expirationTime = tokenData.expirationTime; // Use stored expiration time.

      // Check if the token is still valid.
      if (currentTime < expirationTime) {
        return of(tokenData.token); // Return the valid token.
      }
    }

    // If no token exists or it has expired, fetch a new one.
    return this.requestAccessToken().pipe(
      tap(() => console.log('Fetched a new token'))
    );
  }

  login() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(AuthService.ADMIN_FLAG_KEY, '1');
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AuthService.ADMIN_FLAG_KEY);
      localStorage.removeItem('accessToken');
    }
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    return localStorage.getItem(AuthService.ADMIN_FLAG_KEY) === '1';
  }
}
