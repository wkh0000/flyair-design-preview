import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  ElementRef,
  HostListener,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { MatCalendarCellClassFunction, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { UtilityService } from '../../Services/Utility/utility.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FlightService } from '../../Services/Flight/flight.service';
import { HttpClient } from '@angular/common/http';
import { LoaderComponent } from '../loader/loader.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedDataService } from '../../Services/shared/shared-data.service';
import { UtilityServiceService } from '../../Services/Admin-Services/UtilityService/utility-service.service';
import { LoaderService } from '../../Services/Loader/loader.service';
import {provideNativeDateAdapter} from '@angular/material/core';
import { OptionPanelComponent } from '../option-panel/option-panel.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';



@Component({
  selector: 'app-flight-search',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  providers: [provideNativeDateAdapter()],
  imports: [
    RouterModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    CommonModule,
    LoaderComponent,
    MatCheckboxModule,
    MatTooltipModule,
    MatAutocompleteModule,
    FormsModule,
    OptionPanelComponent
  ],
  templateUrl: './flight-search.component.html',
  styleUrl: './flight-search.component.scss',
})
export class FlightSearchComponent implements OnInit {
  @HostListener('document:click', ['$event'])
  oneWayForm!: FormGroup;
  returnForm!: FormGroup;
  passengers = {
    adult: 1,
    child: 0,
    infant: 0,
  };
  cabinClasses: string[] = ['Economy', 'Premium Economy', 'Business', 'First'];
  selectedClass = 'Economy';
  isDropdownOpen = false;
  isReturnDropdownOpen = false;
  /** Mirrors to the global LoaderService so the fullscreen overlay shows at the app root
   *  (a local overlay is trapped inside the hero's parallax transform). */
  private _loading = false;
  get loading(): boolean { return this._loading; }
  set loading(v: boolean) { this._loading = v; this.loaderSvc?.set(v); }
  readonly maxAdults = 9;
  readonly maxChildren = 9;
  readonly maxInfants = 9;
  readonly maxStudents = 2;
  readonly maxPassengers = 9;
  airports: any[] = [];
  totalTravellers = 1;
  departureMatchesDestination: boolean = false;
  departureMatchesReturnDestination: boolean = false;
  warningMessage: string | null = null;
  searchText = '';
  selectedDeparture: string | null = null;
  selectedDepartureCode: string | null = null;
  selectedDestination: string | null = null;
  selectedDestinationCode: string | null = null;
  filteredDepartureOptions: any[] = [];
  filteredDestinationOptions: any[] = [];
  options: { name: string; code: string }[] = [];
  @Input() customClass: string = '';
  filteredOptions: { name: string; code: string }[] = [...this.options];
  selectedOption: string | null = null;
  showDropdown: boolean = false;
  hxValue: number | undefined;
  minDate: Date;
  /** Drives [touchUi] on the datepickers — fullscreen calendar on phones, inline
   *  popup on desktop. Set from BreakpointObserver. */
  isHandset = false;
  constructor(
    private flightService: FlightService,
    private utilityService: UtilityService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private shared: SharedDataService,
    private elementRef: ElementRef,
    private adminutilityService: UtilityServiceService,
    private loaderSvc: LoaderService,
    private breakpoints: BreakpointObserver
  ) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.initializeForms();
    // Fullscreen calendar only on phones; inline popup on tablet/desktop.
    this.breakpoints.observe([Breakpoints.Handset]).subscribe(r => this.isHandset = r.matches);
    // Card-click prefill: when home navigation passes ?origin=&dest=&date=&pax=
    // we populate the one-way form so the user sees a ready-to-go search.
    this.route.queryParams.subscribe(qp => {
      if (qp && (qp['origin'] || qp['dest'] || qp['date'])) {
        this.pendingPrefill = qp;
        this.applyPrefill();   // applies immediately if airports already loaded
      }
    });
    //test end
    this.http
      .get<{ name: string; code: string }[]>(
        '../../../assets/DATA/airports.json'
      )
      .subscribe((data) => {
        this.options = data;
        this.filteredOptions = [...this.options];
        this.applyPrefill();   // resolve any pending prefill now that the list exists
      });

    this.oneWayForm.valueChanges.subscribe((values) => {
      if (values) {
        const { onewaydeparture, onewaydestination } = values || {};
        this.departureMatchesDestination =
          onewaydeparture && onewaydestination
            ? onewaydeparture === onewaydestination
            : false;
      }
    });

    this.returnForm.valueChanges.subscribe((values) => {
      if (values) {
        const { returndeparture, returndestination } = values || {};
        this.departureMatchesReturnDestination =
          returndeparture && returndestination
            ? returndeparture === returndestination
            : false;
      }
    });

    this.adminutilityService.fetchContent().subscribe({
      next: (data) => {
        this.hxValue = data?.[0]?.hx;
      },
      error: (err) => {
        console.error("Error fetching content:", err);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (
      this.isDropdownOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isDropdownOpen = false;
    }
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month' && this.hxValue) {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0)); // Normalize to start of day
      const end = new Date(start);
      end.setDate(start.getDate() + this.hxValue); // Add hxValue days

      if (cellDate >= start && cellDate <= end) {
        return 'example-custom-date-class';
      }
    }
    return '';
  };

  initializeForms() {
    this.oneWayForm = this.fb.group({
      onewaydeparture: ['', Validators.required],
      onewaydestination: ['', Validators.required],
      onewaydepartureDate: ['', Validators.required],
      onewayflexibility: [0],
      onewaydirectFlights: [false],
      passengers: this.fb.group(
        {
          adult: [1],
          child: [0],
          infant: [0],
          student: [0],
        },
        { validators: this.passengerValidator() }
      ),
      selectedClass: [this.selectedClass],
    });

    this.returnForm = this.fb.group({
      returndeparture: ['', Validators.required],
      returndestination: ['', Validators.required],
      returndepartureDate: ['', Validators.required],
      returnreturnDate: ['', Validators.required],
      returnflexibility: [0],
      returndirectFlights: [false],
      passengers: this.fb.group(
        {
          adult: [1],
          child: [0],
          infant: [0],
          student: [0],
        },
        { validators: this.passengerValidator() }
      ),
      selectedClass: [this.selectedClass],
    });
  }

  /** Pending ?origin/dest/date/pax prefill, applied once the airport list loads. */
  private pendingPrefill: any = null;
  /** Default origin when a promotion / destination card doesn't carry one — the
   *  agency's home airport, so the prefilled search is valid and runnable. */
  private readonly DEFAULT_ORIGIN = 'CMB';

  /** Resolve an IATA code ("DXB") or city name ("Dubai") to the canonical
   *  "Name - CODE" option string the autocomplete + submit logic expect. */
  private resolveAirport(val: string): string | null {
    const v = (val || '').trim().toLowerCase();
    if (!v || !this.options?.length) return null;
    let opt = this.options.find((o: any) => (o.code || '').toLowerCase() === v);
    if (!opt) opt = this.options.find((o: any) => (o.name || '').toLowerCase().includes(v));
    return opt ? `${opt.name} - ${opt.code}` : null;
  }

  /** Apply the pending prefill. Date + pax patch right away; origin/dest are
   *  resolved against the airport list so they become real selections (not loose
   *  text) — otherwise the field shows a bare code and submit can't extract a
   *  valid airport code, leaving the form invalid. */
  private applyPrefill(): void {
    const qp = this.pendingPrefill;
    if (!qp || !this.oneWayForm) return;
    const patch: any = {};
    if (qp['date']) patch.onewaydepartureDate = new Date(qp['date']);
    if (qp['origin']) { const r = this.resolveAirport(qp['origin']); if (r) patch.onewaydeparture = r; }
    if (qp['dest'])   { const r = this.resolveAirport(qp['dest']);   if (r) patch.onewaydestination = r; }
    // Default origin to the home airport when none was provided, so the search
    // is immediately valid and the customer can run it in one click.
    if (!patch.onewaydeparture && !this.oneWayForm.get('onewaydeparture')?.value && (qp['dest'] || qp['origin'])) {
      const home = this.resolveAirport(this.DEFAULT_ORIGIN);
      if (home) patch.onewaydeparture = home;
    }
    this.oneWayForm.patchValue(patch);
    const pax = parseInt(qp['pax'] || '0', 10);
    if (pax > 0) (this.oneWayForm.get('passengers') as any)?.patchValue({ adult: pax });
    if (this.options?.length) this.pendingPrefill = null;   // resolved once airports exist
  }

  passengerValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const passengers = control.value;
      const totalPassengers =
        (passengers.adult || 0) +
        (passengers.child || 0) +
        (passengers.infant || 0) +
        (passengers.student || 0);

      return totalPassengers >= 1 ? null : { noPassengers: true }; // Return error if no passengers
    };
  }

  onSubmitOneWay(): void {
    if (this.oneWayForm.invalid) {
      this.oneWayForm.markAllAsTouched();
      this.warningMessage = 'Please fill in origin, destination and travel date.';
      setTimeout(() => (this.warningMessage = null), 4000);
      return;
    }

    const departureField = this.oneWayForm.get('onewaydeparture')?.value;
    const destinationField = this.oneWayForm.get('onewaydestination')?.value;

    // Extract the airport codes
    const departureCode = departureField?.split('-').pop().trim();
    const destinationCode = destinationField?.split('-').pop().trim();

    if (departureCode && destinationCode && departureCode === destinationCode) {
      this.warningMessage = 'Origin and destination cannot be the same.';
      setTimeout(() => (this.warningMessage = null), 4000);
      this.oneWayForm.get('onewaydestination')?.setErrors({ sameAsDeparture: true });
      return;
    }
    this.loading = true;

    const formattedData = {
      ...this.oneWayForm.value,
      onewaydeparture: departureCode,
      onewaydestination: destinationCode,
      departureDate: this.formatDate(this.oneWayForm.value.onewaydepartureDate),
      passengers: {
        adult: this.oneWayForm.get(['passengers', 'adult'])?.value || 0,
        child: this.oneWayForm.get(['passengers', 'child'])?.value || 0,
        infant: this.oneWayForm.get(['passengers', 'infant'])?.value || 0,
        student: this.oneWayForm.get(['passengers', 'student'])?.value || 0,
      },
    };

    this.shared.setPassengerData(formattedData.passengers);
    this.flightService.bookOneWayFlight(formattedData).subscribe(
      (results) => {
        this.loading = false;

        this.flightService.setFlightData({
          results: results,
          formattedData: formattedData,
        });

        if (this.router.url !== '/result') {
          this.router.navigate(['/result'], {
            state: { data: results, formattedData: formattedData },
            replaceUrl: true,
          });
        }
      },
      (error) => {
        this.loading = false;
        alert(
          error.error?.message || 'An error occurred while searching for flights. Please try again.'
        );
        console.error('Error searching flights:', error);
      }
    );
  }
  

  private formatDate(date: Date): string {
    const istDate = new Date(date.getTime() + (5 * 3600 + 30 * 60) * 1000);
    const dateString = istDate.toISOString().slice(0, 10);
    return dateString;
  }

  onSubmitReturn(): void {
    if (this.returnForm.valid) {
      this.loading = true; // Start loading
      const departureDate = new Date(this.returnForm.value.returndepartureDate);
      const returnDate = new Date(this.returnForm.value.returnreturnDate);

      if (returnDate <= departureDate) {
        console.error('Return date must be greater than departure date.');
        alert('Return date must be after the departure date.');
        this.loading = false; // Stop loading to prevent infinite loading state
        return; // Prevent form submission
      }

      const departureField = this.returnForm.get('returndeparture')?.value;
      const destinationField = this.returnForm.get('returndestination')?.value;

      // Extract the airport codes
      const departureCode = departureField?.split('-').pop().trim();
      const destinationCode = destinationField?.split('-').pop().trim();

      if (departureCode && destinationCode && departureCode === destinationCode) {
        alert('Departure and Destination cannot be the same.');
        this.oneWayForm.get('onewaydestination')?.setErrors({ sameAsDeparture: true });
        return;
      }

      const formattedData = {
        ...this.returnForm.value,
        returndeparture: departureCode,
        returndestination: destinationCode,
        departureDate: this.formatDate(
          this.returnForm.value.returndepartureDate
        ),
        returnDate: this.formatDate(this.returnForm.value.returnreturnDate),
        passengers: {
          adult: this.returnForm.get(['passengers', 'adult'])?.value || 0,
          child: this.returnForm.get(['passengers', 'child'])?.value || 0,
          infant: this.returnForm.get(['passengers', 'infant'])?.value || 0,
          student: this.returnForm.get(['passengers', 'student'])?.value || 0,
        },
      };
      const departure = this.returnForm.get('returndeparture')?.value;
      const destination = this.returnForm.get('returndestination')?.value;
      if (departure && destination && departure === destination) {
        console.warn('Departure and Destination are the same.');
        this.returnForm
          .get('returndestination')
          ?.setErrors({ sameAsDeparture: true });
        return; // Prevent submission
      }

      this.shared.setPassengerData(formattedData.passengers);
      this.flightService.bookReturnFlight(formattedData).subscribe(
        (results) => {
          this.loading = false; // Stop loading

          this.flightService.setFlightData({
            results: results,
            formattedData: formattedData,
          });

          if (this.router.url !== '/result') {
            this.router.navigate(['/result'], {
              state: { data: results, formattedData: formattedData },
              replaceUrl: true,
            });
          }
        },
        (error) => {
          console.error('Error searching return flights:', error);
          alert('Failed to search return flights. Please try again.');
        }
      );
    } else {
      console.error('Return form is invalid');
      alert('Please fill out all required fields.');
    }
  }

  increment(type: string, form: FormGroup): void {
    const control = form.get(['passengers', type]);
    const passengers = form.get('passengers')?.value;
    const adultControl = form.get(['passengers', 'adult']);

    if (!control) return;
    if (type === 'infant' && (adultControl?.value || 0) === 0) {
            this.warningMessage =
              'An infant must be accompanied by at least one adult.';
            setTimeout(() => (this.warningMessage = null), 3000);
            return;
          }
    // Check limits before incrementing
    if (
      (type === 'adult' && control.value >= this.maxAdults) ||
      (type === 'child' && control.value >= this.maxChildren) ||
      (type === 'infant' && control.value >= this.maxInfants) ||
      (type === 'student' && control.value >= this.maxStudents) ||
      (passengers.adult + passengers.child + passengers.infant + passengers.student>= this.maxPassengers) // Max total limit
    ) {
      this.warningMessage = 'Passenger limit reached.';
      setTimeout(() => (this.warningMessage = null), 3000);
      return;
    }


    control.setValue(control.value + 1);
    this.updateTotalTravellers(form);
  }


  decrement(type: string, form: FormGroup): void {
    const control = form.get(['passengers', type]);
    const infantControl = form.get(['passengers', 'infant']);
    const adultControl = form.get(['passengers', 'adult']);

    if (control && control.value > 0) {
      if (
        type === 'adult' &&
        control.value === 1 &&
        (infantControl?.value || 0) > 0
      ) {
        this.warningMessage =
          'You cannot remove the last adult when there are infants.';
        setTimeout(() => (this.warningMessage = null), 3000);
        return;
      }

      control.setValue(control.value - 1);
      this.updateTotalTravellers(form);
    }
  }

  updateTotalTravellers(form: FormGroup): void {
    const passengers = form.get('passengers')?.value;
    this.totalTravellers =
      passengers.adult +
      passengers.child +
      passengers.infant +
      passengers.student;
  }

  selectClass(cabinClass: string, form: FormGroup): void {
    form.get('selectedClass')?.setValue(cabinClass);
    this.selectedClass = cabinClass;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleReturnDropdown(): void {
    this.isReturnDropdownOpen = !this.isReturnDropdownOpen;
  }

  toggleDropdownn(show: boolean) {
    this.showDropdown = show;
  }

  filterOptions(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;

    if (input && input.value && type === 'departure') {
      this.filteredDepartureOptions = this.options.filter(
        (option: any) =>
          option.name.toLowerCase().includes(input.value.toLowerCase()) ||
          option.code.toLowerCase().includes(input.value.toLowerCase())
      );
    } else if (input && input.value && type === 'destination') {
      this.filteredDestinationOptions = this.options.filter(
        (option: any) =>
          option.name.toLowerCase().includes(input.value.toLowerCase()) ||
          option.code.toLowerCase().includes(input.value.toLowerCase())
      );
    }
  }

  selectOption(option: any, type: string): void {
    if (type === 'departure') {
      this.selectedDeparture = option.name;
      this.selectedDepartureCode = option.code;
    } else if (type === 'destination') {
      this.selectedDestination = option.name;
      this.selectedDestinationCode = option.code;
    }
  }

  /** Populate the full airport list on focus so the dropdown opens immediately on click. */
  onFocus(type: string): void {
    if (type === 'departure') {
      this.filteredDepartureOptions = this.options;
    } else {
      this.filteredDestinationOptions = this.options;
    }
  }

  /** Swap the origin and destination values. */
  swap(formType: 'oneway' | 'return'): void {
    const form = formType === 'oneway' ? this.oneWayForm : this.returnForm;
    const dKey = formType === 'oneway' ? 'onewaydeparture' : 'returndeparture';
    const aKey = formType === 'oneway' ? 'onewaydestination' : 'returndestination';
    const d = form.get(dKey)?.value;
    const a = form.get(aKey)?.value;
    form.get(dKey)?.setValue(a);
    form.get(aKey)?.setValue(d);
  }
}
