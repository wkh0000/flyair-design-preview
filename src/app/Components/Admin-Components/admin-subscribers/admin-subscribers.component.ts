import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriberService, Subscriber } from '../../../Services/Subscriber/subscriber.service';

@Component({
  selector: 'app-admin-subscribers',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-subscribers.component.html',
  styleUrl: './admin-subscribers.component.scss',
})
export class AdminSubscribersComponent implements OnInit {
  rows: Subscriber[] = [];
  totalActive = 0;
  includeInactive = false;
  loading = false;
  search = '';

  constructor(private svc: SubscriberService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list(this.includeInactive).subscribe({
      next: (r) => { this.rows = r.rows; this.totalActive = r.totalActive; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  filteredRows(): Subscriber[] {
    const s = this.search.trim().toLowerCase();
    if (!s) return this.rows;
    return this.rows.filter((r) =>
      r.email.toLowerCase().includes(s) || (r.source || '').toLowerCase().includes(s)
    );
  }

  unsubscribe(r: Subscriber): void {
    if (!confirm(`Mark ${r.email} as unsubscribed?`)) return;
    this.svc.remove(r.id, false).subscribe(() => {
      if (this.includeInactive) {
        r.isActive = false;
        r.unsubscribedAt = new Date().toISOString();
      } else {
        this.rows = this.rows.filter((x) => x.id !== r.id);
      }
      this.totalActive = Math.max(0, this.totalActive - 1);
    });
  }

  remove(r: Subscriber): void {
    if (!confirm(`Permanently delete ${r.email}? This cannot be undone.`)) return;
    this.svc.remove(r.id, true).subscribe(() => {
      this.rows = this.rows.filter((x) => x.id !== r.id);
      if (r.isActive) this.totalActive = Math.max(0, this.totalActive - 1);
    });
  }

  csvUrl(): string { return this.svc.csvUrl(); }
}
