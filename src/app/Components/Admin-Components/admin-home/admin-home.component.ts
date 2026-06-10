import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // ✅ Import HttpClient
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, CommonModule, HttpClientModule], // ✅ Add HttpClientModule here
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent implements OnInit {
  
  // Keep track of chart instances so we can destroy them before redrawing
  private charts: { [key: string]: Chart } = {};

  // Inject HttpClient in the constructor
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    // Use the configured API base (relative /api/ → dev-server proxy → backend)
    // instead of a hardcoded port, which was dead and broke the dashboard charts.
    const apiUrl = `${environment.apiUrl}AdminUtility/dashboard-stats`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        // Expected data format from your API:
        // { 
        //   labels: ['Jan', 'Feb', 'Mar'], 
        //   frequentFlights: [30, 45, 25], 
        //   siteActivity: [60, 20, 40], 
        //   bookings: [15, 55, 30] 
        // }

        // ✅ Render charts ONLY after the data arrives!
        this.renderChart('frequentFlightsChart', data.frequentFlights, 'Frequent Flights', data.labels);
        this.renderChart('siteActivityChart', data.siteActivity, 'Site Activity', data.labels);
        this.renderChart('bookingActivityChart', data.bookings, 'Booking Activity', data.labels);
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
      }
    });
  }

  renderChart(canvasId: string, data: number[], label: string, labels: string[]): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    // ✅ Crucial Chart.js fix: Destroy the old chart if it exists before drawing a new one
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // Save the new chart instance to our dictionary
    this.charts[canvasId] = new Chart(ctx!, {
      type: 'bar',
      data: {
        labels: labels, // Use the dynamic labels from the API
        datasets: [
          {
            label: label,
            data: data, // Use the dynamic numbers from the API
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}