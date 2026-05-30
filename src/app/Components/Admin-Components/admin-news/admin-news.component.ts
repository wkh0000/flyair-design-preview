import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService, NewsCategory, ArticleUpsert } from '../../../Services/News/news.service';

type Tab = 'articles' | 'categories';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-news.component.html',
  styleUrl: './admin-news.component.scss',
})
export class AdminNewsComponent implements OnInit {
  tab: Tab = 'articles';

  // data
  articles: any[] = [];
  categories: NewsCategory[] = [];
  loading = false;
  message = '';
  error = '';

  // article editor
  editing = false;
  editingId: number | null = null;
  form: ArticleUpsert = this.blankArticle();
  uploadingHero = false;

  // category editor
  catEditing = false;
  catEditingId: number | null = null;
  catForm: Partial<NewsCategory> = this.blankCategory();

  // filters
  filterStatus = '';
  filterSearch = '';

  constructor(private news: NewsService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadArticles();
  }

  // ---------- loaders ----------
  loadArticles(): void {
    this.loading = true;
    this.news.adminListArticles({ status: this.filterStatus || undefined, search: this.filterSearch || undefined })
      .subscribe({
        next: (a) => { this.articles = a || []; this.loading = false; },
        error: () => { this.error = 'Failed to load articles.'; this.loading = false; },
      });
  }

  loadCategories(): void {
    this.news.adminListCategories().subscribe({
      next: (c) => (this.categories = c || []),
      error: () => (this.categories = []),
    });
  }

  catName(id: number): string {
    return this.categories.find((c) => c.id === id)?.name || '—';
  }

  // ---------- article editor ----------
  blankArticle(): ArticleUpsert {
    return {
      title: '', slug: '', dek: '', body: '',
      heroImageUrl: '', heroImageAlt: '', heroImageCredit: '',
      categoryId: 0, tags: '', authorName: 'FlyAir Newsroom', authorTitle: '',
      status: 'Published', featured: false, publishedAt: '', readingMinutes: 0,
      metaTitle: '', metaDescription: '', metaKeywords: '', ogImageUrl: '', canonicalUrl: '',
    };
  }

  newArticle(): void {
    this.clearMsg();
    this.editing = true;
    this.editingId = null;
    this.form = this.blankArticle();
    if (this.categories.length) this.form.categoryId = this.categories[0].id;
  }

  editArticle(id: number): void {
    this.clearMsg();
    this.news.adminGetArticle(id).subscribe({
      next: (a) => {
        this.editing = true;
        this.editingId = id;
        this.form = {
          title: a.title, slug: a.slug, dek: a.dek || '', body: a.body || '',
          heroImageUrl: a.heroImageUrl || '', heroImageAlt: a.heroImageAlt || '', heroImageCredit: a.heroImageCredit || '',
          categoryId: a.categoryId, tags: a.tags || '',
          authorName: a.authorName || 'FlyAir Newsroom', authorTitle: a.authorTitle || '',
          status: a.status || 'Published', featured: a.featured,
          publishedAt: a.publishedAt ? a.publishedAt.substring(0, 10) : '',
          readingMinutes: a.readingMinutes || 0,
          metaTitle: a.metaTitle || '', metaDescription: a.metaDescription || '',
          metaKeywords: a.metaKeywords || '', ogImageUrl: a.ogImageUrl || '', canonicalUrl: a.canonicalUrl || '',
        };
      },
      error: () => (this.error = 'Could not load article for editing.'),
    });
  }

  cancelEdit(): void {
    this.editing = false;
    this.editingId = null;
    this.form = this.blankArticle();
  }

  /** Read the chosen file, upload it, and set the hero image URL to the returned URL. */
  onHeroFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.error = 'Please choose an image file.'; return; }
    if (file.size > 8 * 1024 * 1024) { this.error = 'Image too large (max 8 MB).'; return; }

    this.clearMsg();
    this.uploadingHero = true;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      this.news.uploadImage(dataUri).subscribe({
        next: (res) => {
          this.form.heroImageUrl = res.url;
          if (!this.form.ogImageUrl) this.form.ogImageUrl = res.url;
          this.uploadingHero = false;
          this.message = 'Image uploaded. Remember to save the article.';
          input.value = '';
        },
        error: (e) => {
          this.uploadingHero = false;
          this.error = e?.error?.message || 'Image upload failed.';
          input.value = '';
        },
      });
    };
    reader.onerror = () => { this.uploadingHero = false; this.error = 'Could not read the file.'; };
    reader.readAsDataURL(file);
  }

  clearHeroImage(): void {
    this.form.heroImageUrl = '';
  }

  saveArticle(): void {
    this.clearMsg();
    if (!this.form.title?.trim()) { this.error = 'Title is required.'; return; }
    if (!this.form.categoryId) { this.error = 'Please choose a category.'; return; }

    const payload: ArticleUpsert = { ...this.form };
    // normalize publishedAt to ISO if provided
    if (payload.publishedAt) payload.publishedAt = new Date(payload.publishedAt).toISOString();

    const done = (verb: string) => {
      this.message = `Article ${verb}.`;
      this.editing = false;
      this.editingId = null;
      this.form = this.blankArticle();
      this.loadArticles();
    };

    if (this.editingId) {
      this.news.updateArticle(this.editingId, payload).subscribe({
        next: () => done('updated'),
        error: (e) => (this.error = e?.error?.message || 'Update failed.'),
      });
    } else {
      this.news.createArticle(payload).subscribe({
        next: () => done('created'),
        error: (e) => (this.error = e?.error?.message || 'Create failed.'),
      });
    }
  }

  deleteArticle(id: number, title: string): void {
    this.clearMsg();
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    this.news.deleteArticle(id).subscribe({
      next: () => { this.message = 'Article deleted.'; this.loadArticles(); },
      error: () => (this.error = 'Delete failed.'),
    });
  }

  togglePublish(a: any): void {
    this.clearMsg();
    const next = a.status === 'Published' ? 'Draft' : 'Published';
    // Fetch the full article so we don't clobber the body on a status flip.
    this.news.adminGetArticle(a.id).subscribe({
      next: (full) => {
        const payload: ArticleUpsert = {
          title: full.title, slug: full.slug, dek: full.dek || '', body: full.body || '',
          heroImageUrl: full.heroImageUrl || '', heroImageAlt: full.heroImageAlt || '', heroImageCredit: full.heroImageCredit || '',
          categoryId: full.categoryId, tags: full.tags || '',
          authorName: full.authorName || 'FlyAir Newsroom', authorTitle: full.authorTitle || '',
          status: next, featured: full.featured,
          publishedAt: full.publishedAt, readingMinutes: full.readingMinutes || 0,
          metaTitle: full.metaTitle || '', metaDescription: full.metaDescription || '',
          metaKeywords: full.metaKeywords || '', ogImageUrl: full.ogImageUrl || '', canonicalUrl: full.canonicalUrl || '',
        };
        this.news.updateArticle(a.id, payload).subscribe({
          next: () => { this.message = `Marked ${next}.`; this.loadArticles(); },
          error: () => (this.error = 'Status change failed.'),
        });
      },
      error: () => (this.error = 'Status change failed.'),
    });
  }

  // ---------- category editor ----------
  blankCategory(): Partial<NewsCategory> {
    return { name: '', slug: '', blurb: '', accent: '#0073bd', sortOrder: 0 };
  }

  newCategory(): void {
    this.clearMsg();
    this.catEditing = true;
    this.catEditingId = null;
    this.catForm = this.blankCategory();
  }

  editCategory(c: NewsCategory): void {
    this.clearMsg();
    this.catEditing = true;
    this.catEditingId = c.id;
    this.catForm = { name: c.name, slug: c.slug, blurb: c.blurb, accent: c.accent || '#0073bd', sortOrder: c.sortOrder };
  }

  cancelCat(): void {
    this.catEditing = false;
    this.catEditingId = null;
    this.catForm = this.blankCategory();
  }

  saveCategory(): void {
    this.clearMsg();
    if (!this.catForm.name?.trim()) { this.error = 'Category name is required.'; return; }
    const done = (verb: string) => {
      this.message = `Category ${verb}.`;
      this.catEditing = false;
      this.catEditingId = null;
      this.catForm = this.blankCategory();
      this.loadCategories();
    };
    if (this.catEditingId) {
      this.news.updateCategory(this.catEditingId, this.catForm).subscribe({
        next: () => done('updated'),
        error: (e) => (this.error = e?.error?.message || 'Update failed.'),
      });
    } else {
      this.news.createCategory(this.catForm).subscribe({
        next: () => done('created'),
        error: (e) => (this.error = e?.error?.message || 'Create failed.'),
      });
    }
  }

  deleteCategory(c: NewsCategory): void {
    this.clearMsg();
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.news.deleteCategory(c.id).subscribe({
      next: () => { this.message = 'Category deleted.'; this.loadCategories(); },
      error: (e) => (this.error = e?.error?.message || 'Delete failed (category may have articles).'),
    });
  }

  clearMsg(): void { this.message = ''; this.error = ''; }
}
