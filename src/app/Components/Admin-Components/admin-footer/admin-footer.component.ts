import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageService } from '../../../Services/Page/page.service';
import { FOOTER_DEFAULT, FooterContent } from '../../../Components/footer/footer.component';

@Component({
  selector: 'app-admin-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-footer.component.html',
  styleUrl: './admin-footer.component.scss',
})
export class AdminFooterComponent implements OnInit {
  cms: FooterContent = JSON.parse(JSON.stringify(FOOTER_DEFAULT));
  hasOverride = false;
  saving = false;
  message = '';
  error = '';

  constructor(private svc: PageService) {}

  ngOnInit(): void {
    this.svc.get('footer').subscribe({
      next: (o) => {
        if (o && (o.brandText || o.newsletterLabel || o.socials)) {
          this.cms = { ...FOOTER_DEFAULT, ...o, socials: { ...FOOTER_DEFAULT.socials, ...(o.socials || {}) } };
          this.hasOverride = true;
        }
      },
      error: () => {},
    });
  }

  save(): void {
    if (this.saving) return;
    this.saving = true; this.message = ''; this.error = '';
    this.svc.save('footer', this.cms).subscribe({
      next: () => { this.saving = false; this.message = 'Saved — the footer will update on the next page reload.'; this.hasOverride = true; },
      error: (e) => { this.saving = false; this.error = e?.error?.message || 'Could not save. Please try again.'; },
    });
  }

  resetToDefault(): void {
    if (!confirm('Reset the footer to its built-in default? Your custom overrides will be discarded.')) return;
    this.svc.reset('footer').subscribe({
      next: () => {
        this.cms = JSON.parse(JSON.stringify(FOOTER_DEFAULT));
        this.hasOverride = false;
        this.message = 'Reset to the built-in default.';
      },
    });
  }
}
