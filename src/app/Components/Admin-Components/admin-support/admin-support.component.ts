import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SupportService, SupportRequest, SupportCounts, SupportStatus,
} from '../../../Services/Support/support.service';

/**
 * Admin Support Inbox.
 *
 * Lists every help-desk request submitted via /support, lets the operator filter
 * by status / category, open a detail pane, update status / assignment /
 * internal notes, fire a pre-filled mailto reply, and delete a row.
 */
@Component({
  selector: 'app-admin-support',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-support.component.html',
  styleUrl: './admin-support.component.scss',
})
export class AdminSupportComponent implements OnInit {
  rows: SupportRequest[] = [];
  counts: SupportCounts = { total: 0, new: 0, inProgress: 0, resolved: 0, closed: 0 };
  selected: SupportRequest | null = null;
  loading = false;
  saving = false;

  statusFilter: '' | SupportStatus = '';
  categoryFilter = '';

  readonly statuses: { key: SupportStatus; label: string; dot: string }[] = [
    { key: 'new',          label: 'New',          dot: '#0073bd' },
    { key: 'in-progress',  label: 'In progress',  dot: '#f0a500' },
    { key: 'resolved',     label: 'Resolved',     dot: '#2e8540' },
    { key: 'closed',       label: 'Closed',       dot: '#6b7686' },
  ];

  readonly categories = [
    'Date and time change',
    'Cancel/Refund flights request',
    'Name correction',
    'Make payment',
    'Extend ticket time limit',
    'Seat preference',
    'Meal preference',
    'Wheelchair assistance',
    'Payment confirmation',
    'Payment Invoice Request',
    'Other',
  ];

  constructor(private svc: SupportService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list({
      status:   this.statusFilter || undefined,
      category: this.categoryFilter || undefined,
    }).subscribe({
      next: (r) => { this.rows = r.rows; this.counts = r.counts; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  open(r: SupportRequest): void { this.selected = { ...r }; }
  close(): void { this.selected = null; }

  /** Push the in-memory selection back to the API (status / assignedTo / internalNotes). */
  save(): void {
    if (!this.selected || this.saving) return;
    const row = this.selected;
    this.saving = true;
    this.svc.update(row.id, {
      status: row.status,
      assignedTo: row.assignedTo || null,
      internalNotes: row.internalNotes || null,
    }).subscribe({
      next: () => {
        this.saving = false;
        // Reflect the change into the list row + refresh counts via a reload.
        const idx = this.rows.findIndex((x) => x.id === row.id);
        if (idx >= 0) this.rows[idx] = { ...this.rows[idx], ...row };
        this.load();
      },
      error: () => { this.saving = false; },
    });
  }

  remove(r: SupportRequest, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Delete ${r.category} request from ${r.name}? This cannot be undone.`)) return;
    this.svc.remove(r.id).subscribe(() => {
      this.rows = this.rows.filter((x) => x.id !== r.id);
      if (this.selected?.id === r.id) this.selected = null;
      this.load(); // refresh counts
    });
  }

  /** Quick status-change shortcut from the row hover actions. */
  setStatus(r: SupportRequest, status: SupportStatus, event: Event): void {
    event.stopPropagation();
    this.svc.update(r.id, { status }).subscribe(() => {
      r.status = status;
      if (this.selected?.id === r.id) this.selected.status = status;
      this.load();
    });
  }

  /** Pre-filled mailto: that opens the operator's default email client. */
  mailto(r: SupportRequest): string {
    const subj = encodeURIComponent(
      `Re: ${r.category} — booking ${r.bookingId} (request #${r.id})`,
    );
    const body = encodeURIComponent(
      `Hi ${r.name},\n\nThank you for contacting FlyAir support about your ${r.category.toLowerCase()} request for booking ${r.bookingId}. `,
    );
    return `mailto:${r.email}?subject=${subj}&body=${body}`;
  }

  statusDot(status: SupportStatus): string {
    return this.statuses.find((s) => s.key === status)?.dot || '#6b7686';
  }
}
