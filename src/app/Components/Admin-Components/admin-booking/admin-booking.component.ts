import {
  Component,
  ViewChild,
} from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

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
import { UtilityServiceService } from '../../../Services/Admin-Services/UtilityService/utility-service.service';

export interface Booking {
  customerID: number;
  customerName: string;
  bookingDate: string; // Can also be Date type
  contact: string; // Changed from "membership_end_date"
  email: string;
}

@Component({
  selector: 'app-admin-booking',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule,MatIconModule,MatButtonModule,MatDatepickerModule,MatInputModule,MatCheckboxModule,MatTableModule,MatPaginatorModule,MatSortModule,CommonModule],
  templateUrl: './admin-booking.component.html',
  styleUrl: './admin-booking.component.scss'
})
export class AdminBookingComponent {
  filterForm: FormGroup;
// Add this inside your component class
displayedColumns: string[] = [
  'id', 
  'tripType', 
  'origin', 
  'destination', 
  'passengers', 
  'pnr', 
  'amount', // Make sure these match the HTML exactly
  'date', 
  'time'
];  dataSource = new MatTableDataSource<Booking>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder,
  private utilityService:UtilityServiceService
  ) {
    this.filterForm = this.fb.group({
      origin: [''],
      destination: [''],
      tripType: ['']
    });
  }


  ngOnInit(): void {
    this.fetchBooking();
  }

  fetchBooking(){
    this.utilityService.fetchBooking().subscribe({
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
}
