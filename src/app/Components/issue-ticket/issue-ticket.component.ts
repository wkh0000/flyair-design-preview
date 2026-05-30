import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-issue-ticket',
  standalone: true,
  imports: [HttpClientModule,MatTabsModule,MatDividerModule,CommonModule,MatButtonModule],
  templateUrl: './issue-ticket.component.html',
  styleUrl: './issue-ticket.component.scss'
})
export class IssueTicketComponent implements OnInit{
  @Input() results: any;
  ResponseData: any[] = []; // Ensure it is always an array
  aircraftData: { aircraft_code: string; model: string; variant: string; make: string }[] = [];
  options: { name: string; code: string }[] = [];

  constructor(private http: HttpClient,private router: Router){}

  ngOnInit(): void {
    this.ResponseData = this.results;
    this.http.get<{ aircraft_code: string; model: string; variant: string; make: string }[]>(
      '../../../assets/DATA/aircraft.json'
      ).subscribe(
        (data) => {
          this.aircraftData = data;
          // You can perform additional operations if needed once data is loaded
        },
        (error) => {
          console.error('Error loading aircraft data:', error);
          // Optionally, you can provide a fallback if data cannot be loaded
          this.aircraftData = []; // Or some default data
        }
      );

      this.http
      .get<{ name: string; code: string }[]>(
        '../../../assets/DATA/airports.json'
      )
      .subscribe((data) => {
        this.options = data;
      });
  }

  getAircraftInfo(code: string): string {
    const aircraft = this.aircraftData.find((a: any) => a.aircraft_code === code);
    if (aircraft) {
      return `${aircraft.make} ${aircraft.variant}`;
    } else {
      return code; // In case of no match
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

  getAirportInfo(code: string): string {
    const aircraft = this.options.find((a: any) => a.code === code);
    if (aircraft) {
      return `${aircraft.name} - ${aircraft.code}`;
    } else {
      return code; // In case of no match
    }
  }

getAirlineLogoUrl(iataCode: string): string {
    if (iataCode === '8D') {
      return '../../../assets/Fitsair_logo.png';
    } else {
      const baseUrl = 'https://images.daisycon.io/airline/';
      const width = 400;
      const height = 250;
      const color = 'ffffff';

      return `${baseUrl}?width=${width}&height=${height}&color=${color}&iata=${iataCode}`;
    }
  }

  getFormattedDuration(duration: string): string {
    if (!duration) return '';
    return duration
      .replace('PT', '')
      .replace('H', ' Hours ')
      .replace('M', ' Minutes');
  }

}
