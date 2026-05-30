import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { Route, Router } from '@angular/router';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { ResultItemsComponent } from '../result-items/result-items.component';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ResultSidebarComponent } from '../result-sidebar/result-sidebar.component';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { PriceService } from '../../Services/Price/price.service';
import { LoaderComponent } from '../loader/loader.component';
import { FilterService } from '../../Services/Filter/filter.service';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { OptionPanelComponent } from '../option-panel/option-panel.component';
@Component({
  selector: 'app-result-content',
  standalone: true,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    ResultItemsComponent,
    CommonModule,
    MatDividerModule,
    MatExpansionModule,
    ResultSidebarComponent,
    MatButtonModule,
    LoaderComponent,
    MatTabsModule,
    OptionPanelComponent
  ],
  templateUrl: './result-content.component.html',
  styleUrls: ['./result-content.component.scss'],
})
export class ResultContentComponent implements OnInit {
  @ViewChild('accordion') accordion!: MatAccordion;
  @ViewChild('tariffPanel') tariffPanel!: MatExpansionPanel;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  allPanelsExpanded = false;
  panelState: boolean[] = [];
  tariffPanelState: boolean[] = [];
  flightOptions: any;
  @Input() searchResults: any;
  transactionId: any;
  data$: Observable<any[]> | undefined;
  allFlights: any[] = [];
  mergedFlights: any[] = [];
  sequenceOneOfferings: any;
  sequenceTwoOfferings: any;
  selectedDepartureCode:any;
  identifier: any;
  selectedDeparture: { id: any; productId: any } | null = null;
  selectedReturn: { id: any; productId: any } | null = null;
  loading: boolean = false;
  carriers: any = [];
  filteredData: any[] = [];
  selectedTabIndex = 0;
  selectedFilters: any = {};
  currentActiveTab = 0;
  private readonly filterService = inject(FilterService);
  IsDepartureSelected: Boolean = false

  constructor(
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private airprice: PriceService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.searchResults != null) {
      this.sequenceOneOfferings =
        this.searchResults.sequenceOneOfferings ||
        this.searchResults.SequenceOneOfferings;
      this.sequenceTwoOfferings =
        this.searchResults.sequenceTwoOfferings ||
        this.searchResults.SequenceTwoOfferings;
      this.identifier =
        this.searchResults.identifierValue ||
        this.searchResults.IdentifierValue;

      this.allFlights = [
        ...(this.sequenceOneOfferings || []),
        ...(this.sequenceTwoOfferings || []),
      ];

      this.extractFilterOptions();
    }
  }

  extractFilterOptions() {
    this.allFlights = [
      ...(this.sequenceOneOfferings || []),
      ...(this.sequenceTwoOfferings || []),
    ];

    const airlines = new Set<string>();
    const destinations = new Set<string>();
    const departureLocations = new Set<string>();
    const layoverCounts = new Set<number>();
    const layoverDestinations = new Set<string>();
    layoverCounts.add(0);
    let minDuration = Infinity;
    let maxDuration = -Infinity;
    this.allFlights.forEach((flight) => {
      if (flight.productBrandOptions && flight.productBrandOptions.length > 0) {
        flight.productBrandOptions.forEach((option: any) => {
          if (option.flightRefsDetails && option.flightRefsDetails.length > 0) {
            option.flightRefsDetails.forEach((detail: any) => {
              if (detail.operatingCarrierName) {
                // If operating carrier name is available
                if (
                  detail.operatingCarrierName ===
                  'FITS AVIATION  PVT  LTD'
                ) {
                  // Check if 'fits' or carrier '8D' already exists
                  if (
                    !airlines.has('8D') &&
                    !Array.from(airlines).some((airline) =>
                      airline.toLowerCase().includes('FITS AVIATION  PVT  LTD')
                    )
                  ) {
                    airlines.add('8D'); // Add carrier '8D' if neither is present
                  }
                } else {
                  airlines.add(detail.operatingCarrierName);
                }
              } else if (detail.carrier) {
                if (
                  detail.carrier === '8D' // If '8D' is not in the set already
                ) {
                  airlines.add('8D'); // Add carrier '8D' if it's not already present
                } else {
                  airlines.add(detail.carrier);
                }
              }


              if (detail.arrival?.location)
                destinations.add(detail.arrival.location);
              if (detail.departure?.location)
                departureLocations.add(detail.departure.location);

              if (detail.duration) {
                let durationInMinutes = this.parseDuration(detail.duration);
                minDuration = Math.min(minDuration, durationInMinutes);
                maxDuration = Math.max(maxDuration, durationInMinutes);
              }
            });

            if (option.flightRefsDetails.length > 0) {
              const layoverCount = option.flightRefsDetails.length-1;
              layoverCounts.add(layoverCount);

              for (let i = 0; i < option.flightRefsDetails.length - 1; i++) {
                if (option.flightRefsDetails[i].arrival?.location) {
                  layoverDestinations.add(
                    option.flightRefsDetails[i].arrival.location
                  );
                }
              }
            }
          }
        });
      }
    });

    const filterOptions = {
      airlines: Array.from(airlines),
      destinations: Array.from(destinations),
      departures: Array.from(departureLocations),
      layoverCounts: Array.from(layoverCounts),
      layoverDestinations: Array.from(layoverDestinations),
    };
    this.filterService.Filters(filterOptions);
  }

  parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+)H(\d+)M/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 0;
  }

  hasResults(): boolean {
    return (
      (this.sequenceOneOfferings && this.sequenceOneOfferings.length > 0)
      ||(this.sequenceTwoOfferings && this.sequenceTwoOfferings.length > 0)
    );
  }

  onFlightSelected(selection: { id: any; productId: any }, sequence: number) {
    if (sequence === 1) {
      this.selectedDeparture = selection;
      //console.log("Selected Departure:", this.selectedDeparture),
      this.selectedDepartureCode = this.getCombinabilityCode(selection.id, selection.productId); // Implement this
      if (
        !this.sequenceTwoOfferings ||
        this.sequenceTwoOfferings.length === 0
      ) {
        this.makeApiCall(selection.id, selection.productId);
      } else {
        this.sequenceTwoOfferings
        this.selectedTabIndex++;
        this.IsDepartureSelected = true;
        this.enableNextTab();
      }
    } else if (sequence === 2) {
      if (!this.selectedDeparture) {
        console.error('Departure flight must be selected first.');
        return;
      }
      this.selectedReturn = selection;
      this.makeApiCall(

        this.selectedDeparture.id,
        this.selectedDeparture.productId,
        selection.id,
        selection.productId
      );
    }
  }

  getCombinabilityCode(departureId: string, productId: string): string {
    if (this.sequenceOneOfferings && this.sequenceOneOfferings.length > 0) {
      const matching = this.sequenceOneOfferings
        .find((f: any) => f.id === departureId)
        ?.productBrandOptions
        .flatMap((option: any) => option.productBrandOffering)
        .find((offering: any) => {
          return offering.product?.some((p: any) => p.productRef === productId);
        });
      return matching?.combinabilityCode?.[0] || '';
    } else {
      return 'no data';
    }
  }



  enableNextTab() {
    if (this.currentActiveTab < 1) {
      this.currentActiveTab++;
    }
  }

  makeApiCall(
    departureId: any,
    departurePid: any,
    returnId?: any,
    returnPid?: any
  ) {
    const airpriceData = {
      Identifier: this.identifier,
      departureId,
      departurePid,
      returnId,
      returnPid,
    };
    this.loading = true;
    this.airprice.AirPrice(airpriceData).subscribe(
      (results) => {
        this.loading = false;
        this.cdr.detectChanges();
        if (results) {
          const error = results?.OfferListResponse?.Result?.Error;
          if (error && error.length > 0) {
            const errorMessage =
              error[0]?.Message || 'An unknown error occurred.';
            alert(`Error: ${errorMessage}`);
          } else {
            this.router.navigate(['/prebooking'], { state: { data: results } });
          }
        }
      },
      (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        alert('Failed to airprice. Please try again.');
      }
    );
  }
}
