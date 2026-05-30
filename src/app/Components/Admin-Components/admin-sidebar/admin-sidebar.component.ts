import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { inject } from '@angular/core/testing';
import { ItemDialogComponent } from '../item-dialog/item-dialog.component';
import { HxDialogComponent } from '../hx-dialog/hx-dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/Auth/auth.service';
@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule,MatDialogModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  @Output() itemSelected: EventEmitter<number> = new EventEmitter<number>();
  isMasterDataOpen: boolean = false;
  selectedItem: number | null = 0;
  isDropdownOpen: boolean = false;
  panelOpenState = false;
  constructor(private dialog: MatDialog, private authService: AuthService, 
    private router: Router){}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleMasterDataDropdown() {
    this.isMasterDataOpen = !this.isMasterDataOpen;
  }

  selectItem(item: number): void {
    if(item === 9){
      this.openDialog('300ms', '200ms'); // Open the modal when item is 9
    }else if(item === 10){
      this.openHXDialog('300ms', '200ms'); // Open the modal when item is 9
    }else{
    this.selectedItem = item;
    this.itemSelected.emit(item);
    }
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(ItemDialogComponent, {
      width: '500px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  openHXDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(HxDialogComponent, {
      width: '500px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  logout(): void {
    // 1. Tell the service to wipe the user's data
    this.authService.logout();

    // 2. Redirect the user back to the admin login page
    this.router.navigate(['/']);
  }
}
