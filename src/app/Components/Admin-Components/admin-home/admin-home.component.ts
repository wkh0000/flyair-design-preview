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

  /** Real KPI totals from the backend (default 0 so the cards render before
   *  data arrives / when the demo's static API returns nothing). */
  totals = { bookings: 0, customers: 0, subscribers: 0, promotions: 0, news: 0 };

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
        // Real data only: KPI totals + the monthly bookings chart.
        // { labels: [...], bookings: [...], totals: { bookings, customers, subscribers, promotions, news } }
        if (data?.totals) this.totals = { ...this.totals, ...data.totals };
        if (Array.isArray(data?.bookings)) {
          this.renderChart('bookingActivityChart', data.bookings, 'Bookings', data.labels || []);
        }
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