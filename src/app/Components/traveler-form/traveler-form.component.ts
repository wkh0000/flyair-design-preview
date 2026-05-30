import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../Services/shared/shared-data.service';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { TravelerService } from '../../Services/Traveler/traveler.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'app-traveler-form',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatMenuModule
  ],
  providers: [DatePipe],
  templateUrl: './traveler-form.component.html',
  styleUrls: ['./traveler-form.component.scss'],
})
export class TravelerFormComponent implements OnInit {
  @Output() travelersSubmitted = new EventEmitter<any>();
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  travelerFormGroup!: FormGroup;
  passengerData: any;
  disableSelect = true;
  minDate: Date | null = null;
  maxDate: Date | null = null;
  expiryDate: Date | undefined;
  filteredCode: any[] = [];
  filteredCountry: any[] = [];
  selectedCountry:  string = '';
  selectedCode:  string = '';
  code: string = '';
  country: string = '';
  options: { issueCountry: string; countryAccessCode: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private sharedDataService: SharedDataService,
    private datePipe: DatePipe,
    private travelService: TravelerService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.http
    .get<[]>(
      '../../../assets/DATA/contact.json'
    )
    .subscribe((data) => {
      this.options = data;
    });

    this.passengerData = this.sharedDataService.getPassengerData();

    this.travelerFormGroup = this.fb.group({
      travelers: this.fb.array([]),
    });

    if (this.passengerData) {
      this.createFormsFromPassengerData(this.passengerData);
    }

    const today = new Date();
    const maxExpireDate = new Date(today);
    maxExpireDate.setMonth(today.getMonth() + 6);
    this.expiryDate = maxExpireDate;
  }

  get travelers(): FormArray {
    return this.travelerFormGroup.get('travelers') as FormArray;
  }

  getDateRangeForPassengerType(passengerType: string): {
    min: Date;
    max: Date;
  } {
    const today = new Date();
    switch (passengerType) {
      case 'ADT':
        return {
          min: new Date(
            today.getFullYear() - 120,
            today.getMonth(),
            today.getDate()
          ),
          max: new Date(
            today.getFullYear() - 12,
            today.getMonth(),
            today.getDate()
          ),
        };
      case 'CNN':
        return {
          min: new Date(
            today.getFullYear() - 11,
            today.getMonth(),
            today.getDate()
          ),
          max: new Date(
            today.getFullYear() - 2,
            today.getMonth(),
            today.getDate()
          ),
        };
      case 'INF':
        return {
          min: new Date(
            today.getFullYear() - 2,
            today.getMonth(),
            today.getDate()
          ),
          max: today,
        };
      default:
        return {
          min: new Date(
            today.getFullYear() - 120,
            today.getMonth(),
            today.getDate()
          ),
          max: new Date(
            today.getFullYear() - 12,
            today.getMonth(),
            today.getDate()
          ),
        };
    }
  }

  setDateRange(passengerType: string): void {
    const range = this.getDateRangeForPassengerType(passengerType);
    this.minDate = range.min;
    this.maxDate = range.max;
  }

  createFormsFromPassengerData(data: {
    adult: number;
    child: number;
    infant: number;
    student: number;
  }): void {
    this.addPassengers('ADT', data.adult);
    this.addPassengers('CNN', data.child);
    this.addPassengers('INF', data.infant);
    this.addPassengers('STU', data.student);
  }

  addPassengers(passengerTypeCode: string, count: number): void {
    for (let i = 0; i < count; i++) {
      this.addTraveler(passengerTypeCode);
    }
  }

  addTraveler(passengerTypeCode: string): void {
    const travelerForm = this.fb.group({
      passengerTypeCode: [
         passengerTypeCode,
        Validators.required,
      ],
      given: ['', [Validators.required, Validators.maxLength(20)]],
      surname: ['', [Validators.required, Validators.maxLength(20)]],
      gender: ['', Validators.required],
      birthDate: [null, Validators.required],
      prefix: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9}$')],
      ],
      role: ['', [Validators.required]],
      email: ['', [Validators.email]],
      docNumber: ['', Validators.required],
      docType: ['Passport', Validators.required],
      expireDate: [null, Validators.required],
      minDate: [null as Date | null],
      maxDate: [null as Date | null],
      countryAccessCode: ['+94', Validators.required],
      issueCountry: ['LK', Validators.required],
      docGiven: ['', [Validators.required, Validators.maxLength(20)]],    // ← add this
      docSurname: ['', [Validators.required, Validators.maxLength(20)]],  // ← add 
    });
    const range = this.getDateRangeForPassengerType(passengerTypeCode);
    travelerForm.get('minDate')?.setValue(range.min);
    travelerForm.get('maxDate')?.setValue(range.max);

    this.travelers.push(travelerForm);
  }
  removeTraveler(index: number) {
    if (this.travelers.length > 1) {
      this.travelers.removeAt(index);

      // Move to first tab if deleted last tab
      if (index >= this.travelers.length) {
        this.tabGroup.selectedIndex = this.travelers.length - 1;
      } else {
        this.tabGroup.selectedIndex = index;
      }
    } else {
      // Optionally show a message
      console.warn('At least one traveler must remain.');
    }
  }
onTypeChange(newPassengerType: string, index: number): void {
    const currentTraveler = this.travelers.at(index);
    const range = this.getDateRangeForPassengerType(newPassengerType);

    currentTraveler.get('minDate')?.setValue(range.min);
    currentTraveler.get('maxDate')?.setValue(range.max);
    currentTraveler.get('birthDate')?.setValue(null); // Clear invalid birthdate
  }
  // Add this method inside your TravelerFormComponent class
getFilteredPrefixes(index: number): string[] {
  const traveler = this.travelers.at(index);
  const type = traveler.get('passengerTypeCode')?.value;
  const gender = traveler.get('gender')?.value;

  if (type === 'ADT') {
    if (gender === 'Male') return ['Mr'];
    if (gender === 'Female') return ['Ms', 'Mrs', 'Miss'];
    return ['Mr', 'Ms', 'Mrs', 'Miss', 'Mx']; // Default/Other
  } 
  
  // Child (CNN) or Infant (INF)
  if (gender === 'Male') return ['MSTR'];
  if (gender === 'Female') return ['Miss'];
  
  return ['MSTR', 'Miss']; // Default for kids
}

// Update your submit logic to force validation visibility
submitTravelers() {
  const currentIndex = this.tabGroup.selectedIndex ?? 0;
  const currentTraveler = this.travelers.at(currentIndex) as FormGroup;

  // If the current tab's form is invalid, show errors and stop
  if (currentTraveler.invalid) {
    currentTraveler.markAllAsTouched();
    return; 
  }

  if (currentIndex < this.travelers.length - 1) {
    this.tabGroup.selectedIndex = currentIndex + 1;
  } else {
    if (this.travelerFormGroup.valid) {
      this.travelersSubmitted.emit(this.travelerFormGroup.value);
    } else {
      this.travelerFormGroup.markAllAsTouched();
    }
  }
}

  selectOption(option: any, type: string): void {
    if (type === 'code') {
      this.code = option.code;
      this.travelers.controls.forEach((control) => {
        control.get('code')?.setValue(this.code);
      });
    } else if (type === 'country') {
      this.country = option.country;
      this.travelers.controls.forEach((control) => {
        control.get('country')?.setValue(this.country);
      });
    }
  }


  filterOptions(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;

    if (input && input.value && type === 'code') {
      this.filteredCode = this.options.filter(
        (option: any) =>
          option.issueCountry.toLowerCase().includes(input.value.toLowerCase()) ||
          option.countryAccessCode.toLowerCase().includes(input.value.toLowerCase())
      );
    }
    else if (input && input.value && type === 'country') {
      this.filteredCountry = this.options.filter(
        (option: any) => option.issueCountry.toLowerCase().includes(input.value.toLowerCase()))
    }
  }

  syncDocName(field: 'given' | 'surname', index: number) {
    const traveler = this.travelers.at(index);
    const value = traveler.get(field)?.value;

    if (field === 'given') {
      traveler.get('docGiven')?.setValue(value);
    } else {
      traveler.get('docSurname')?.setValue(value);
    }
  }
}

