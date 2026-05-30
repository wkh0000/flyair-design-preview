import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface ShareTarget {
  key: string;
  label: string;
  href: string;
  icon: string; // inline SVG path data
}

/**
 * Accessible social-share bar. Uses keyless GET share endpoints that open in a
 * new tab, plus a copy-link button. Every control has an accessible name and a
 * visible focus ring; the copy confirmation is announced via aria-live.
 */
@Component({
  selector: 'app-share-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-bar.component.html',
  styleUrl: './share-bar.component.scss',
})
export class ShareBarComponent {
  /** Absolute, canonical URL of the page being shared. */
  @Input() url = '';
  /** Plain-text title used in share intents. */
  @Input() title = '';
  /** Optional short summary for email/WhatsApp body. */
  @Input() summary = '';

  copied = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get targets(): ShareTarget[] {
    const u = encodeURIComponent(this.url);
    const t = encodeURIComponent(this.title);
    const s = encodeURIComponent(this.summary || this.title);
    return [
      { key: 'facebook', label: 'Share on Facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        icon: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94z' },
      { key: 'x', label: 'Share on X',
        href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
        icon: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64z' },
      { key: 'linkedin', label: 'Share on LinkedIn',
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
        icon: 'M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z' },
      { key: 'whatsapp', label: 'Share on WhatsApp',
        href: `https://wa.me/?text=${t}%20${u}`,
        icon: 'M.06 24l1.68-6.13A11.86 11.86 0 0 1 .16 11.9C.16 5.33 5.5 0 12.06 0a11.82 11.82 0 0 1 8.42 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24zM6.6 20.13c1.68.99 3.28 1.59 5.46 1.59 5.45 0 9.89-4.43 9.89-9.88a9.86 9.86 0 0 0-2.9-7A9.83 9.83 0 0 0 12.06 1.98c-5.46 0-9.9 4.44-9.9 9.9 0 2.1.56 3.65 1.5 5.28l-.99 3.6 3.93-1.03zm11.4-5.74c-.07-.12-.27-.2-.57-.34-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.29.18-1.41z' },
      { key: 'telegram', label: 'Share on Telegram',
        href: `https://t.me/share/url?url=${u}&text=${t}`,
        icon: 'M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.23.23-.42.42-.83.42z' },
      { key: 'reddit', label: 'Share on Reddit',
        href: `https://www.reddit.com/submit?url=${u}&title=${t}`,
        icon: 'M24 11.78a2.6 2.6 0 0 0-2.59-2.59c-.66 0-1.27.26-1.72.66-1.67-1.1-3.93-1.81-6.43-1.9l1.31-4.13 3.6.85a2.15 2.15 0 1 0 .23-1.04l-3.96-.93a.52.52 0 0 0-.62.36l-1.45 4.57c-2.6.05-4.95.76-6.67 1.9a2.58 2.58 0 0 0-1.72-.66 2.6 2.6 0 0 0-1.06 4.96 4.7 4.7 0 0 0-.06.74c0 3.6 4.18 6.52 9.34 6.52s9.34-2.92 9.34-6.52a4.7 4.7 0 0 0-.06-.73A2.6 2.6 0 0 0 24 11.78zM6.5 13.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm8.74 4.36c-.86.86-2.5.93-2.98.93-.48 0-2.12-.07-2.98-.93a.37.37 0 0 1 .52-.52c.54.54 1.7.73 2.46.73.76 0 1.92-.19 2.46-.73a.37.37 0 0 1 .52.52zm-.25-2.86a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z' },
      { key: 'email', label: 'Share by email',
        href: `mailto:?subject=${t}&body=${s}%0A%0A${u}`,
        icon: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z' },
    ];
  }

  copyLink(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const done = () => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2200);
    };
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(this.url).then(done).catch(() => this.fallbackCopy(done));
    } else {
      this.fallbackCopy(done);
    }
  }

  private fallbackCopy(done: () => void): void {
    try {
      const ta = document.createElement('textarea');
      ta.value = this.url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    } catch {
      /* no-op */
    }
  }
}
