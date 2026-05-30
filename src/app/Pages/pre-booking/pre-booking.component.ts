import { Component, inject, OnInit, viewChild, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  StepperOrientation,
  MatStepperModule,
  MatStepper,
} from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { WorkbenchService } from '../../Services/Workbench/workbench.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { TravelerFormComponent } from '../../Components/traveler-form/traveler-form.component';
import { TravelerService } from '../../Services/Traveler/traveler.service';
import { BookingService } from '../../Services/Booking/booking.service';
import { Router } from '@angular/router';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { BookingConfirmComponent } from '../../Components/booking-confirm/booking-confirm.component';
import { LoaderComponent } from '../../Components/loader/loader.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../Components/confirm-dialog/confirm-dialog.component';
import { ImmediateBookingComponent } from '../../Components/immediate-booking/immediate-booking.component';
import { UtilityServiceService } from '../../Services/Admin-Services/UtilityService/utility-service.service';
import { IssueTicketComponent } from '../../Components/issue-ticket/issue-ticket.component';

@Component({
  selector: 'app-prbooking',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    TravelerFormComponent,
    MatExpansionModule,
    MatAccordion,
    MatDividerModule,
    MatTabsModule,
    MatIconModule,
    AsyncPipe,
    BookingConfirmComponent,
    IssueTicketComponent,
    ImmediateBookingComponent,
  ],
  templateUrl: './pre-booking.component.html',
  styleUrl: './pre-booking.component.scss',
})
export class PreBookingComponent implements OnInit {
  loading: boolean = false;
  accordion = viewChild.required(MatAccordion);
  priceResponse: any;
  identifierValue: string | undefined;
  workbenchId: any;
  restrictions: string = '';
  private _formBuilder = inject(FormBuilder);
  travelerFormGroup: FormGroup;
  maxTravelers = 3;
  @ViewChild('stepper') stepper!: MatStepper;
  selectedTabIndex = 0;
  readonly dialog = inject(MatDialog);
  currentActiveTab = 0;
  submittedResults: any;
  ticketResults: any;
  immediateBooking: boolean = false;
  hx: number = 0;
  iata: boolean = true;
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });
  stepperOrientation: Observable<StepperOrientation>;
  stepperDisabled = true;
  aircraftData: {
    aircraft_code: string;
    model: string;
    variant: string;
    make: string;
  }[] = [];
  options: { name: string; code: string }[] = [];

  constructor(
    private workbenchService: WorkbenchService,
    private fb: FormBuilder,
    private travelService: TravelerService,
    private bookingService: BookingService,
    private router: Router,
    private http: HttpClient,
    private adminUtility: UtilityServiceService
  ) {
    const breakpointObserver = inject(BreakpointObserver);

    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

    this.travelerFormGroup = this.fb.group({
      travelers: this.fb.array([
        this.fb.group({
          passengerTypeCode: ['', Validators.required],
          given: ['', Validators.required],
          middle: [''],
          surname: ['', Validators.required],
          suffix: [''],
          gender: ['', Validators.required],
          birthDate: ['', Validators.required],
          countryCode: ['', Validators.required],
          areaCityCode: [''],
          phoneNumber: ['', Validators.required],
          extension: [''],
          telephoneId: ['', Validators.required],
          phoneRole: ['', Validators.required],
          email: ['', Validators.required],
          docNumber: ['', Validators.required],
          docType: ['', Validators.required],
          expireDate: ['', Validators.required],
          issueCountry: ['', Validators.required],
          docBirthDate: ['', Validators.required],
          birthCountry: [''], // Required for INF
          docGender: ['', Validators.required],
          docGiven: ['', Validators.required],
          docSurname: ['', Validators.required],
        }),
      ]),
    });
  }

  ngOnInit(): void {
    this.priceResponse = history.state.data.OfferListResponse;
    this.identifierValue = this.priceResponse.Identifier.value;
    if (
      this.priceResponse?.OfferID?.[0]?.TermsAndConditionsFullAir?.[0]
        ?.Restriction
    ) {
      this.restrictions =
        this.priceResponse.OfferID[0].TermsAndConditionsFullAir[0].Restriction.map(
          (restriction: any) => restriction.value
        ).join(', ');
    }
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

    this.adminUtility.fetchContent().subscribe((data: any) => {
      this.hx = data[0].hx;
      // Example: You already have the offer response in a variable
      const offer = this.priceResponse?.OfferID?.[0]; // replace with your actual response variable
      const departureDateStr =
        offer?.Product?.[0]?.FlightSegment?.[0]?.Flight?.Departure?.date;

      if (departureDateStr && this.hx !== undefined) {
        const today = new Date(); // current date
        const departureDate = new Date(departureDateStr); // flight departure date

        // Create a date limit by adding hx days to today
        const limitDate = new Date();
        limitDate.setDate(today.getDate() + this.hx);

        // Check if the departure date is within hx days
        this.immediateBooking = departureDate <= limitDate;
      } else {
        this.immediateBooking = false;
      }
    });
  }

  onConfirmClick() {
    if (this.immediateBooking) {
      this.openImmediatenDialog(this.hx).then((result: any) => {
        if (result === true) {
          this.startBookingSession(); // Only proceed if user clicked "Confirm"
        } else if (result === 'edit') {
          this.router.navigate(['/']); // Go home if user clicked "Edit"
        }
      });
    } else {
      this.startBookingSession(); // Proceed normally
    }
  }


  getAirlineLogoUrl(iataCode: string, operatingCarrier: string): string {
    if (operatingCarrier === 'FITS AVIATION  PVT  LTD' || iataCode === '8D') {
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
  get travelers(): FormArray {
    return this.travelerFormGroup.get('travelers') as FormArray;
  }

  get hasNotOfferedItems(): boolean {
    return (
      this.priceResponse.ReferenceList[0]?.Brand[0]?.AdditionalBrandAttribute?.some(
        (item: any) => item.inclusion === 'Not Offered'
      ) || false
    );
  }
  errorMessage: string = '';

  onTravelersSubmitted(travelersData: any): void {
    this.loading = true;
    this.errorMessage = '';

    this.travelService.AddTraveler(travelersData, this.workbenchId).subscribe(
      (results) => {
        // Check AddTraveler response body for errors (200 with error inside)
        const travelerErrors = results?.ReservationResponse?.Result?.Error;
        if (travelerErrors && travelerErrors.length > 0) {
          this.errorMessage = travelerErrors.map((e: any) => e.Message).join('\n');
          this.loading = false;
          return;
        }

        // AddTraveler succeeded, now Commit
        this.bookingService.Commit(this.workbenchId).subscribe(
          (data) => {
            // Check Commit response body for errors (200 with error inside)
            const commitErrors = data?.ReservationResponse?.Result?.Error;
            if (commitErrors && commitErrors.length > 0) {
              this.errorMessage = commitErrors.map((e: any) => e.Message).join('\n');
              this.loading = false;
              return;
            }

            // Both succeeded
            this.submittedResults = data;
            this.selectedTabIndex++;
            this.loading = false;
            this.enableNextTab();
          },
          (error) => {
            // Commit returned 400/500 — parse the error body
            this.errorMessage = this.extractErrorMessage(error);
            this.loading = false;
          }
        );
      },
      (error) => {
        // AddTraveler returned 400/500 — parse the error body
        this.errorMessage = this.extractErrorMessage(error);
        this.loading = false;
      }
    );
  }

  // Reusable error extractor
  private extractErrorMessage(error: any): string {
    try {
      const details = error?.error?.details;
      if (details) {
        const parsed = JSON.parse(details);
        const errors = parsed?.ReservationResponse?.Result?.Error;
        if (errors && errors.length > 0) {
          return errors.map((e: any) => e.Message).join('\n');
        }
      }
      return error?.message || 'Something went wrong.';
    } catch {
      return error?.message || 'Something went wrong.';
    }
  }

  enableNextTab() {
    if (this.currentActiveTab < 3) {
      this.currentActiveTab++;
    }
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

  onTabChange(event: any): void {
    const index = event.index;
    // Allow going back freely, block going forward beyond unlocked tabs
    if (index > this.currentActiveTab) {
      this.selectedTabIndex = this.currentActiveTab; // snap back
    }
  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', // Set the desired width
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // Handle the result if needed
    });
  }

  openImmediatenDialog(hx: number): Promise<boolean | string> {
    const dialogRef = this.dialog.open(ImmediateBookingComponent, {
      width: '400px',
      data: { hx: hx },
    });

    return dialogRef.afterClosed().toPromise(); // Returns either boolean or string
  }

  startBookingSession() {
    this.loading = true;
    const offerrequestBody = {
      identifier: this.priceResponse?.Identifier?.value,
      offerId: this.priceResponse?.OfferID[0]?.id,
      productId: this.priceResponse?.OfferID[0]?.Product[0]?.id,
    };

    this.workbenchService.StartSession(offerrequestBody).subscribe(
      (results) => {
        this.workbenchId = results.initializeResponse;
        this.selectedTabIndex++;
        this.loading = false;
        this.enableNextTab();
      },
      (error) => {
        console.error('Session start failed:', error);
        this.loading = false;
      }
    );
  }

  onPaymentMake(reservationId: any) {
    this.loading = true;
    console.log("reseravtion data", reservationId);
    this.workbenchService.MakePayment(reservationId).subscribe((data: any) => {
      this.ticketResults = data; // <-- set it here
      this.selectedTabIndex++;
      this.loading = false;
      this.enableNextTab();
    },
      (error) => {
        console.error('Session start failed:', error);
        this.loading = false;
      }
    )
  }
  // Add these properties
  showInquiryDialog = false;
  inquiryStep = 1;             // 1 = contact details, 2 = fare/payment summary + send
  inquiryName = '';
  inquiryEmail = '';
  inquiryContact = '';

  onSendInquiryClick() {
    this.inquiryStep = 1;
    this.showInquiryDialog = true;
  }

  get inquiryContactValid(): boolean {
    return !!(this.inquiryName?.trim() && this.inquiryEmail?.trim() && this.inquiryContact?.trim());
  }

  inquiryToSummary() {
    if (this.inquiryContactValid) this.inquiryStep = 2;
  }

  sendToWhatsApp() {
    const phone = '94767566677';
    const o = this.priceResponse?.OfferID?.[0];
    const f = o?.Product?.[0]?.FlightSegment?.[0]?.Flight;
    const p = o?.Price;
    const cur = p?.CurrencyCode?.value || '';
    const airline = this.getAirlineName(this.priceResponse?.ReferenceList?.[0]?.Brand?.[0]?.ImageURL?.[0]);
    const message =
      `*New Flight Inquiry — FlyAir*\n\n` +
      `*Name:* ${this.inquiryName}\n` +
      `*Email:* ${this.inquiryEmail}\n` +
      `*Phone / WhatsApp:* ${this.inquiryContact}\n\n` +
      `*Flight*\n` +
      `Route: ${f?.Departure?.location} → ${f?.Arrival?.location}\n` +
      `Date: ${f?.Departure?.date}\n` +
      `Airline: ${airline}\n\n` +
      `*Fare*\n` +
      `Base: ${p?.Base} ${cur}\n` +
      `Taxes: ${p?.TotalTaxes} ${cur}\n` +
      `Total: ${p?.TotalPrice} ${cur}\n\n` +
      `Please share availability and the next steps to confirm.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    this.showInquiryDialog = false;
  }
  getAirlineName(url: string): string {
    if (!url) return '';

    // 1. Get the 4th part of the URL: "singaporeairlinesltd"
    const rawName = url.split('/')[3];

    // 2. Add spaces before capital letters and handle "ltd"
    // This replaces "singaporeairlinesltd" logic with a more readable format
    let formattedName = rawName
      .replace('ltd', ' Ltd')
      .replace('airlines', ' Airlines ');

    // 3. Capitalize the first letter of each word
    return formattedName.replace(/\b\w/g, char => char.toUpperCase()).trim();
  }
}

