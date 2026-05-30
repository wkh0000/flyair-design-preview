import { Component, OnInit, HostListener, ViewEncapsulation, viewChild  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PostFlightsearchComponent } from '../../Components/post-flightsearch/post-flightsearch.component';
import { ResultSidebarComponent } from '../../Components/result-sidebar/result-sidebar.component';
import { ResultItemsComponent } from '../../Components/result-items/result-items.component';
import { OptionPanelComponent } from '../../Components/option-panel/option-panel.component';
import { ResultContentComponent } from '../../Components/result-content/result-content.component';
import { MatAccordion } from '@angular/material/expansion';
import { MatExpansionModule } from '@angular/material/expansion';
import { FlightService } from '../../Services/Flight/flight.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [
    PostFlightsearchComponent,
    ResultSidebarComponent,
    ResultItemsComponent,
    OptionPanelComponent,
    ResultContentComponent,
    MatExpansionModule,
    MatAccordion,
    CommonModule,
  ],
  templateUrl: './result-page.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrl: './result-page.component.scss',
})
export class ResultPageComponent implements OnInit {
  formData: any;
  searchResults: any;
  showResultPage: boolean = true;
  payload: any;
  isPanelOpen = false;
  accordion = viewChild.required(MatAccordion);

  constructor(
    private route: ActivatedRoute,
    private flightService: FlightService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.flightService.flightData$.subscribe((data) => {
      if (data) {
        this.payload = data.formattedData;
        this.searchResults = data.results;
        this.refreshResultPage();
        this.cdr.detectChanges();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event: BeforeUnloadEvent): void {
      event.preventDefault();
      event.returnValue = '';
  }


  refreshResultPage() {
    this.showResultPage = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showResultPage = true;
      this.cdr.detectChanges();
    }, 0);
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;
  }

}
