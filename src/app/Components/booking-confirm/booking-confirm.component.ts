import { PieControllerChartOptions } from './../../../../node_modules/chart.js/dist/types/index.d';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { WorkbenchService } from '../../Services/Workbench/workbench.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
@Component({
  selector: 'app-booking-confirm',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, PaymentDialogComponent, MatAccordion, HttpClientModule,MatTabsModule,MatDividerModule,MatButtonModule],
  templateUrl: './booking-confirm.component.html',
  styleUrl: './booking-confirm.component.scss',
})
export class BookingConfirmComponent implements OnInit{
  @Output() paymentdialog = new EventEmitter<any>();
  currentStep = 1;
  reservationIdDevKit: any ='';
  aircraftData: { aircraft_code: string; model: string; variant: string; make: string }[] = [];
  options: { name: string; code: string }[] = [];
  readonly dialog = inject(MatDialog);
  @Input() travelerResults: any;
  @Input() iata: boolean = false;
  ResponseData: any[] = []; // Ensure it is always an array
  showPayment = false;
  paymentData: any;
  constructor(private http: HttpClient, private ticketService:WorkbenchService,private router: Router){}
  ngOnInit(): void {
  this.ResponseData = this.travelerResults;
    this.http.get<{ aircraft_code: string; model: string; variant: string; make: string }[]>(
      '../../../assets/DATA/aircraft.json'
      ).subscribe(
        (data) => {
          this.aircraftData = data;
          // You can perform additional operations if needed once data is loaded
        },
        (error) => {
          console.error('Error loading aircraft data:', error);
          // Optionally, you can provide a fallback if data cannot be loaded
          this.aircraftData = []; // Or some default data
        }
      );

      this.http
      .get<{ name: string; code: string }[]>(
        '../../../assets/DATA/airports.json'
      )
      .subscribe((data) => {
        this.options = data;
      });
  }


  getAircraftInfo(code: string): string {
    const aircraft = this.aircraftData.find((a: any) => a.aircraft_code === code);
    if (aircraft) {
      return `${aircraft.make} ${aircraft.variant}`;
    } else {
      return code; // In case of no match
    }
  }

  getAirportInfo(code: string): string {
    const aircraft = this.options.find((a: any) => a.code === code);
    if (aircraft) {
      return `${aircraft.name} - ${aircraft.code}`;
    } else {
      return code; // In case of no match
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

getAirlineLogoUrl(iataCode: string): string {
    if (iataCode === '8D') {
      return '../../../assets/Fitsair_logo.png';
    } else {
      const baseUrl = 'https://images.daisycon.io/airline/';
      const width = 400;
      const height = 250;
      const color = 'ffffff';

      return `${baseUrl}?width=${width}&height=${height}&color=${color}&iata=${iataCode}`;
    }
  }

  getFormattedDuration(duration: string): string {
    if (!duration) return '';
    return duration
      .replace('PT', '')
      .replace('H', ' Hours ')
      .replace('M', ' Minutes');
  }

  issueTicket(pnr: any) {
    this.ticketService.StartPNRSession(pnr).subscribe({
      next: (data: any) => {
        if (data?.fop) {
          this.reservationIdDevKit = data.identifier;

          const body = {
            authority: data.commit.ReservationResponse.Reservation.Identifier.authority,
            identifier: data.commit.ReservationResponse.Reservation.Identifier.value,
            code: data.commit.ReservationResponse.Reservation.Offer[0].Price.CurrencyCode.value,
            amount: data.commit.ReservationResponse.Reservation.Offer[0].Price.Base,
            tax: data.commit.ReservationResponse.Reservation.Offer[0].Price.TotalTaxes,
            paymentIdentifier: '7C6A54F8-78FF-458E-909E-194900761899',
            formOfPaymentIdentifier: data.commit.ReservationResponse.Reservation.Offer[0].Identifier.value,
            offerIdentifier: data.commit.ReservationResponse.Reservation.Offer[0].id,
          };
          this.paymentData = body
          //this.paymentdialog.emit(this.paymentData);
          console.log("data before", this.paymentData)
          this.showPayment = true;

        } else {
          console.error('FOP not found in response');
        }
      },
      error: (err) => {
        console.error('Failed to start session and FOP:', err);
        alert(err.error?.message || 'An error occurred while starting the session and retrieving FOP.');
      }
    });
  }

  handlePayment() {
    this.paymentdialog.emit(this.paymentData); // move this **after** emit
    console.log("data after", this.paymentData); // move this **after** emit
    this.showPayment = false; // move this **after** emit
  }


  goToStep(step: number) {
    this.currentStep = step;
  }

  closePaymentDialog() {
    this.showPayment = false;
  }
}
