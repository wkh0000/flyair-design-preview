import {
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
import { UtilityServiceService } from '../../../Services/Admin-Services/UtilityService/utility-service.service';

export interface Customer {
  customerID: number;
  customerName: string;
  bookingDate: string; // Can also be Date type
  contact: string; // Changed from "membership_end_date"
  email: string;
}

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [MatFormFieldModule,MatIconModule,MatButtonModule,MatDatepickerModule,MatInputModule,MatCheckboxModule,MatTableModule,MatPaginatorModule,MatSortModule,CommonModule],
  templateUrl: './admin-customers.component.html',
  styleUrl: './admin-customers.component.scss'
})
export class AdminCustomersComponent {
  isFormDisabled: boolean = true;
  page: string = 'customer';
  isAdd: boolean = true;
  customerData: any[] = [];
  displayedColumns: string[] = [
    'customerID',
    'customerName',
    'bookingDate',
    'contact',
    'email',
  ];
  dataSource = new MatTableDataSource<Customer>([]);
  customerForm: FormGroup;
  showLoader: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private utilityService:UtilityServiceService
  ) {
    this.customerForm = this.fb.group({
      customer_id: [''],
      customer_name: ['', Validators.required],
      registration_date: ['', Validators.required],
      contact: ['', Validators.required],
      email: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchCustomer();
  }

  fetchCustomer(){
    this.utilityService.fetchCustomer().subscribe({
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


  onSubmit() {
    const formData = this.customerForm.value;
    this.isAdd = true;
    this.isFormDisabled = true;
    if (this.customerForm.get('promotion_id')?.value) {
      // this.updatePromotion();
    } else {
      // this.addPromotion();
    }
  }

  showForm() {
    this.isAdd = false;
    this.isFormDisabled = false;
  }

  toggleFormEditable() {
    this.isAdd = true;
    this.isFormDisabled = true;
    this.customerForm.reset();
  }


}
