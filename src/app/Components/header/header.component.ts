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
    return url === '/' || url === '' || url.startsWith('/#');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = typeof window !== 'undefined' && window.scrollY > 40;
  }
}
