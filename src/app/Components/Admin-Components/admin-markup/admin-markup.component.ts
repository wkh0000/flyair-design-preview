import { UtilityService } from './../../../Services/Utility/utility.service';
import {
  AfterViewInit,
  Component,
  ViewChild,
} from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
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
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilityServiceService } from '../../../Services/Admin-Services/UtilityService/utility-service.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
// Updated Markup interface
export interface Markup {
  id: number;
  markup_Name: string;
  markup_Type: 'Tax' | 'Total' | 'Base';
  value: number;
  applies_To_Airline?: string | null;
  applies_To_Destination?: string | null;
  effective_From?: string | null;
  effective_To?: string | null;
  price_Range_From?: number | null;
  price_Range_To?: number | null;
}

@Component({
  selector: 'app-admin-markup',
  standalone: true,
  imports: [MatFormFieldModule, MatAccordion, MatAutocompleteModule, ReactiveFormsModule, MatExpansionModule, MatSelectModule, MatIconModule, MatButtonModule, MatDatepickerModule, MatInputModule, MatCheckboxModule, MatTableModule, MatPaginatorModule, MatSortModule, CommonModule],
  templateUrl: './admin-markup.component.html',
  styleUrl: './admin-markup.component.scss'
})
export class AdminMarkupComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'id', 'markup_Name', 'markup_Type', 'value',
    'applies_To_Destination', 'applies_To_Airline', 'effective_From', 'effective_To',
    'price_Range_From', 'price_Range_To', 'actions'
  ];

  dataSource = new MatTableDataSource<Markup>([]);
  filterForm: FormGroup;
  dataForm: FormGroup;
  markupTypes: string[] = ['Fixed', 'Percentage']; // Add your required options
  options: { name: string; code: string }[] = [];
  flightoptions: { name: string; code: string }[] = [];
  filteredOptions: { name: string; code: string }[] = [...this.options];
  filteredflights: { name: string; code: string }[] = [...this.flightoptions];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  selectedDeparture: string | null = null;
  selectedDepartureCode: string | null = null;
  selectedAirline: string | null = null;
  selectedAirlineCode: string | null = null;
  filteredDepartureOptions: any[] = [];
  filteredAirlineOptions: any[] = [];
  constructor(private fb: FormBuilder, private utilityService: UtilityServiceService, private http: HttpClient
  ) {
    this.filterForm = this.fb.group({
      airline: [''],
      destination: [''],
      minAmount: [null],
      maxAmount: [null],
      applyFrom: [''],
      applyTo: ['']
    });
    this.dataForm = this.fb.group({
      markup_Name: ['', Validators.required],
      markup_Type: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0)]],
      applies_To_Destination: [''],  
      applies_To_Airline: [''],   
      effective_From: [''],          
      effective_To: [''],             
      price_Range_From: [''],         
      price_Range_To: ['']            
    });
  }

  ngOnInit(): void {
    this.fetchMarkups();
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

  fetchMarkups() {
    this.utilityService.fetchMarkups().subscribe({
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  resetFilters() {
    this.filterForm.reset();
    this.dataSource.filter = '';
  }

  // Fix the selectOption to save just the CODE:
  selectOption(code: string, type: string): void {
    if (type === 'departure') {
      this.selectedDepartureCode = code;
      this.dataForm.patchValue({ applies_To_Destination: code }); // saves "MAA" not full name
    } else if (type === 'airline') {
      this.selectedAirlineCode = code;
      this.dataForm.patchValue({ applies_To_Airline: code }); // saves "UL" not full name
    }
  }
  private formatDate(date: Date): string {
    const istDate = new Date(date.getTime() + (5 * 3600 + 30 * 60) * 1000);
    const dateString = istDate.toISOString().slice(0, 10);
    return dateString;
  }
  /** When set, onSubmit() calls updateMarkup(id) instead of addMarkups(). */
  editingId: number | null = null;

  /** Pop the existing row's values into the form for editing. */
  startEdit(row: any): void {
    this.editingId = row.id;
    this.dataForm.patchValue({
      markup_Name: row.markup_Name ?? '',
      markup_Type: row.markup_Type ?? '',
      value: row.value ?? '',
      applies_To_Destination: row.applies_To_Destination ?? '',
      applies_To_Airline: row.applies_To_Airline ?? '',
      price_Range_From: row.price_Range_From ?? '',
      price_Range_To: row.price_Range_To ?? '',
      effective_From: row.effective_From ? new Date(row.effective_From) : '',
      effective_To:   row.effective_To   ? new Date(row.effective_To)   : '',
    });
    // Scroll back to the form so the admin sees it without hunting.
    setTimeout(() => document.querySelector('app-admin-markup form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  /** Exit edit mode without saving. */
  cancelEdit(): void {
    this.editingId = null;
    this.dataForm.reset();
  }

  // Fix onSubmit to format dates properly before sending — also branches
  // on editingId so the same form handles both Add and Update.
  onSubmit(): void {
    if (this.dataForm.valid) {
      const formValue = { ...this.dataForm.value };

      const optionalFields = [
        'applies_To_Destination',
        'applies_To_Airline',
        'effective_From',
        'effective_To',
        'price_Range_From',
        'price_Range_To'
      ];

      optionalFields.forEach(field => {
        if (formValue[field] === '' || formValue[field] === undefined) {
          formValue[field] = null;
        }
      });

      // Format dates to ISO string (strips time zone issues)
      if (formValue['effective_From'] instanceof Date) {
        formValue['effective_From'] = formValue['effective_From'].toISOString();
      }
      if (formValue['effective_To'] instanceof Date) {
        formValue['effective_To'] = formValue['effective_To'].toISOString();
      }

      // Branch: update if editing an existing row, add otherwise.
      const isEdit = this.editingId !== null;
      const obs = isEdit
        ? this.utilityService.updateMarkup(this.editingId as number, formValue)
        : this.utilityService.addMarkups(formValue);

      obs.subscribe({
        next: () => {
          alert(isEdit ? 'Booking Markup updated successfully.' : 'Booking Markup added successfully.');
          this.dataForm.reset();
          this.editingId = null;
          this.fetchMarkups();
        },
        error: (err: any) => {
          console.error('Error saving booking Markup:', err);
          alert(isEdit ? 'Failed to update Markup.' : 'Failed to add booking Markup.');
        }
      });
    } else {
      alert('Please fill in all required fields.');
    }
  }

  DeleteLimit(id: number) {
    if (confirm("Are you sure you want to delete this Markup?")) {
      this.utilityService.deleteMarkups(id).subscribe({
        next: () => {
          alert("Markup deleted successfully.");
          this.fetchMarkups(); // Refresh the list after deletion
        },
        error: (err: any) => {
          console.error("Error deleting Markup:", err);
          alert("Failed to delete Markup.");
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
}
