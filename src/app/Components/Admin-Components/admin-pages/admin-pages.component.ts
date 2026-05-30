import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageService } from '../../../Services/Page/page.service';
import { LegalComponent, InfoDoc } from '../../../Pages/legal/legal.component';
import { CONTACT_DEFAULT, ContactContent } from '../../../Pages/contact/contact.component';

interface PageRef { key: string; label: string; type: 'info' | 'contact'; group: string; }

@Component({
  selector: 'app-admin-pages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pages.component.html',
  styleUrl: './admin-pages.component.scss',
})
export class AdminPagesComponent implements OnInit {
  pages: PageRef[] = [];
  groups: string[] = [];
  overrides = new Set<string>();

  selected: PageRef | null = null;
  doc: InfoDoc | null = null;          // info-page model
  contact: ContactContent | null = null; // contact-page model

  saving = false;
  message = '';
  error = '';

  constructor(private svc: PageService) {}

  ngOnInit(): void {
    // Build the registry: every info page from the LegalComponent defaults + the contact page.
    // Exclude keys whose route uses a bespoke component (they don't read overrides yet),
    // so the list only shows pages where edits actually take effect.
    const bespoke = new Set(['support', 'payment-options', 'bank-transfer', 'instalments']);
    const refs: PageRef[] = [{ key: 'contact', label: 'Contact Us', type: 'contact', group: 'Contact' }];
    const defaults = LegalComponent.DEFAULTS;
    Object.keys(defaults).forEach((key) => {
      if (bespoke.has(key)) return;
      const d = defaults[key];
      refs.push({ key, label: d.title, type: 'info', group: d.eyebrow || 'Other' });
    });
    this.pages = refs;
    this.groups = Array.from(new Set(refs.map((r) => r.group)));
    this.loadOverrides();
    this.select(refs[0]);
  }

  loadOverrides(): void {
    this.svc.listOverrides().subscribe({
      next: (rows) => { this.overrides = new Set((rows || []).map((r) => r.pageKey)); },
      error: () => {},
    });
  }

  pagesIn(group: string): PageRef[] { return this.pages.filter((p) => p.group === group); }

  select(p: PageRef): void {
    this.clearMsg();
    this.selected = p;
    this.doc = null;
    this.contact = null;
    const fallback = p.type === 'contact'
      ? { ...CONTACT_DEFAULT }
      : JSON.parse(JSON.stringify(LegalComponent.DEFAULTS[p.key]));

    this.apply(p, fallback);
    // overlay saved override if present
    this.svc.get(p.key).subscribe({
      next: (o) => {
        if (p.type === 'contact' && o && (o.heading || o.address)) this.contact = { ...CONTACT_DEFAULT, ...o };
        else if (p.type === 'info' && o && o.title && Array.isArray(o.sections)) this.doc = o as InfoDoc;
      },
      error: () => {},
    });
  }

  private apply(p: PageRef, content: any): void {
    if (p.type === 'contact') this.contact = content as ContactContent;
    else this.doc = content as InfoDoc;
  }

  addSection(): void { this.doc?.sections.push({ h: '', p: '' }); }
  removeSection(i: number): void { this.doc?.sections.splice(i, 1); }
  trackByIndex(i: number) { return i; }

  save(): void {
    if (!this.selected) return;
    this.clearMsg();
    this.saving = true;
    const content = this.selected.type === 'contact' ? this.contact : this.doc;
    this.svc.save(this.selected.key, content).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Page saved. Refresh the public page to see changes.';
        this.overrides.add(this.selected!.key);
      },
      error: (e) => { this.saving = false; this.error = e?.error?.message || 'Save failed.'; },
    });
  }

  resetToDefault(): void {
    if (!this.selected) return;
    if (!confirm('Reset this page to its built-in default? Your customisations will be removed.')) return;
    const p = this.selected;
    this.svc.reset(p.key).subscribe({
      next: () => {
        this.overrides.delete(p.key);
        this.message = 'Reset to default.';
        if (p.type === 'contact') this.contact = { ...CONTACT_DEFAULT };
        else this.doc = JSON.parse(JSON.stringify(LegalComponent.DEFAULTS[p.key]));
      },
      error: () => { this.error = 'Reset failed.'; },
    });
  }

  clearMsg(): void { this.message = ''; this.error = ''; }
}
