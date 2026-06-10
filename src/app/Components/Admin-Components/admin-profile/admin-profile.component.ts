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
import { PageService } from '../../../Services/Page/page.service';


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
    private snackBar: MatSnackBar,
    private pages: PageService
  ) {
    this.form = this.fb.group({
      company_id: [''],
      companyName: ['', Validators.required],
      regNo: [''],   // optional — may be blank for the consumer brand entity
      iata: [''],    // optional + never surfaced publicly
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

    this.populateFormWithData();  // baseline from environment.company

    // Overlay the saved admin override (persisted via the Pages CMS store)
    // so edits survive reloads. Falls back to the environment baseline.
    this.pages.get('company-profile').subscribe({
      next: (o: any) => {
        if (o && (o.companyName || o.email || o.regNo)) {
          this.companyData = [{ ...this.companyData[0], ...o }];
          this.form.patchValue(this.companyData[0]);
        }
      },
      error: () => { /* keep environment baseline */ },
    });

    if (this.isFormDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  toggleFormEditable() {
    this.isFormDisabled = !this.isFormDisabled;
    if (this.isFormDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  /** Enter edit mode. */
  startEdit(): void {
    this.isFormDisabled = false;
    this.form.enable();
  }

  /** Persist the company profile via the Pages CMS store so edits survive
   *  reloads and feed the public footer. (Previously onSubmit discarded the
   *  value and only toggled edit mode — the editor did nothing.) */
  onSubmit() {
    if (this.form.invalid) {
      this.snackBar.open('Please fill in all required fields.', 'Close', { duration: 3000 });
      return;
    }
    this.showLoader = true;
    this.pages.save('company-profile', this.form.value).subscribe({
      next: () => {
        this.showLoader = false;
        this.companyData = [{ ...this.form.value }];
        this.isFormDisabled = true;
        this.form.disable();
        this.snackBar.open('Company profile saved.', 'Close', { duration: 3000 });
      },
      error: () => {
        this.showLoader = false;
        this.snackBar.open('Could not save company profile. Please try again.', 'Close', { duration: 4000 });
      },
    });
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
