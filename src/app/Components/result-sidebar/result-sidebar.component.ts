import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { FilterService } from '../../Services/Filter/filter.service';
import { FlightService } from '../../Services/Flight/flight.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-result-sidebar',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    MatTabsModule,
    MatSliderModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './result-sidebar.component.html',
  styleUrl: './result-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultSidebarComponent implements OnInit {
  @Input() carriers: any[] = [];
  @Input() stops: number[] = [];
  @Input() departureTimes: string[] = [];
  selectedFilters: any = { airlines: [], layoverCounts: [], layoverDestinations: [] };
  airportData: any = null;
  iataCode: string = '';
  private airports: any[] = [];
  private processedLogos: Set<string> = new Set();
  isAirLoading: boolean = true;
  isLayLoading: boolean = true;


  filters: any = {
    airline: '',
    durationRange: [0, 300],
    destination: '',
    departure: ''
  };

  filterOptions: any = { airlines: [], destinations: [], departures: [], durationRange: [0, 300] };
  constructor(private filterService: FilterService, private FlightService:FlightService,private http: HttpClient) {
    this.loadAirports();
  }

  ngOnInit() {
    this.filterService.filters$.subscribe(options => {
      this.filterOptions = options;
      this.filters.durationRange = options.durationRange;
      this.isAirLoading = false;
      this.isLayLoading = false;
    });
  }

  applyFilter() {
    this.filterService.updateFilters(this.filters);
  }

  private loadAirports() {
    this.http.get<any[]>('../../../assets/DATA/airports.json').subscribe(data => {
      this.airports = data;
    });
  }

  extractIataCode(airline: string): string {
    return airline.split(" ")[0].split("(")[0].trim();
  }

  fetchCityAndCountry(iataCode: string): string {
    const airport = this.airports.find(a => a.code === iataCode.toUpperCase());
    if (!airport) return iataCode;

    const match = airport.name.match(/^(?:[^,]+),\s*([^,]+)(?:,\s*(.+))?/);
    if (match) {
        const city = match[1].trim();
        const country = match[2] ? match[2].trim() : ''; // Handle cases with no third part
        return country ? `${city}, ${country}` : city; // Return formatted string
    }
    else{
      return 'Loading...';
    }
}



  // getAirlineLogoUrl(iataCode: string, operatingCarrier: string): string {
  //   if (operatingCarrier === 'FITS AVIATION  PVT  LTD' || iataCode === '8D') {
  //     // Ensure the loader stops once the specific logo URL is determined
  //     this.isAirLoading = false;
  //     return '../../../assets/Fitsair_logo.png';
  //   } else if (iataCode === 'XY') {
  //     this.isAirLoading = false;
  //     return '../../../assets/flynaas.png';
  //   } else {
  //     const baseUrl = 'https://images.daisycon.io/airline/';
  //     const width = 400;
  //     const height = 250;
  //     const color = 'ffffff';
  //     this.isAirLoading = false;  // Hide loader after data is loaded
  //     return `${baseUrl}?width=${width}&height=${height}&color=${color}&iata=${iataCode}`;
  //   }
  //   this.isAirLoading = false;  // Hide loader after data is loaded
  // }

  getAirlineLogoUrl(iataCode: string, operatingCarrier: string): string {
    this.isAirLoading = false;

    const airlineNameToIata: { [key: string]: string } = {
      'fits aviation pvt ltd': '8D',
      'flynas': 'XY',
      'singapore airlines': 'SQ',
      'qatar airways': 'QR',
      'emirates': 'EK',
      'etihad airways': 'EY',
      'air india': 'AI',
      'turkish airlines': 'TK',
      'american airlines': 'AA',
      'delta air lines': 'DL',
      'british airways': 'BA',
      'lufthansa': 'LH',
      'thai airways': 'TG',
      // Add more as needed
    };

    const normalizedCarrier = operatingCarrier?.toLowerCase().trim() || '';

    // Try to find exact or partial match
    let matchedIata = '';
    for (const airlineName in airlineNameToIata) {
      if (
        normalizedCarrier === airlineName ||
        normalizedCarrier.includes(airlineName) ||
        airlineName.includes(normalizedCarrier)
      ) {
        matchedIata = airlineNameToIata[airlineName];
        break;
      }
    }

    const code = iataCode || matchedIata;

    // Hardcoded exceptions
    if (code === '8D') {
      return '../../../assets/Fitsair_logo.png';
    } else if (code === 'XY') {
      return '../../../assets/flynaas.png';
    }

    if (code && code.length <= 3) {
      return `https://images.daisycon.io/airline/?width=400&height=250&color=ffffff&iata=${code}`;
    }

    return '../../../assets/default-logo.png';
  }




  onFilterChange(filterName: string, value: any, event: MatCheckboxChange) {
    const checked = event.checked; // Use event.checked directly

    if (checked) {
      this.selectedFilters[filterName].push(value);
    } else {
      this.selectedFilters[filterName] = this.selectedFilters[filterName].filter(
        (item: any) => item !== value
      );
    }

    // Update the filters in the service
    this.filterService.updateFilters(this.selectedFilters);
  }


}
