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

import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';  // ✅ Import this
import { MatPaginatorModule } from '@angular/material/paginator';  // ✅ If using pagination
import { MatSortModule } from '@angular/material/sort';  // ✅ If sorting is enabled
import { MatInputModule } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UtilityServiceService

 } from '../../../Services/Admin-Services/UtilityService/utility-service.service';
export interface Promotion {
  promotion_id: number;
  promotion_name: string;
  start_date: string;
  end_date: string;
  discount_percentage: number;
  status: number;
  applyToDestination: { destinations: string };
  applyToAirline: { airlines: string };
  minval: number;
  maxval: number;
}

export interface Limitation {
  id: number;
  limit_name: string;
  limit_type: string;
  airline: string;
  destination: string;
  from: string;
  to: string;
  minvalue: number;
  maxvalue: number;
  status: boolean;
}

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [MatNativeDateModule,MatAccordion, MatAutocompleteModule, MatSelectModule, MatExpansionModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatButtonModule,MatDatepickerModule,MatInputModule,MatCheckboxModule,MatTableModule,MatPaginatorModule,MatSortModule,CommonModule],
  templateUrl: './admin-promotions.component.html',
  styleUrl: './admin-promotions.component.scss'
})
export class AdminPromotionsComponent implements AfterViewInit {
  isFormDisabled: boolean = true;
  isAdd: boolean = true;
  displayedColumns: string[] = [
    'id',
    'name',
    'applyToDestination',
    'applyToAirline',
    'minVal',
    'maxVal',
    'startDate',
    'endDate',
    'percentage',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Promotion>([]);
  promotionForm: FormGroup;
  dataForm: FormGroup;
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
  promotionTypes: string[] = ['Fixed', 'Percentage']; // Add your required options
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private UtilityService:UtilityServiceService, private http: HttpClient) {
    this.promotionForm = this.fb.group({
      promotion_id: [''],
      promotion_name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      discount_percentage: ['', Validators.required],
      status: [false],
    });
    this.dataForm = this.fb.group({
      promo_name: ['', Validators.required],
      promo_type: ['', Validators.required],
      applies_To_Destination: ['', Validators.required],
      applies_To_Airline: ['', Validators.required],
      price_Range_From: ['', [Validators.required, Validators.min(0)]],
      price_Range_To: ['', [Validators.required, Validators.min(0)]],
      effective_from: ['', Validators.required],
      effective_to: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
    });
  }


  ngOnInit(): void {
    this.fetchPromotions();
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fetchPromotions(){
    this.UtilityService.fetchPromotions().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error("Error fetching promotions:", err);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  showForm() {
    this.isAdd = false;
    this.isFormDisabled = false;
  }

  toggleFormEditable() {
    this.isAdd = true;
    this.isFormDisabled = true;
    this.promotionForm.reset();
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      this.UtilityService.addPromotion(this.dataForm.value).subscribe({
        next: (response) => {
          alert('Booking promotion added successfully.');
          this.dataForm.reset();
        },
        error: (err: any) => {
          console.error('Error adding booking promotion:', err);
          alert('Failed to add booking promotion.');
        }
      });
    } else {
      alert('Please fill in all required fields.');
    }
  }

  resetFilters() {
    this.promotionForm.reset();
    this.dataSource.filter = '';
  }

  DeletePromotion(id: number) {
    if (confirm("Are you sure you want to delete this promotion?")) {
      this.UtilityService.deletePromotions(id).subscribe({
        next: () => {
          alert("promotion deleted successfully.");
          this.fetchPromotions(); // Refresh the list after deletion
        },
        error: (err:any) => {
          console.error("Error deleting promotion:", err);
          alert("Failed to delete promotion.");
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
