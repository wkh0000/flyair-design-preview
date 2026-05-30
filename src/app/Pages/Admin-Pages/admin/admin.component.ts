import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { AdminSidebarComponent } from '../../../Components/Admin-Components/admin-sidebar/admin-sidebar.component';
import { AdminCustomersComponent } from '../../../Components/Admin-Components/admin-customers/admin-customers.component';
import { AdminHomeComponent } from '../../../Components/Admin-Components/admin-home/admin-home.component';
import { AdminPromotionsComponent } from '../../../Components/Admin-Components/admin-promotions/admin-promotions.component';
import { AdminCashoutComponent } from '../../../Components/Admin-Components/admin-cashout/admin-cashout.component';
import { AdminLimitationsComponent } from '../../../Components/Admin-Components/admin-limitations/admin-limitations.component';
import { AdminMarkupComponent } from '../../../Components/Admin-Components/admin-markup/admin-markup.component';
import { AdminProfileComponent } from '../../../Components/Admin-Components/admin-profile/admin-profile.component';
import { AdminBookingComponent } from '../../../Components/Admin-Components/admin-booking/admin-booking.component';
import { AdminCmsComponent } from '../../../Components/Admin-Components/admin-cms/admin-cms.component';
import { AdminNewsComponent } from '../../../Components/Admin-Components/admin-news/admin-news.component';
import { AdminFrontpageComponent } from '../../../Components/Admin-Components/admin-frontpage/admin-frontpage.component';
import { AdminPagesComponent } from '../../../Components/Admin-Components/admin-pages/admin-pages.component';
import { AdminInquiriesComponent } from '../../../Components/Admin-Components/admin-inquiries/admin-inquiries.component';
import { AdminSubscribersComponent } from '../../../Components/Admin-Components/admin-subscribers/admin-subscribers.component';
import { AdminFooterComponent } from '../../../Components/Admin-Components/admin-footer/admin-footer.component';
import { AdminSupportComponent } from '../../../Components/Admin-Components/admin-support/admin-support.component';
import { AuthService } from '../../../Services/Auth/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterModule, MatTableModule, MatButtonModule, MatIconModule, CommonModule,
    AdminProfileComponent, AdminCmsComponent, AdminBookingComponent,
    AdminMarkupComponent, AdminLimitationsComponent, AdminCashoutComponent,
    AdminSidebarComponent, AdminCustomersComponent, AdminPromotionsComponent,
    AdminHomeComponent, AdminNewsComponent, AdminFrontpageComponent, AdminPagesComponent,
    AdminInquiriesComponent, AdminSubscribersComponent, AdminFooterComponent,
    AdminSupportComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  selectedItem: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router,
  ) {}

  onSidebarItemSelected(index: number) {
    this.selectedItem = index;
    this.cdr.detectChanges();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/admin-login']);
  }
}
