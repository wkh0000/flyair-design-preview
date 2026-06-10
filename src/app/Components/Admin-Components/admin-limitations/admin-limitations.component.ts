import { UtilityService } from './../../../Services/Utility/utility.service';
import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';  // ✅ Import this
import { MatPaginatorModule } from '@angular/material/paginator';  // ✅ If using pagination
import { MatSortModule } from '@angular/material/sort';  // ✅ If sorting is enabled
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilityServiceService } from '../../../Services/Admin-Services/UtilityService/utility-service.service';
import { HttpClient } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

export interface Limitation {
  id: number;
  limit_name: string;
  limit_type: string;
  applies_To_Airline: string;
  applies_To_Destination: string;
  from?: string;
  to?: string;
  price_Range_From?: number;
  price_Range_To?: number;
}

@Component({
  selector: 'app-admin-limitations',
  standalone: true,
  imports: [MatFormFieldModule, MatAutocompleteModule, ReactiveFormsModule, MatSelectModule, MatAccordion, MatExpansionModule, MatIconModule, MatButtonModule, MatDatepickerModule, MatInputModule, MatCheckboxModule, MatTableModule, MatPaginatorModule, MatSortModule, CommonModule],
  templateUrl: './admin-limitations.component.html',
  styleUrl: './admin-limitations.component.scss'
})
export class AdminLimitationsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'limit_type',
    'limit_name',
    'airline',
    'destination',
    'from',
    'to',
    'min-value',
    'max-value',
    'actions'
  ]; dataSource = new MatTableDataSource<Limitation>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  restTypes: string[] = ['Allowed', 'Restricted'];
  dataForm: FormGroup;
  filterForm: FormGroup;
  filteredDestinationOptions: any[] = [];
  options: { name: string; code: string }[] = [];
  flightoptions: { name: string; code: string }[] = [];
  filteredOptions: { name: string; code: string }[] = [...this.options];
  filteredflights: { name: string; code: string }[] = [...this.flightoptions];
  selectedDeparture: string | null = null;
  selectedDepartureCode: string | null = null;
  selectedAirline: string | null = null;
  selectedAirlineCode: string | null = null;
  filteredDepartureOptions: any[] = [];
  filteredAirlineOptions: any[] = [];
  constructor(private fb: FormBuilder, private UtilityService: UtilityServiceService, private http: HttpClient,
  ) {
    this.filterForm = this.fb.group({
      applies_To_Airline: [''],
      applies_To_Destination: [''],
      price_Range_From: [''],
      price_Range_To: ['']
    });
    this.dataForm = this.fb.group({
      limit_type: ['', Validators.required],
      restriction_Type: ['', Validators.required],
      applies_To_Airline: ['', Validators.required],
      applies_To_Destination: ['', Validators.required],
      effective_from: [''],
      effective_to: [''],
      price_Range_From: [''],
      price_Range_To: ['']
    });
  }

  ngOnInit(): void {
    this.fetchLimits();
    this.http
      .get<{ name: string; code: string }[]>(
        '../../../assets/DATA/airports.json'
      )
      .subscribe((data) => {
        this.options = data;
        this.filteredOptions = [...this.options];
      });
    this.http
      .get<{ name: string; code: string }[]>(
        '../../../assets/DATA/airline.json'
      )
      .subscribe((data) => {
        this.flightoptions = data;
        this.filteredflights = [...this.flightoptions];
      });
  }

  fetchLimits() {
    this.UtilityService.fetchLimits().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error("Error fetching limits:", err);
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilters() {
    let filterValues = this.filterForm.value;

    this.dataSource.filterPredicate = (data: Limitation, filter: string) => {
      let filters = JSON.parse(filter);

      return (
        (!filters.applies_To_Airline ||
          data.applies_To_Airline?.toLowerCase().includes(filters.applies_To_Airline.toLowerCase())) &&

        (!filters.applies_To_Destination ||
          data.applies_To_Destination?.toLowerCase().includes(filters.applies_To_Destination.toLowerCase())) &&

        (!filters.price_Range_From || (data.price_Range_From !== null && data.price_Range_From !== undefined && +data.price_Range_From >= +filters.price_Range_From)) &&

        (!filters.price_Range_To || (data.price_Range_To !== null && data.price_Range_To !== undefined && +data.price_Range_To <= +filters.price_Range_To))
      );
    };

    this.dataSource.filter = JSON.stringify(filterValues); // This triggers filterPredicate

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  /** Active edit target. When non-null, onSubmit calls updateBookingLimit
   *  instead of addBookingLimit. */
  editingId: number | null = null;

  /** Populate the form with an existing row's values to begin editing. */
  startEdit(row: any): void {
    this.editingId = row.id;
    // The BACKEND field name is `Limit_Type` (Pascal_Snake_Case in C#) but the
    // FORM control is `limit_type` (lowercase). System.Text.Json camelCases on
    // wire so `row.limit_Type` is what arrives. Handle both gracefully.
    this.dataForm.patchValue({
      limit_type: row.limit_Type ?? row.limit_type ?? '',
      restriction_Type: row.restriction_Type ?? '',
      applies_To_Airline: row.applies_To_Airline ?? '',
      applies_To_Destination: row.applies_To_Destination ?? '',
      effective_from: row.effective_From ? new Date(row.effective_From) : '',
      effective_to:   row.effective_To   ? new Date(row.effective_To)   : '',
      price_Range_From: row.price_Range_From ?? '',
      price_Range_To:   row.price_Range_To   ?? '',
    });
    setTimeout(() => document.querySelector('app-admin-limitations form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  /** Exit edit mode without saving changes. */
  cancelEdit(): void {
    this.editingId = null;
    this.dataForm.reset();
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      const formValue = { ...this.dataForm.value };

      const optionalFields = [
        'effective_from',
        'effective_to',
        'price_Range_From',
        'price_Range_To'
      ];

      optionalFields.forEach(field => {
        if (formValue[field] === '' || formValue[field] === undefined) {
          formValue[field] = null;
        }
      });

      if (formValue['effective_from'] instanceof Date) {
        formValue['effective_from'] = formValue['effective_from'].toISOString();
      }
      if (formValue['effective_to'] instanceof Date) {
        formValue['effective_to'] = formValue['effective_to'].toISOString();
      }

      const isEdit = this.editingId !== null;
      const obs = isEdit
        ? this.UtilityService.updateBookingLimit(this.editingId as number, formValue)
        : this.UtilityService.addBookingLimit(formValue);

      obs.subscribe({
        next: () => {
          alert(isEdit ? 'Booking limit updated successfully.' : 'Booking limit added successfully.');
          this.dataForm.reset();
          this.editingId = null;
          this.fetchLimits(); // refresh table
        },
        error: (err: any) => {
          console.error('Error saving booking limit:', err);
          alert(isEdit ? 'Failed to update booking limit.' : 'Failed to add booking limit.');
        }
      });
    } else {
      alert('Please fill in all required fields.');
    }
  }
  resetFilters() {
    this.filterForm.reset();
    this.dataSource.filter = '';
  }

  DeleteLimit(id: number) {
    if (confirm("Are you sure you want to delete this limit?")) {
      this.UtilityService.deleteLimit(id).subscribe({
        next: () => {
          alert("Limit deleted successfully.");
          this.fetchLimits(); // Refresh the list after deletion
        },
        error: (err: any) => {
          console.error("Error deleting limit:", err);
          alert("Failed to delete limit.");
        }
      });
    }
  }
  filterOptions(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;

    if (input && input.value) {
      if (type === 'departure') {
        this.filteredDepartureOptions = this.options.filter(
          (option: any) =>
            option.name.toLowerCase().includes(input.value.toLowerCase()) ||
            option.code.toLowerCase().includes(input.value.toLowerCase())
        );
      } else if (type === 'airline') {
        this.filteredAirlineOptions = this.flightoptions.filter(
          (option: any) =>
            option.name.toLowerCase().includes(input.value.toLowerCase()) ||
            option.code.toLowerCase().includes(input.value.toLowerCase())
        );
      }
    }
  }

  selectOption(code: string, type: string): void {
    if (type === 'departure') {
      this.selectedDepartureCode = code;
      this.dataForm.patchValue({ applies_To_Destination: code });
    } else if (type === 'airline') {
      this.selectedAirlineCode = code;
      this.dataForm.patchValue({ applies_To_Airline: code });
    }
  }
}
