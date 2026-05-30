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
      minAmount: [''],
      maxAmount: [''],
      applyFrom: [''],
      applyTo: ['']
    });
    this.dataForm = this.fb.group({
      markup_Name: ['', Validators.required],
      markup_Type: ['', Validators.required],
      value: ['', Validators.required],
      applies_To_Destination: [''],   // optional
      applies_To_Airline: [''],       // optional
      effective_From: [''],           // optional
      effective_To: [''],             // optional
      price_Range_From: [''],         // optional
      price_Range_To: ['']            // optional
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
  onSubmit(): void {
    if (this.dataForm.valid) {
      const formValue = { ...this.dataForm.value };

      // Convert empty strings to null for optional fields
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

      this.utilityService.addMarkups(formValue).subscribe({
        next: (response) => {
          alert('Booking Markup added successfully.');
          this.dataForm.reset();
          this.fetchMarkups();
        },
        error: (err: any) => {
          console.error('Error adding booking Markup:', err);
          alert('Failed to add booking Markup.');
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

  selectOption(option: any, type: string): void {
    if (type === 'departure') {
      this.selectedDeparture = option.name;
      this.selectedDepartureCode = option.code;
    } else if (type === 'airline') {
      this.selectedAirline = option.name;
      this.selectedAirlineCode = option.code;
    }
  }
}
