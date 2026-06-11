import { Directive, ElementRef, Input, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * flyDragScroll — makes any horizontal scroll container grab-and-drag scrollable
 * with a MOUSE (touch already swipes natively via `overflow-x:auto`), and —
 * when `[autoScroll]` is set — turns it into a continuously auto-scrolling
 * marquee that the user can still grab, drag or swipe.
 *
 * Usage:
 *   <div class="fly-promos-grid is-carousel" flyDragScroll>…</div>      // drag only
 *   <div class="fly-marquee" flyDragScroll [autoScroll]="0.5">…</div>   // auto + drag
 *
 * The directive adds `.fly-draggable` (grab cursor + scroll-container styling)
 * and, while a mouse drag is in progress, `.is-grabbing`. A drag that actually
 * moved swallows the trailing click so card/link taps aren't triggered by a
 * drag. Auto-scroll assumes the content is duplicated (loops seamlessly at the
 * half-width) and pauses on hover / touch / drag. SSR-safe (no-op on server),
 * so the CSS keyframe marquee remains the graceful fallback when JS is off.
 */
@Directive({ selector: '[flyDragScroll]', standalone: true })
export class FlyDragScrollDirective implements AfterViewInit, OnDestroy {
  /** px per ~16ms tick for continuous auto-scroll. 0 = none. Negative = reverse. */
  @Input() autoScroll = 0;

  private el: HTMLElement;
  private down = false;
  private moved = false;
  private startX = 0;
  private startScroll = 0;
  private paused = false;
  private timer: any = null;
  private cleanups: Array<() => void> = [];

  constructor(elRef: ElementRef<HTMLElement>, @Inject(PLATFORM_ID) private platformId: Object) {
    this.el = elRef.nativeElement;
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.el;
    el.classList.add('fly-draggable');

    // ---- Mouse grab-to-drag (touch falls through to native scroll) ----
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      this.down = true; this.moved = false;
      this.startX = e.clientX; this.startScroll = el.scrollLeft;
      el.classList.add('is-grabbing');
    };
    const onMove = (e: PointerEvent) => {
      if (!this.down) return;
      const dx = e.clientX - this.startX;
      if (Math.abs(dx) > 5) this.moved = true;
      el.scrollLeft = this.startScroll - dx;
      e.preventDefault();
    };
    const onUp = () => {
      if (!this.down) return;
      this.down = false;
      el.classList.remove('is-grabbing');
      if (this.moved) {
        // Swallow the click a drag produces so a card link doesn't navigate.
        const swallow = (ev: Event) => { ev.preventDefault(); ev.stopPropagation(); };
        el.addEventListener('click', swallow, true);
        setTimeout(() => el.removeEventListener('click', swallow, true), 60);
      }
    };
    // Carousel cards are <a> links — a mouse-down-drag on a link starts the
    // browser's native link/image drag (ghost), which hijacks the pointer
    // stream and breaks scroll-dragging. Cancel it so our drag wins.
    const noNativeDrag = (e: DragEvent) => e.preventDefault();
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('dragstart', noNativeDrag);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    this.cleanups.push(
      () => el.removeEventListener('pointerdown', onDown),
      () => el.removeEventListener('dragstart', noNativeDrag),
      () => window.removeEventListener('pointermove', onMove),
      () => window.removeEventListener('pointerup', onUp),
    );

    // ---- Pause auto-scroll on hover / touch ----
    const pause = () => { this.paused = true; };
    const resume = () => { this.paused = false; };
    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume);
    this.cleanups.push(
      () => el.removeEventListener('pointerenter', pause),
      () => el.removeEventListener('pointerleave', resume),
      () => el.removeEventListener('touchstart', pause),
      () => el.removeEventListener('touchend', resume),
    );

    // ---- Continuous auto-scroll (marquee), seamless loop at half-width ----
    if (this.autoScroll) {
      this.timer = window.setInterval(() => {
        if (this.paused || this.down) return;
        const half = el.scrollWidth / 2;
        if (half < 10) return;
        let next = el.scrollLeft + this.autoScroll;
        if (next >= half) next -= half;
        else if (next < 0) next += half;
        el.scrollLeft = next;
      }, 16);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.cleanups.forEach(fn => fn());
  }
}
