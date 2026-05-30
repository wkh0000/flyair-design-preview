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
import {MatIconModule} from '@angular/material/icon';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilityServiceService } from '../../../Services/Admin-Services/UtilityService/utility-service.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
interface BlogPost {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
}


@Component({
  selector: 'app-admin-cms',
  standalone: true,
  imports: [MatFormFieldModule,MatAccordion,MatAutocompleteModule, ReactiveFormsModule, MatExpansionModule,MatSelectModule,MatIconModule,MatButtonModule,MatDatepickerModule,MatInputModule,MatCheckboxModule,MatTableModule,MatPaginatorModule,MatSortModule,CommonModule],
  templateUrl: './admin-cms.component.html',
  styleUrl: './admin-cms.component.scss'
})
export class AdminCmsComponent {
displayedColumns: string[] = [
    'id', 'title', 'description',
    'price', 'imageUrl', 'actions'
  ];
  selectedImageFile: File | null = null;
  dataSource = new MatTableDataSource<BlogPost>([]);
  filterForm: FormGroup;
  selectedFileName: string = '';
base64Image: string = '';
  blogForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private utilityService:UtilityServiceService, private http: HttpClient
  ) {
    this.filterForm = this.fb.group({
      title: [''],
    });
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, Validators.required],
      image: [''],
    });
  }

  ngOnInit(): void {
    this.fetchMarkups();
  }

  fetchMarkups(){
    this.utilityService.fetchCMS().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error("Error fetching limits:", err);
      }
    });
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.base64Image = (reader.result as string); // Remove data:image/jpeg;base64,
    };
    reader.readAsDataURL(file);
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
    if (this.blogForm.valid && this.base64Image) {
      const blogData = {
        title: this.blogForm.value.title,
        description: this.blogForm.value.description,
        price: this.blogForm.value.price,
        base64Image: this.base64Image  // 👈 Send image
      };

      this.utilityService.addCMS(blogData).subscribe({
        next: () => {
          alert('Content added successfully.');
          this.blogForm.reset();
          this.selectedFileName = '';
          this.base64Image = '';
          this.fetchMarkups();
        },
        error: (err) => {
          console.error('Error adding blog:', err);
          alert('Failed to add blog.');
        }
      });
    } else {
      alert('Please fill all fields and select an image.');
    }
  }



  DeleteLimit(id: number) {
    if (confirm("Are you sure you want to delete this Content?")) {
      this.utilityService.deleteContent(id).subscribe({
        next: () => {
          alert("Content deleted successfully.");
          this.fetchMarkups(); // Refresh the list after deletion
        },
        error: (err:any) => {
          console.error("Error deleting Content:", err);
          alert("Failed to delete Content.");
        }
      });
    }
  }

  // filterOptions(event: Event, type: string): void {
  //   const input = event.target as HTMLInputElement;

  //   if (input && input.value) {
  //       this.title = this.options.filter(
  //         (option: any) =>
  //           option.name.toLowerCase().includes(input.value.toLowerCase()) ||
  //           option.code.toLowerCase().includes(input.value.toLowerCase())
  //       );
  //   }
  // }
}

