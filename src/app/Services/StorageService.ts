import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    // Check if we are running in the browser (not on the server)
    if (isPlatformBrowser(this.platformId)) {
      this.storage = window.sessionStorage;
    }
  }

  // Save the access token
  setAccessToken(token: string): void {
    if (this.storage) {
      this.storage.setItem('access_token', token);
    } else {
      console.error('SessionStorage is not available.');
    }
  }

  // Retrieve the access token
  getAccessToken(): string | null {
    return this.storage ? this.storage.getItem('access_token') : null;
  }
}
