import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.scss'
})
export class ScrollToTopComponent {
  showButton = false;

  // Listen to the window scroll event
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Show or hide the button based on the scroll position
    this.showButton = window.scrollY > 200;
  }

  // Scroll to top functionality
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
