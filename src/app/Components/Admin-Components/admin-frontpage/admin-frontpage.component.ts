import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeService, HomeContent } from '../../../Services/Home/home.service';
import { NewsService } from '../../../Services/News/news.service';
import { FLY_ICON_KEYS, FlyIconComponent } from '../../fly-icon/fly-icon.component';
import { DEFAULT_HOME } from '../../../Services/Home/home.service';

@Component({
  selector: 'app-admin-frontpage',
  standalone: true,
  imports: [CommonModule, FormsModule, FlyIconComponent],
  templateUrl: './admin-frontpage.component.html',
  styleUrl: './admin-frontpage.component.scss',
})
export class AdminFrontpageComponent implements OnInit {
  // Pre-populated so the form renders instantly (never stuck on "loading"); API overlays it.
  content: HomeContent = this.normalize(JSON.parse(JSON.stringify(DEFAULT_HOME)));
  syncing = true;
  saving = false;
  message = '';
  error = '';
  uploadingKey: string | null = null;

  iconKeys = FLY_ICON_KEYS;
  colors = ['blue', 'red', 'green'];

  constructor(
    private home: HomeService,
    private news: NewsService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    // Fetch the live content browser-side (admin is client-rendered; avoids SSR fetch stalls).
    if (!isPlatformBrowser(this.platformId)) { this.syncing = false; return; }
    this.home.get().subscribe({
      next: (c) => { if (c && (c as any).hero) this.content = this.normalize(c as HomeContent); this.syncing = false; },
      error: () => { this.syncing = false; this.error = 'Could not load saved content; editing defaults.'; },
    });
  }

  /** Ensure every section/array exists so the form binds safely. */
  private normalize(c: HomeContent): HomeContent {
    c = c || ({} as HomeContent);
    c.hero = c.hero || ({ eyebrow: '', titleLine1: '', titleAccent: '', lead: '', badges: [] } as any);
    c.hero.badges = c.hero.badges || [];
    c.stats = c.stats || [];
    c.why = c.why || ({ eyebrow: '', title: '', lead: '', items: [] } as any);
    c.why.items = c.why.items || [];
    c.destinations = c.destinations || ({ eyebrow: '', title: '', ctaLabel: '', ctaLink: '', items: [] } as any);
    c.destinations.items = c.destinations.items || [];
    c.featured = c.featured || ({ eyebrow: '', title: '', text: '', image: '', ctaLabel: '', ctaLink: '' } as any);
    c.offers = c.offers || ({ eyebrow: '', title: '', items: [] } as any);
    c.offers.items = c.offers.items || [];
    c.cta = c.cta || ({ eyebrow: '', title: '', lead: '', primaryLabel: '', primaryLink: '', secondaryLabel: '', secondaryLink: '' } as any);
    return c;
  }

  // ---- array helpers ----
  addStat() { this.content.stats.push({ icon: 'star', value: '', label: '' }); }
  removeStat(i: number) { this.content.stats.splice(i, 1); }
  addWhy() { this.content.why.items.push({ icon: 'sparkles', color: 'blue', title: '', text: '' }); }
  removeWhy(i: number) { this.content.why.items.splice(i, 1); }
  addDest() { this.content.destinations.items.push({ image: '', city: '', country: '', badge: '', badgeColor: 'blue', price: '', link: '/result' }); }
  removeDest(i: number) { this.content.destinations.items.splice(i, 1); }
  addOffer() { this.content.offers.items.push({ icon: 'percent-tag', color: 'red', title: '', text: '' }); }
  removeOffer(i: number) { this.content.offers.items.splice(i, 1); }
  addBadge() { this.content.hero.badges.push(''); }
  removeBadge(i: number) { this.content.hero.badges.splice(i, 1); }
  trackByIndex(i: number) { return i; }

  // ---- image upload ----
  onImageSelected(event: Event, obj: any, key: string, tag: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.error = 'Please choose an image file.'; return; }
    if (file.size > 8 * 1024 * 1024) { this.error = 'Image too large (max 8 MB).'; return; }
    this.clearMsg();
    this.uploadingKey = tag;
    const reader = new FileReader();
    reader.onload = () => {
      this.news.uploadImage(reader.result as string).subscribe({
        next: (res) => { obj[key] = res.url; this.uploadingKey = null; this.message = 'Image uploaded — remember to Save.'; input.value = ''; },
        error: (e) => { this.uploadingKey = null; this.error = e?.error?.message || 'Upload failed.'; input.value = ''; },
      });
    };
    reader.onerror = () => { this.uploadingKey = null; this.error = 'Could not read file.'; };
    reader.readAsDataURL(file);
  }

  save() {
    this.clearMsg();
    this.saving = true;
    this.home.save(this.content).subscribe({
      next: () => { this.saving = false; this.message = 'Front page saved. Refresh the home page to see changes.'; },
      error: (e) => { this.saving = false; this.error = e?.error?.message || 'Save failed.'; },
    });
  }

  clearMsg() { this.message = ''; this.error = ''; }
}
