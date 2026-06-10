import { Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { ContactComponent } from './Pages/contact/contact.component';
import { ResultPageComponent } from './Pages/result-page/result-page.component';
import { PreBookingComponent } from './Pages/pre-booking/pre-booking.component';
import { AdminComponent } from './Pages/Admin-Pages/admin/admin.component';
import { AdminLoginComponent } from './Pages/Admin-Pages/admin-login/admin-login.component';
import { AdminSignupComponent } from './Pages/Admin-Pages/admin-signup/admin-signup.component';
import { AuthGuard } from './Services/Auth/auth.guard';
import { ScrollToTopComponent } from './Misc/scroll-to-top/scroll-to-top.component';
import { LegalComponent } from './Pages/legal/legal.component';
import { PaymentOptionsComponent } from './Pages/payment-options/payment-options.component';
import { PayToBankComponent } from './Pages/pay-to-bank/pay-to-bank.component';
import { InstalmentsComponent } from './Pages/instalments/instalments.component';
import { CustomerSupportComponent } from './Pages/customer-support/customer-support.component';
import { NewsListComponent } from './Pages/news/news-list.component';
import { NewsDetailComponent } from './Pages/news/news-detail.component';
import { PromoDetailComponent } from './Pages/promo-detail/promo-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'result', component: ResultPageComponent },
  { path: 'contact', component: ContactComponent },
  // Aviation news blog (FlyAir Newsroom)
  { path: 'news', component: NewsListComponent },
  { path: 'news/category/:slug', component: NewsListComponent },
  { path: 'news/:slug', component: NewsDetailComponent },
  // Public promotion detail page — Open Graph tags drive the FB share preview.
  { path: 'promotions/:slug', component: PromoDetailComponent },
  { path: 'result', component: ResultPageComponent },
  { path: 'prebooking', component: PreBookingComponent},
  { path: 'privacy', component: LegalComponent, data: { page: 'privacy' } },
  { path: 'terms', component: LegalComponent, data: { page: 'terms' } },
  { path: 'cookies', component: LegalComponent, data: { page: 'cookies' } },
  // Company
  { path: 'about', component: LegalComponent, data: { page: 'about' } },
  { path: 'support', component: CustomerSupportComponent }, // rich support wizard
  { path: 'faq', component: LegalComponent, data: { page: 'faq' } },
  // Our products
  { path: 'flight-tickets', component: LegalComponent, data: { page: 'flight-tickets' } },
  // Payments information (rich themed pages)
  { path: 'payment-options', component: PaymentOptionsComponent },
  { path: 'bank-transfer', component: PayToBankComponent },
  { path: 'cards', component: LegalComponent, data: { page: 'cards' } },
  { path: 'instalments', component: InstalmentsComponent },
  // Other information
  { path: 'offers-promotions', component: LegalComponent, data: { page: 'offers-promotions' } },
  { path: 'airlines', component: LegalComponent, data: { page: 'airlines' } },
  { path: 'web-checkin', component: LegalComponent, data: { page: 'web-checkin' } },
  { path: 'sitemap', component: LegalComponent, data: { page: 'sitemap' } },
  { path: 'security', component: LegalComponent, data: { page: 'security' } },
  // FlyAir IA — new pages
  { path: 'baggage', component: LegalComponent, data: { page: 'baggage' } },
  { path: 'flight-status', component: LegalComponent, data: { page: 'flight-status' } },
  { path: 'fees', component: LegalComponent, data: { page: 'fees' } },
  { path: 'refunds', component: LegalComponent, data: { page: 'refunds' } },
  { path: 'advisories', component: LegalComponent, data: { page: 'advisories' } },
  { path: 'careers', component: LegalComponent, data: { page: 'careers' } },
  {path: 'admin-login',component: AdminLoginComponent,},
  {path: 'admin-signup',component: AdminSignupComponent,},
  {
    path: 'admin-dashboard',
    component: AdminComponent,
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' },
];

