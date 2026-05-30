import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InquiryService, ContactInquiry } from '../../../Services/Inquiry/inquiry.service';

@Component({
  selector: 'app-admin-inquiries',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-inquiries.component.html',
  styleUrl: './admin-inquiries.component.scss',
})
export class AdminInquiriesComponent implements OnInit {
  rows: ContactInquiry[] = [];
  selected: ContactInquiry | null = null;
  loading = false;
  unreadOnly = false;
  totalUnread = 0;

  constructor(private svc: InquiryService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list(this.unreadOnly).subscribe({
      next: (r) => { this.rows = r.rows; this.totalUnread = r.totalUnread; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  open(r: ContactInquiry): void {
    this.selected = r;
    if (!r.isRead) {
      this.svc.setRead(r.id, true).subscribe(() => { r.isRead = true; this.totalUnread = Math.max(0, this.totalUnread - 1); });
    }
  }

  close(): void { this.selected = null; }

  toggleRead(r: ContactInquiry, event: Event): void {
    event.stopPropagation();
    const nextState = !r.isRead;
    this.svc.setRead(r.id, nextState).subscribe(() => {
      r.isRead = nextState;
      this.totalUnread += nextState ? -1 : 1;
      this.totalUnread = Math.max(0, this.totalUnread);
    });
  }

  remove(r: ContactInquiry, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Delete message from ${r.name}? This cannot be undone.`)) return;
    this.svc.remove(r.id).subscribe(() => {
      this.rows = this.rows.filter((x) => x.id !== r.id);
      if (!r.isRead) this.totalUnread = Math.max(0, this.totalUnread - 1);
      if (this.selected?.id === r.id) this.selected = null;
    });
  }

  mailto(r: ContactInquiry): string {
    const subj = encodeURIComponent('Re: ' + (r.subject || 'Your FlyAir inquiry'));
    const body = encodeURIComponent(`Hi ${r.name},\n\nThanks for reaching out — `);
    return `mailto:${r.email}?subject=${subj}&body=${body}`;
  }
}
