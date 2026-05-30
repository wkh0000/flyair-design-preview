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

@Component({
  selector: 'app-item-dialog',
  standalone: true,
  imports: [MatDialogActions,MatDialogClose,MatDialogContent,MatButtonModule,MatRadioModule,FormsModule,CommonModule],
  templateUrl: './item-dialog.component.html',
  styleUrl: './item-dialog.component.scss'
})
export class ItemDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ItemDialogComponent>);
  selectedOption: any;
  option: any;

  constructor(private http:HttpClient, private utilityService:UtilityServiceService){
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.utilityService.fetchContent().subscribe({
      next: (data) => {
        this.option = data;
      },
      error: (err) => {
        console.error("Error fetching content:", err);
      }
    });
  }


  onConfirm(): void {
    if (this.selectedOption) {
      const Id = this.option[0]?.id;
      if (Id) {
        this.utilityService.updateUserContentType(Id, this.selectedOption)
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
