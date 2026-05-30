import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-baggage-conditions-dialog',
  standalone: true,
  imports: [MatDialogModule, MatTableModule, CommonModule, MatIconModule],
  templateUrl: './baggage-conditions-dialog.component.html',
  styleUrls: ['./baggage-conditions-dialog.component.scss']
})
export class BaggageConditionsDialogComponent {
  unit = 'kg';
  displayedColumns: string[] = ['type', 'text', 'measurement'];
  baggageInfo: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<BaggageConditionsDialogComponent> // Inject MatDialogRef to close the dialog
) {
    this.baggageInfo = data;
  }

  toggleUnit(newUnit: string): void {
      this.unit = newUnit;
  }
  closeDialog(): void {
    this.dialogRef.close(); // Close the dialog
  }
}

