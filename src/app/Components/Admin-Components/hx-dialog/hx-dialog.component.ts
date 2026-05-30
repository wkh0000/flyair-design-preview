import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UtilityServiceService } from '../../../Services/Admin-Services/UtilityService/utility-service.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-hx-dialog',
  standalone: true,
  imports: [MatDialogActions,MatDialogClose,MatDialogContent,MatFormFieldModule,MatButtonModule,MatRadioModule,FormsModule,CommonModule,MatInputModule],
  templateUrl: './hx-dialog.component.html',
  styleUrl: './hx-dialog.component.scss'
})
export class HxDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<HxDialogComponent>);
  selectedOption: number | null = 0;
  option: any;

  constructor(private http:HttpClient, private utilityService:UtilityServiceService){
  }

  ngOnInit(): void {
    this.utilityService.fetchContent().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.option = data; // Store the entire array
        } else {
          this.option = []; // Ensure it's an array to avoid errors
        }
      },
      error: (err) => {
        console.error("Error fetching content:", err);
      }
    });
  }

  onConfirm(): void {
    if (this.selectedOption !== null) {
      const Id = this.option?.[0]?.id;
      if (Id) {
        this.utilityService.updateHXValue(Id, this.selectedOption)
          .subscribe(
            (response) => {
              this.dialogRef.close(this.selectedOption);
            },
            (error) => {
              console.error('Error updating content type', error);
            }
          );
      }
    }
  }
}
