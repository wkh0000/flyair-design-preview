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
import { MatIconModule } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  UtilityServiceService

} from '../../../Services/Admin-Services/UtilityService/utility-service.service';
export interface Promotion {
  promotion_Type: 'Tax' | 'Total' | 'Base';
  promotion_id: number;
  promotion_Name: string;
  start_date?: string;
  end_date?: string;
  amount: number;
  applies_To_Destination?: string | null;
  applies_To_Airline?: string | null;
  minval?: number;
  maxval?: number;
}

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [MatNativeDateModule, MatAccordion, MatAutocompleteModule, MatSelectModule, MatExpansionModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatButtonModule, MatDatepickerModule, MatInputModule, MatCheckboxModule, MatTableModule, MatPaginatorModule, MatSortModule, CommonModule],
  templateUrl: './admin-promotions.component.html',
  styleUrl: './admin-promotions.component.scss'
})
export class AdminPromotionsComponent implements AfterViewInit {
  isFormDisabled: boolean = true;
  isAdd: boolean = true;
  displayedColumns: string[] = [
    'id',
    'image',
    'promotion_Name',
    'promotion_Type',
    'applies_To_Destination',
    'applies_To_Airline',
    'minVal',
    'maxVal',
    'startDate',
    'endDate',
    'amount',
    'actions',
  ];
  // Marketing-image upload state
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploading: boolean = false;
  dataSource = new MatTableDataSource<Promotion>([]);
  promotionForm: FormGroup;
  dataForm: FormGroup;
  promotionTypes: string[] = ['Fixed', 'Percentage']; // Add your required options
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private UtilityService: UtilityServiceService, private http: HttpClient) {
    this.promotionForm = this.fb.group({
      airline: [''],
      destination: [''],
      minAmount: [''],
      maxAmount: [''],
      applyFrom: [''],
      applyTo: ['']
    });
    // Fix 1 — form field names to match API response (capital F and T)
    this.dataForm = this.fb.group({
      promotion_Name: ['', Validators.required],
      promotion_Type: ['', Validators.required],
      applies_To_Destination: [''],
      applies_To_Airline: [''],
      price_Range_From: [''],
      price_Range_To: [''],
      effective_From: [''],
      effective_To: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      // Marketing fields — Title/Subtitle drive the card copy on the consumer
      // home page; Image_Url is set automatically when an image is uploaded.
      title: [''],
      subtitle: [''],
      image_Url: [''],
      // Detail page fields. Slug auto-derives from Title client-side so the
      // admin sees the URL preview; backend will also dedupe before save.
      slug: [''],
      detail_Content: [''],
      // Wide banner image for the /promotions/:slug detail page. Optional —
      // when missing, the detail page falls back to image_Url (the card image).
      detail_Image_Url: [''],
    });
  }

  /** Active edit target. Non-null → onSubmit calls updatePromotion. */
  editingId: number | null = null;
  /** Preview of the saved detail-page banner during edit. */
  detailImagePreview: string | null = null;
  uploadingDetail: boolean = false;

  /** Begin editing an existing promotion — populate every field including
   *  the two image previews so the admin sees the current state. */
  startEdit(row: any): void {
    this.editingId = row.id;
    this.dataForm.patchValue({
      promotion_Name: row.promotion_Name ?? '',
      promotion_Type: row.promotion_Type ?? '',
      amount: row.amount ?? '',
      applies_To_Destination: row.applies_To_Destination ?? '',
      applies_To_Airline: row.applies_To_Airline ?? '',
      price_Range_From: row.price_Range_From ?? '',
      price_Range_To: row.price_Range_To ?? '',
      effective_From: row.effective_From ? new Date(row.effective_From) : '',
      effective_To:   row.effective_To   ? new Date(row.effective_To)   : '',
      title: row.title ?? '',
      subtitle: row.subtitle ?? '',
      image_Url: row.image_Url ?? '',
      detail_Image_Url: row.detail_Image_Url ?? '',
      slug: row.slug ?? '',
      detail_Content: row.detail_Content ?? '',
    });
    // Re-show existing images as the preview so admin can see what's saved.
    this.imagePreview = row.image_Url || null;
    this.detailImagePreview = row.detail_Image_Url || null;
    this.lastTitleSeen = row.title ?? '';
    setTimeout(() => document.querySelector('app-admin-promotions form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  /** Exit edit mode without saving — clear form + previews. */
  cancelEdit(): void {
    this.editingId = null;
    this.dataForm.reset();
    this.removeImage();
    this.removeDetailImage();
  }

  /** Handle the SECOND file picker (wide detail-page banner). Uploads to the
   *  same backend endpoint as the card image, stores the URL on the form. */
  onDetailImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => this.detailImagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
    const fd = new FormData();
    fd.append('file', file);
    this.uploadingDetail = true;
    this.http.post<{ url: string }>('/api/AdminUtility/promotions/upload-image', fd).subscribe({
      next: r => { this.dataForm.patchValue({ detail_Image_Url: r.url }); this.uploadingDetail = false; },
      error: () => { alert('Detail image upload failed.'); this.uploadingDetail = false; this.detailImagePreview = null; }
    });
  }

  /** Clear the wide detail-page banner. */
  removeDetailImage(): void {
    this.detailImagePreview = null;
    this.dataForm.patchValue({ detail_Image_Url: '' });
  }

  /** Slug autocomplete — admin can override but by default mirrors the title.
   *  Bound to the Title input's (input) so it updates as you type. */
  onTitleChange(): void {
    const t = (this.dataForm.value.title || '').trim();
    const currentSlug = (this.dataForm.value.slug || '').trim();
    // Only auto-fill while the slug is empty OR clearly still a derivative of
    // the title (avoids clobbering an admin-customised slug).
    if (!currentSlug || currentSlug === this.sluggify(this.lastTitleSeen)) {
      this.dataForm.patchValue({ slug: this.sluggify(t) });
    }
    this.lastTitleSeen = t;
  }
  /** Local last-seen title so onTitleChange knows when to stop auto-filling. */
  private lastTitleSeen = '';

  /** Mirrors the backend Sluggify — lowercase, dashes, alphanumeric only. */
  private sluggify(s: string): string {
    if (!s) return '';
    let out = ''; let prev = '-';
    for (const ch of s.toLowerCase()) {
      if (/[a-z0-9]/.test(ch)) { out += ch; prev = ch; }
      else if (prev !== '-')   { out += '-'; prev = '-'; }
    }
    return out.replace(/^-+|-+$/g, '');
  }

  /** Rich-text editor command bar buttons. */
  execEditor(cmd: string, value?: string): void {
    // document.execCommand is legacy but still works universally for simple
    // formatting in contenteditable and avoids pulling a 200KB WYSIWYG dep.
    document.execCommand(cmd, false, value);
    // Sync the contenteditable HTML into the form so it persists on submit.
    const editor = document.querySelector('.promo-detail-editor') as HTMLElement | null;
    if (editor) this.dataForm.patchValue({ detail_Content: editor.innerHTML });
  }
  /** (input) handler on the contenteditable to keep form in sync. */
  onEditorInput(ev: Event): void {
    const el = ev.target as HTMLElement;
    this.dataForm.patchValue({ detail_Content: el.innerHTML });
  }

  /** Prompt for a URL and wrap the selection in an <a>. Split out so it
   *  doesn't pollute the template (Angular's strict-mode template type
   *  checker rejects unknown globals like `prompt`). */
  insertLink(): void {
    const url = window.prompt('URL', 'https://');
    if (!url) return;
    this.execEditor('createLink', url);
  }

  /** File-input change handler: read selection, show local preview, upload
   * to backend, and stash the returned URL on the form. Image is optional —
   * promotions without an image stay backend-only and don't render a card. */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.selectedFile = file;
    // Local preview before upload
    const reader = new FileReader();
    reader.onload = e => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
    // Upload to the backend
    const fd = new FormData();
    fd.append('file', file);
    this.uploading = true;
    this.http.post<{ url: string }>('/api/AdminUtility/promotions/upload-image', fd).subscribe({
      next: r => { this.dataForm.patchValue({ image_Url: r.url }); this.uploading = false; },
      error: () => { alert('Image upload failed.'); this.uploading = false; this.selectedFile = null; this.imagePreview = null; }
    });
  }

  /** Clear a selected/uploaded image — useful before submitting if user changes mind. */
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.dataForm.patchValue({ image_Url: '' });
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

  fetchPromotions() {
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

  // Fix 3 — format dates before submit
  onSubmit(): void {
    if (this.dataForm.valid) {
      const formValue = { ...this.dataForm.value };

      // Convert empty strings to null
      const optionalFields = [
        'applies_To_Destination',
        'applies_To_Airline',
        'effective_From',
        'effective_To',
        'price_Range_From',
        'price_Range_To',
        'title',
        'subtitle',
        'image_Url',
        'detail_Image_Url',
        'slug',
        'detail_Content'
      ];
      optionalFields.forEach(field => {
        if (formValue[field] === '' || formValue[field] === undefined) {
          formValue[field] = null;
        }
      });

      // Format dates to ISO string
      if (formValue['effective_From'] instanceof Date) {
        formValue['effective_From'] = formValue['effective_From'].toISOString();
      }
      if (formValue['effective_To'] instanceof Date) {
        formValue['effective_To'] = formValue['effective_To'].toISOString();
      }

      const isEdit = this.editingId !== null;
      const obs = isEdit
        ? this.UtilityService.updatePromotion(this.editingId as number, formValue)
        : this.UtilityService.addPromotion(formValue);
      obs.subscribe({
        next: () => {
          alert(isEdit ? 'Promotion updated successfully.' : 'Promotion added successfully.');
          this.dataForm.reset();
          this.editingId = null;
          this.removeImage();
          this.removeDetailImage();
          this.fetchPromotions(); // refresh table
        },
        error: (err: any) => {
          console.error('Error saving promotion:', err);
          alert(isEdit ? 'Failed to update promotion.' : 'Failed to add promotion.');
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
        error: (err: any) => {
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

  // Fix 2 — selectOption saves CODE not full name
  selectOption(code: string, type: string): void {
    if (type === 'departure') {
      this.selectedDepartureCode = code;
      this.dataForm.patchValue({ applies_To_Destination: code }); // saves "MAA"
    } else if (type === 'airline') {
      this.selectedAirlineCode = code;
      this.dataForm.patchValue({ applies_To_Airline: code }); // saves "UL"
    }
  }
}
