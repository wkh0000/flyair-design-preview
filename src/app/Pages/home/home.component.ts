import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FlightSearchComponent } from '../../Components/flight-search/flight-search.component';
import { FlyairSkyComponent } from '../../Components/flyair-sky/flyair-sky.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/Auth/auth.service';
import { UtilityServiceService } from '../../Services/Admin-Services/UtilityService/utility-service.service';
import { SCROLL_FX } from '../../Misc/scroll-fx.directive';
import { FlyIconComponent } from '../../Components/fly-icon/fly-icon.component';
import { HomeService, HomeContent, DEFAULT_HOME } from '../../Services/Home/home.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FlightSearchComponent, FlyairSkyComponent, FlyIconComponent, ...SCROLL_FX],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  cms: any[] = [];
  content: HomeContent = DEFAULT_HOME;

  // partner marquees (duplicated for a seamless loop). logo:'' falls back to the styled name.
  airlines = [
    { name: 'SriLankan',          logo: 'assets/partners/srilankan.svg' },
    { name: 'Emirates',           logo: 'assets/partners/emirates.svg' },
    { name: 'Qatar Airways',      logo: 'assets/partners/qatar.svg' },
    { name: 'Malaysia Airlines',  logo: 'assets/partners/malaysia.svg' },
    { name: 'FitsAir',            logo: 'assets/Fitsair_logo.png' },
    { name: 'Thai Airways',       logo: 'assets/partners/thai.svg' },
    { name: 'Singapore Airlines', logo: 'assets/partners/singapore.svg' },
    { name: 'Cathay Pacific',     logo: 'assets/partners/cathay.svg' },
  ];
  pays = [
    { name: 'mastercard',      logo: 'assets/partners/mastercard.svg' },
    { name: 'VISA',            logo: 'assets/partners/visa.svg' },
    { name: 'AMEX',            logo: 'assets/partners/amex.svg' },
    { name: 'Commercial Bank', logo: 'assets/partners/commercial-bank.svg' },
    { name: 'Sampath Bank',    logo: 'assets/partners/sampath.png' },
    { name: 'Nations Trust',   logo: 'assets/partners/nationstrust.png' },
    { name: 'Q+ Pay',          logo: '' },
    { name: 'LankaQR',         logo: 'assets/partners/lankaqr.png' },
  ];
  get airlinesLoop() { return [...this.airlines, ...this.airlines]; }
  get paysLoop() { return [...this.pays, ...this.pays]; }

  constructor(
    private authService: AuthService,
    private adminService: UtilityServiceService,
    private home: HomeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Editable home content (runs on server + browser; falls back to DEFAULT_HOME on error).
    this.home.get().subscribe({
      next: (c) => { if (c && (c as any).hero) this.content = { ...DEFAULT_HOME, ...(c as HomeContent) }; },
      error: () => { /* keep DEFAULT_HOME */ },
    });

    if (!isPlatformBrowser(this.platformId)) return;
    this.authService.requestAccessToken().subscribe({ next: () => {}, error: (err) => console.error('Error fetching access token:', err) });
    this.adminService.fetchCMS().subscribe({ next: (data) => (this.cms = data), error: (err) => console.error('Error fetching CMS:', err) });
  }

  /** Smooth-scroll from the hero down to the first content section. */
  scrollDown(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const hero = document.querySelector('.fly-hero');
    const next = hero?.nextElementSibling as HTMLElement | null;
    if (next) {
      const y = next.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  }

  fillClass(color?: string): string {
    return color === 'red' ? 'fly-fill-red' : color === 'green' ? 'fly-fill-green' : 'fly-fill-blue';
  }
  badgeClass(color?: string): string {
    return color === 'red' ? 'fly-badge-red' : color === 'green' ? 'fly-badge-green' : 'fly-badge-blue';
  }

  // ----- CMS package inquiry -> WhatsApp (preserved) -----
  showCmsInquiryDialog = false;
  selectedCmsContent: any = null;
  inquiryName = '';
  inquiryContact = '';

  openCmsInquiry(content: any) {
    this.selectedCmsContent = content;
    this.inquiryName = '';
    this.inquiryContact = '';
    this.showCmsInquiryDialog = true;
  }

  sendCmsInquiryToWhatsApp() {
    const phone = '94775527914';
    const message =
      `New Package Inquiry*\n\n` +
      `Name:* ${this.inquiryName}\n` +
      `Contact:* ${this.inquiryContact}\n\n` +
      `*Package Details*\n` +
      `Package: ${this.selectedCmsContent.title}\n` +
      `Description: ${this.selectedCmsContent.description}\n` +
      `Price: ${this.selectedCmsContent.price}\n\n` +
      `Sent via booking portal`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    this.showCmsInquiryDialog = false;
  }
}
