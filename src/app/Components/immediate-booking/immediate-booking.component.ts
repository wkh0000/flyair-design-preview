import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { MatDialogActions } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-immediate-booking',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatDialogActions,MatDivider],
  templateUrl: './immediate-booking.component.html',
  styleUrl: './immediate-booking.component.scss'
})
export class ImmediateBookingComponent {
  constructor(
    public dialogRef: MatDialogRef<ImmediateBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { hx: number }
  ) {}

  onEdit() {
    this.dialogRef.close('edit');
  }
}
