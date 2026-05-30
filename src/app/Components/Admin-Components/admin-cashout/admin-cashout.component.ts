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

export interface Cashout {
  id: number;
  pnr: string;
  amount: number;
  date: string; // Can also be Date type
  discountApplied: boolean;
}

@Component({
  selector: 'app-admin-cashout',
  standalone: true,
  imports: [MatFormFieldModule,MatIconModule,MatButtonModule,MatDatepickerModule,MatInputModule,MatCheckboxModule,MatTableModule,MatPaginatorModule,MatSortModule,CommonModule],
  templateUrl: './admin-cashout.component.html',
  styleUrl: './admin-cashout.component.scss'
})
export class AdminCashoutComponent {
  isFormDisabled: boolean = true;
  page: string = 'cashout';
  isAdd: boolean = true;
  cashoutData: any[] = [];
  displayedColumns: string[] = ['id', 'pnr', 'amount', 'date', 'discountApplied', 'actions'];
  cashoutForm: FormGroup;
  showLoader: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder) {
    this.cashoutForm = this.fb.group({
      id: [''],
      pnr: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      discountApplied: [false]
    });
  }

  dataSource = new MatTableDataSource<Cashout>([
    {
      id: 1,
      pnr: 'PNR001',
      amount: 500,
      date: '2025-06-01',
      discountApplied: true
    },
    {
      id: 2,
      pnr: 'PNR002',
      amount: 300,
      date: '2025-12-01',
      discountApplied: false
    },
    {
      id: 3,
      pnr: 'PNR003',
      amount: 700,
      date: '2025-11-25',
      discountApplied: true
    },
    {
      id: 4,
      pnr: 'PNR004',
      amount: 200,
      date: '2025-12-01',
      discountApplied: false
    }
  ]);

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
    const formData = this.cashoutForm.value;
    this.isAdd = true;
    this.isFormDisabled = true;
    if (this.cashoutForm.get('id')?.value) {
      // this.updateCashout();
    } else {
      // this.addCashout();
    }
  }

  showForm() {
    this.isAdd = false;
    this.isFormDisabled = false;
  }

  toggleFormEditable() {
    this.isAdd = true;
    this.isFormDisabled = true;
    this.cashoutForm.reset();
  }
}
