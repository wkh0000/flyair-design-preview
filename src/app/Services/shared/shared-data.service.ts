import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private passengerData: any = null;
  private storageKey = 'passengerData';

  // Setter to store data
  setPassengerData(data: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Getter to retrieve data

  getPassengerData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {
      adult: 1,
      child: 0,
      infant: 0,
      student: 0
    };
  }

  // Clear stored data (optional)
  clearPassengerData(): void {
    localStorage.removeItem(this.storageKey);
  }
}


