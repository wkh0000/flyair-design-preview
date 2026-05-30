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
import { ReactiveFormsModule } from '@angular/forms';
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
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [MatInputModule,CommonModule, ReactiveFormsModule, MatButtonModule,MatCheckboxModule,MatFormFieldModule,MatDatepickerModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss'
})
export class AdminProfileComponent implements OnInit {
  isFormDisabled = true;
  form: FormGroup;
  companyData: any[] = [];
  page: string = 'Company Profile';
  showLoader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      company_id: [''],
      companyName: ['', Validators.required],
      regNo: ['', Validators.required],
      iata: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      country: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  ngOnInit(): void {

    this.companyData = [
      {
        company_id: environment.company.company_id,
        companyName: environment.company.companyName,
        regNo: environment.company.regNo,
        iata: environment.company.iata,
        address: environment.company.address,
        city: environment.company.city,
        district: environment.company.district,
        country: environment.company.country,
        email: environment.company.email,
        phone: environment.company.phone,
      }
    ];

    this.populateFormWithData();  // ✅ Ensure this is called

    if (this.isFormDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }

    this.form.patchValue(this.companyData);
  }

  toggleFormEditable() {
    this.isFormDisabled = !this.isFormDisabled;
    if (this.isFormDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  onSubmit() {
    this.toggleFormEditable();
    const formData = this.form.value;
  }

  populateFormWithData() {
    if (this.companyData.length > 0) {
      const currentCompany = this.companyData[0];

      this.form.patchValue({
        company_id: currentCompany.company_id || '',
        companyName: currentCompany.companyName || '',
        regNo: currentCompany.regNo || '',
        iata: currentCompany.iata || '',
        address: currentCompany.address || '',
        city: currentCompany.city || '',
        district: currentCompany.district || '',
        country: currentCompany.country || '',
        email: currentCompany.email || '',
        phone: currentCompany.phone || '',
      });
    }
  }
}
