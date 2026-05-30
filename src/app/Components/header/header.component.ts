import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  scrolled = false;
  onDark = false;          // transparent white-text header over the home hero

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.onDark = this.isHome(this.router.url);
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => (this.onDark = this.isHome(e.urlAfterRedirects)));
  }

  private isHome(url: string): boolean {
    // Strip query (?cb=3) and fragment (#offers) so the dark-hero header is
    // applied on the home route regardless of how the URL was opened.
    const path = (url || '').split('?')[0].split('#')[0];
    return path === '/' || path === '' || path === '/index.html';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = typeof window !== 'undefined' && window.scrollY > 40;
  }
}
