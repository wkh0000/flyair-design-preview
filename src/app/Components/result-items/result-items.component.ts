import { MatButtonModule } from '@angular/material/button';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { BaggageConditionsDialogComponent } from '../baggage-conditions-dialog/baggage-conditions-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PriceService } from '../../Services/Price/price.service';
import { Route, Router } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { FilterService } from '../../Services/Filter/filter.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UtilityServiceService } from '../../Services/Admin-Services/UtilityService/utility-service.service';

interface FlightDetail {
  carrier: string;
  number: string;
  id: string;
  Departure: {
    location: string;
    date: string;
    time: string;
  };
  Arrival: {
    location: string;
    date: string;
    time: string;
  };
  AvailabilitySourceCode: string;
}

interface FlightProduct {
  classOfService: string;
  cabin: string;
  segmentSequence: number[];
  fareBasisCode: string;
  fareType: string;
  fareTypeCode: string;
}

interface PassengerFlight {
  passengerQuantity: number;
  passengerTypeCode: string;
  FlightProduct: FlightProduct[];
}

interface ProductAir {
  totalDuration: string;
  id: string;
  Quantity: number;
  FlightSegment: {
    sequence: number;
  }[];
  PassengerFlight: PassengerFlight[];
}

@Component({
  selector: 'app-result-items',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    MatButtonModule,
    MatDividerModule,
    CommonModule,
    MatExpansionModule,
    MatTabsModule,
    LoaderComponent,
  ],
  templateUrl: './result-items.component.html',
  styleUrl: './result-items.component.scss',
})
export class ResultItemsComponent implements OnChanges {
  [x: string]: any;
  @Input() sequence: number | undefined;
  @Input() flight: any;
  @Input() filteredData: any[] = [];
  @Input() Identity: any;
  @ViewChild('tariffPanel') tariffPanel!: MatExpansionPanel;
  @Output() flightSelected = new EventEmitter<{ id: any; productId: any }>();
  @Input() selectedCode: string = '';
  allPanelsExpanded = false;
  panelState: boolean[][] = [];
  farebreakdownState: boolean[][] = [];
  tariffPanelState: boolean[][] = [];
  activeTabs: number[][] = [];
  flightOptions: any;
  originalFlightOptions: any;
  i: number | undefined;
  id: string = '';
  Departure: undefined;
  Arrival: undefined;
  Brand: any;
  activeProductDetail: any;
  passengerCount: number = 0;
  loading: boolean = false;
  profitType: string = 'Rate';
  Percentage: number = 1.1;
  Rate: number = 1000;
  @Input() carriers: string[] = [];
  @Output() filtersChanged = new EventEmitter<any>();
  private filterSubscription: Subscription | undefined;
  aircraftData: {
    aircraft_code: string;
    model: string;
    variant: string;
    make: string;
  }[] = [];
  options: { name: string; code: string }[] = [];
  combinationCodeHistory: string[] = [];
  markups: any[] = [];
  promotions: any[] = [];
  limitations: any[] = [];
  constructor(
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private airprice: PriceService,
    private router: Router,
    private ngZone: NgZone,
    private filterService: FilterService,
    private http: HttpClient,
    private utilityService: UtilityServiceService
  ) { }

  ngOnInit(): void {
    this.flightOptions = this.flight;
    this.panelState = new Array(this.flightOptions.length).fill(false);
    this.farebreakdownState = new Array(this.flightOptions.length).fill(false);
    this.tariffPanelState = new Array(this.flightOptions.length).fill(false);
    this.originalFlightOptions = [...this.flightOptions];

    this.activeTabs = (this.flightOptions ?? []).map((offering: any) =>
      (offering.productBrandOptions ?? []).map(() => 0)
    );

    this.filterSubscription = this.filterService.selectedFilters$.subscribe(
      (filters: any) => {
        this.applyFilters(filters);
      }
    );
    this.http
      .get<
        {
          aircraft_code: string;
          model: string;
          variant: string;
          make: string;
        }[]
      >('../../../assets/DATA/aircraft.json')
      .subscribe(
        (data) => {
          this.aircraftData = data;
        },
        (error) => {
          console.error('Error loading aircraft data:', error);
          this.aircraftData = [];
        }
      );
    this.http
      .get<{ name: string; code: string }[]>(
        '../../../assets/DATA/airports.json'
      )
      .subscribe((data) => {
        this.options = data;
      });
    this.cdr.detectChanges();
    this.loadMarkups();
    this.loadPromotions();
    this.loadLimitations();
  }
  
loadLimitations(): void {
  this.utilityService.fetchLimits().subscribe({
    next: (data) => {
      this.limitations = data;
      console.log('Limitations loaded:', this.limitations);
    },
    error: (err) => console.error('Failed to load limitations', err)
  });
}
  loadMarkups(): void {
    this.utilityService.fetchMarkups().subscribe({
      next: (data) => {
        this.markups = data;
        console.log("Fetched markups in ResultItemsComponent:", data);
      },
      error: (err) => console.error('Failed to load markups', err)
    });
  }
  loadPromotions(): void {
    this.utilityService.fetchPromotions().subscribe({
      next: (data) => {
        this.promotions = data;
        console.log("Fetched promotions in ResultItemsComponent:", data);
      },
      error: (err) => console.error('Failed to load promotions', err)
    });
  }
isFlightAllowed(
  airlineCode: string,
  destinationCode: string,
  flightDepartureDate?: string
): boolean {
  if (!this.limitations || this.limitations.length === 0) return true;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const checkDateStr = flightDepartureDate
    ? flightDepartureDate.slice(0, 10)
    : todayStr;

  // Find all limitations that match this flight
  const matchingLimitations = this.limitations.filter(limit => {

    const airlineMatch =
      !limit.applies_To_Airline ||
      limit.applies_To_Airline.trim() === airlineCode.trim() ||
      limit.applies_To_Airline.endsWith(`- ${airlineCode}`) ||
      limit.applies_To_Airline.includes(airlineCode);

    const destinationMatch =
      !limit.applies_To_Destination ||
      limit.applies_To_Destination.trim() === destinationCode.trim() ||
      limit.applies_To_Destination.endsWith(`- ${destinationCode}`) ||
      limit.applies_To_Destination.includes(destinationCode);

    // Date range check
    let dateMatch = true;
    if (limit.effective_From || limit.effective_To) {
      const fromStr = limit.effective_From
        ? limit.effective_From.slice(0, 10)
        : null;
      const toStr = limit.effective_To
        ? limit.effective_To.slice(0, 10)
        : null;
      dateMatch =
        (!fromStr || checkDateStr >= fromStr) &&
        (!toStr || checkDateStr <= toStr);
    }

    return airlineMatch && destinationMatch && dateMatch;
  });

  // No limitations match this flight — allow it
  if (matchingLimitations.length === 0) return true;

  // If ANY matching limitation is 'Restricted' — block the flight
  const hasRestriction = matchingLimitations.some(
    limit => limit.restriction_Type === 'Restricted'
  );
  if (hasRestriction) return false;

  // If limitations exist and all are 'Allowed' — allow it
  return true;
}
  private getApplicableRules(
    rules: any[],
    basePrice: number,
    airlineCode: string,
    destinationCode: string,
    flightDepartureDate?: string
  ): any[] {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const checkDateStr = flightDepartureDate
      ? flightDepartureDate.slice(0, 10)
      : todayStr;

    return rules.filter(rule => {
      const airlineMatch =
        !rule.applies_To_Airline ||
        rule.applies_To_Airline.trim() === airlineCode.trim() ||
        rule.applies_To_Airline.endsWith(`- ${airlineCode}`) ||
        rule.applies_To_Airline.includes(airlineCode);

      const destinationMatch =
        !rule.applies_To_Destination ||
        rule.applies_To_Destination.trim() === destinationCode.trim() ||
        rule.applies_To_Destination.endsWith(`- ${destinationCode}`) ||
        rule.applies_To_Destination.includes(destinationCode);

      let dateMatch = true;
      if (rule.effective_From || rule.effective_To) {
        const fromStr = rule.effective_From
          ? rule.effective_From.slice(0, 10)
          : null;
        const toStr = rule.effective_To
          ? rule.effective_To.slice(0, 10)
          : null;
        dateMatch =
          (!fromStr || checkDateStr >= fromStr) &&
          (!toStr || checkDateStr <= toStr);
      }

      let priceMatch = true;
      if (rule.price_Range_From !== null || rule.price_Range_To !== null) {
        const priceFrom = rule.price_Range_From ?? 0;
        const priceTo = rule.price_Range_To ?? Infinity;
        priceMatch = basePrice >= priceFrom && basePrice <= priceTo;
      }

      return airlineMatch && destinationMatch && dateMatch && priceMatch;
    });
  }
  calculatePrice(
    basePrice: number,
    airlineCode: string,
    destinationCode: string,
    flightDepartureDate?: string
  ): number {
    if (!basePrice) return 0;
    let finalPrice = basePrice;

    // Step 1 — Apply promotions first (discounts)
    const applicablePromotions = this.getApplicableRules(
      this.promotions, basePrice, airlineCode, destinationCode, flightDepartureDate
    );

    applicablePromotions.forEach(promo => {
      if (promo.promotion_Type === 'Percentage') {
        console.log(`Applying ${promo.amount}% promotion: -${finalPrice * (promo.amount / 100)}`);
        finalPrice -= finalPrice * (promo.amount / 100);
      } else if (promo.promotion_Type === 'Fixed') {
        finalPrice -= promo.amount;
      }
      // Guard: price should never go below 0
      if (finalPrice < 0) finalPrice = 0;
    });

    // Step 2 — Apply markups on top (additions)
    const applicableMarkups = this.getApplicableRules(
      this.markups, basePrice, airlineCode, destinationCode, flightDepartureDate
    );

    applicableMarkups.forEach(markup => {
      if (markup.markup_Type === 'Percentage') {
        finalPrice += finalPrice * (markup.value / 100);
        console.log(`Applying ${markup.value}% markup: +${finalPrice * (markup.value / 100)}`);
      } else if (markup.markup_Type === 'Fixed') {
        finalPrice += markup.value;
      }
    });

    return finalPrice;
  }
  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  hasIntermediateStop(segment: any): boolean {
    return segment.intermediateStop && segment.intermediateStop.length > 0;
  }

  ngOnChanges(): void {
    if (!this.originalFlightOptions?.length) {
      console.warn('Original flight options are empty.');
      return;
    }

    if (this.sequence === 2 && this.selectedCode) {
      const filtered = this.originalFlightOptions.filter((offer: any) =>
        offer.productBrandOptions?.some((option: any) =>
          option.productBrandOffering?.some((offering: any) =>
            offering.combinabilityCode?.includes(this.selectedCode)
          )
        )
      );
      this.flightOptions = filtered.length > 0 ? filtered : this.originalFlightOptions;
    }
    this.cdr.detectChanges(); // or just rely on Angular default change detection
  }


  applyFilters(filters: any) {
    this.ngZone.run(() => {
      if (!this.originalFlightOptions?.length) {
        console.warn('Original flight options are empty.');
        return;
      }

      let updatedFlightOptions = JSON.parse(
        JSON.stringify(this.originalFlightOptions)
      );

      updatedFlightOptions = updatedFlightOptions
        .map((flight: any) => {
          if (flight.productBrandOptions) {
            flight.productBrandOptions = flight.productBrandOptions
              .map((option: any) => {
                if (option.flightRefsDetails) {
                  option.flightRefsDetails = option.flightRefsDetails.filter(
                    (detail: any) => {
                      return (
                        (filters.airlines.length === 0 ||
                          filters.airlines.includes(detail.carrier) ||
                          (detail.operatingCarrierName ===
                            'FITS AVIATION  PVT  LTD' &&
                            filters.airlines.includes('8D'))) &&
                        (filters.destinations.length === 0 ||
                          filters.destinations.includes(detail.destination)) &&
                        (filters.departures.length === 0 ||
                          filters.departures.includes(detail.departure)) &&
                        (filters.layoverDestinations.length === 0 ||
                          filters.layoverDestinations.includes(
                            detail.arrival.location
                          ))
                      );
                    }
                  );
                  const originalLayoverCount = option.flightRefsDetails
                    ? option.flightRefsDetails.length - 1
                    : 0;
                  const hasMatchingLayover =
                    filters.layoverCounts.length === 0 ||
                    filters.layoverCounts.includes(originalLayoverCount);
                  if (!hasMatchingLayover) {
                    return null;
                  }
                }
                return option;
              })
              .filter(
                (option: any) =>
                  option !== null && option.flightRefsDetails.length > 0
              ); // Filter out null and empty `flightRefsDetails`
          }

          return flight;
        })
        .filter((flight: any) => flight.productBrandOptions.length > 0);

      this.flightOptions = updatedFlightOptions;
      this.cdr.markForCheck();
      setTimeout(() => this.cdr.detectChanges(), 0);
    });
  }

  trackByFlight(index: number, offering: any): any {
    return offering.id || index;
  }

  closePanel(panel: MatExpansionPanel, event: MouseEvent): void {
    event.stopPropagation();
    panel.close();
  }

  getAircraftInfo(code: string): string {
    const aircraft = this.aircraftData.find(
      (a: any) => a.aircraft_code === code
    );
    if (aircraft) {
      return `${aircraft.make} ${aircraft.variant}`;
    } else {
      return code; // In case of no match
    }
  }

  getAirportInfo(code: string): string {
    const aircraft = this.options.find((a: any) => a.code === code);
    if (aircraft) {
      return `${aircraft.name} - ${aircraft.code}`;
    } else {
      return code; // In case of no match
    }
  }

  togglePanel(cardIndex: number, panelIndex: number): void {
    this.panelState[cardIndex] = this.panelState[cardIndex] || [];
    this.panelState[cardIndex][panelIndex] =
      !this.panelState[cardIndex][panelIndex];
  }

  openBaggageConditionsDialog(baggageDetails: any): void {
    const dialogRef = this.dialog.open(BaggageConditionsDialogComponent, {
      width: '90vw',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container',
      data: baggageDetails,
    });

    dialogRef.afterClosed().subscribe((result) => { });
  }

  setActiveTab(cardIndex: number, groupIndex: number, tabIndex: number): void {
    if (!this.activeTabs[cardIndex]) {
      this.activeTabs[cardIndex] = [];
    }
    this.activeTabs[cardIndex][groupIndex] = tabIndex;
    this.cdr.detectChanges(); // ✅ Trigger change detection
  }

  chooseflight(id: any, productId: any): void {
    this.flightSelected.emit({ id, productId });
  }

  getAirlineLogoUrl(iataCode: string, operatingCarrier: string): string {
    if (operatingCarrier === 'FITS AVIATION  PVT  LTD' || iataCode === '8D') {
      return '../../../assets/Fitsair_logo.png';
    } else if (iataCode === 'XY') {
      return '../../../assets/flynaas.png';
    } else {
      const baseUrl = 'https://images.daisycon.io/airline/';
      const width = 400;
      const height = 250;
      const color = 'ffffff';

      return `${baseUrl}?width=${width}&height=${height}&color=${color}&iata=${iataCode}`;
    }
  }

  extractData(productAir: ProductAir) {
    const flightProduct = {
      classOfService:
        productAir.PassengerFlight[0].FlightProduct[0].classOfService,
      cabin: productAir.PassengerFlight[0].FlightProduct[0].cabin,
      segmentSequence: productAir.FlightSegment[0].sequence,
    };

    const passengerCriteria = productAir.PassengerFlight.map((passenger) => ({
      '@type': 'PassengerCriteria',
      number: passenger.passengerQuantity,
      passengerTypeCode: passenger.passengerTypeCode,
    }));

    return { flightProduct, passengerCriteria };
  }

  extractPassengerCount(passengerFlights: any[]): number {
    if (!passengerFlights || !Array.isArray(passengerFlights)) {
      return 0;
    }

    return passengerFlights.reduce((total, flight) => {
      return total + (flight?.passengerQuantity || 0);
    }, 0);
  }

  getFormattedDuration(duration: string): string {
    if (!duration) return '';
    return duration
      .replace('PT', '')
      .replace('H', ' Hours ')
      .replace('M', ' Minutes');
  }

  activeTab = 'Flight-Info';

  openCity(cityName: string) {
    this.activeTab = cityName;
  }
}
