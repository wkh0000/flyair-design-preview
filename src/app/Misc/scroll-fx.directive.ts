import {
  AfterViewInit, Directive, ElementRef, Inject, Input, NgZone, OnDestroy, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Scroll motion primitives (SSR-safe + fail-open).
 *
 * Reveals/count-up are driven by a shared scroll listener + rAF (not
 * IntersectionObserver) because IO proved unreliable in some embedded
 * runtimes. Content is visible by default; JS only "arms" (hides) it when it
 * can animate, plus a watchdog reveals anything still pending — so a reveal
 * can never leave content stuck hidden.
 */

const REDUCED = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- shared, scroll-driven "in view" scheduler (no rAF, so it runs even where rAF is throttled) ----
type Cb = () => void;
const _items: { el: HTMLElement; cb: Cb }[] = [];
let _wired = false;

function _check(): void {
  const vh = window.innerHeight || 0;
  for (let i = _items.length - 1; i >= 0; i--) {
    const r = _items[i].el.getBoundingClientRect();
    if (r.top < vh * 0.85) { _items[i].cb(); _items.splice(i, 1); }   // entered from below (or scrolled past)
  }
}
function _flushAll(): void { while (_items.length) _items.pop()!.cb(); }

function watchInView(el: HTMLElement, cb: Cb): void {
  _items.push({ el, cb });
  if (!_wired) {
    _wired = true;
    window.addEventListener('scroll', _check, { passive: true });
    window.addEventListener('resize', _check, { passive: true });
    setTimeout(_check, 350);       // initial check once layout has settled (genuine above-fold only)
    setTimeout(_flushAll, 5000);   // last-resort safety: never leave content hidden
  }
}

/** Adds `.armed` then `.in` as the element scrolls into view → drives .fly-reveal / .fly-stagger. */
@Directive({ selector: '.fly-reveal, .fly-stagger', standalone: true })
export class RevealDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>, @Inject(PLATFORM_ID) private pid: Object) {}
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.pid)) return;
    const node = this.el.nativeElement;
    if (REDUCED()) { node.classList.add('in'); return; }   // honour reduced-motion: show, no animation
    node.classList.add('armed');                            // safe to hide now
    watchInView(node, () => node.classList.add('in'));
  }
}

/** Writes a `--fly-par` px offset as the element scrolls; CSS consumes it inside a transform. */
@Directive({ selector: '[flyParallax]', standalone: true })
export class ParallaxDirective implements AfterViewInit, OnDestroy {
  @Input('flyParallax') speed: number | string = 24;   // px of drift across the viewport
  private ticking = false;
  private raf = 0;
  private readonly onScroll = () => this.schedule();

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private pid: Object,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.pid) || REDUCED()) return;
    this.zone.runOutsideAngular(() => {
      addEventListener('scroll', this.onScroll, { passive: true });
      addEventListener('resize', this.onScroll, { passive: true });
      this.update();
    });
  }
  private schedule(): void {
    if (this.ticking) return;
    this.ticking = true;
    this.raf = requestAnimationFrame(() => { this.ticking = false; this.update(); });
  }
  private update(): void {
    const node = this.el.nativeElement;
    const r = node.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    if (r.bottom < -300 || r.top > vh + 300) return;          // ignore when far off-screen
    const sp = (typeof this.speed === 'string' ? parseFloat(this.speed) : this.speed) || 24;
    const off = (r.top + r.height / 2 - vh / 2) / vh;          // ~ -0.5 (above) .. 0.5 (below)
    // ×2 so the drift spans the element's full viewport pass (was ~±sp/2 → barely visible).
    node.style.setProperty('--fly-par', (off * -sp * 2).toFixed(1) + 'px');
  }
  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.pid)) return;
    removeEventListener('scroll', this.onScroll);
    removeEventListener('resize', this.onScroll);
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

/** Counts a number up from 0 to the element's text (e.g. "2M+", "4.8★") when it enters view. */
@Directive({ selector: '[flyCountUp]', standalone: true })
export class CountUpDirective implements AfterViewInit, OnDestroy {
  private timer: any = 0;
  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private pid: Object,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.pid)) return;
    const node = this.el.nativeElement;
    const text = (node.textContent || '').trim();
    const m = text.match(/^(\D*)([\d.,]+)(.*)$/);             // prefix · number · suffix
    if (!m) return;
    const prefix = m[1], rawNum = m[2].replace(/,/g, ''), suffix = m[3];
    const end = parseFloat(rawNum);
    if (isNaN(end)) return;
    const decimals = rawNum.includes('.') ? rawNum.split('.')[1].length : 0;
    if (REDUCED()) return;                                     // leave the final value in place
    node.textContent = prefix + (0).toFixed(decimals) + suffix;
    watchInView(node, () => this.run(prefix, end, decimals, suffix));
  }
  private run(prefix: string, end: number, decimals: number, suffix: string): void {
    const node = this.el.nativeElement;
    const dur = 1500, t0 = Date.now();
    this.zone.runOutsideAngular(() => {
      const step = () => {
        const p = Math.min((Date.now() - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);                  // easeOutCubic
        node.textContent = prefix + (end * eased).toFixed(decimals) + suffix;
        if (p < 1) this.timer = setTimeout(step, 33);          // ~30fps; runs even where rAF is throttled
      };
      step();
    });
  }
  ngOnDestroy(): void { if (this.timer) clearTimeout(this.timer); }
}

/**
 * Premium 3D tilt on hover — the element leans toward the cursor with a soft
 * lift, then springs back on leave. Pointer-driven, runs outside Angular, and
 * is fully disabled under prefers-reduced-motion. Usage: `flyTilt` or `flyTilt="10"`.
 */
@Directive({ selector: '[flyTilt]', standalone: true })
export class TiltDirective implements AfterViewInit, OnDestroy {
  @Input('flyTilt') max: number | string = 8;
  private readonly onMove = (e: PointerEvent) => this.move(e);
  private readonly onLeave = () => this.reset();

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private pid: Object,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.pid) || REDUCED()) return;
    const node = this.el.nativeElement;
    node.style.transition = 'transform .18s cubic-bezier(.22,.61,.36,1)';
    node.style.willChange = 'transform';
    this.zone.runOutsideAngular(() => {
      node.addEventListener('pointermove', this.onMove, { passive: true });
      node.addEventListener('pointerleave', this.onLeave, { passive: true });
    });
  }
  private move(e: PointerEvent): void {
    const node = this.el.nativeElement;
    const r = node.getBoundingClientRect();
    const m = (typeof this.max === 'string' ? parseFloat(this.max) : this.max) || 8;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    node.style.transform =
      `perspective(900px) rotateX(${(-py * m).toFixed(2)}deg) rotateY(${(px * m).toFixed(2)}deg) translateY(-6px)`;
  }
  private reset(): void { this.el.nativeElement.style.transform = ''; }
  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.pid)) return;
    const node = this.el.nativeElement;
    node.removeEventListener('pointermove', this.onMove);
    node.removeEventListener('pointerleave', this.onLeave);
  }
}

/**
 * Writes document read-progress (0..1) to `--fly-readprog` on the host as you scroll.
 * Drive a fixed bar with transform: scaleX(var(--fly-readprog)). Cheap (one var, rAF-throttled).
 */
@Directive({ selector: '[flyScrollProgress]', standalone: true })
export class ScrollProgressDirective implements AfterViewInit, OnDestroy {
  private ticking = false;
  private raf = 0;
  private readonly onScroll = () => this.schedule();
  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone, @Inject(PLATFORM_ID) private pid: Object) {}
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.pid)) return;
    this.zone.runOutsideAngular(() => {
      addEventListener('scroll', this.onScroll, { passive: true });
      addEventListener('resize', this.onScroll, { passive: true });
      this.update();
    });
  }
  private schedule(): void {
    if (this.ticking) return;
    this.ticking = true;
    this.raf = requestAnimationFrame(() => { this.ticking = false; this.update(); });
  }
  private update(): void {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? doc.scrollTop / max : 0;
    this.el.nativeElement.style.setProperty('--fly-readprog', Math.min(1, Math.max(0, p)).toFixed(4));
  }
  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.pid)) return;
    removeEventListener('scroll', this.onScroll);
    removeEventListener('resize', this.onScroll);
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

/**
 * Sticky "settle then move" pin. Put on a tall wrapper (height > 100vh) that contains a
 * position:sticky stage. Writes progress 0..1 (`--fly-prog`) across the wrapper's scroll
 * pass so inner content can scale/translate/clip while the stage is visually held.
 * Disabled under reduced-motion (the sticky still works; just no progress-driven motion).
 */
@Directive({ selector: '[flyPin]', standalone: true })
export class PinDirective implements AfterViewInit, OnDestroy {
  private ticking = false;
  private raf = 0;
  private readonly onScroll = () => this.schedule();
  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone, @Inject(PLATFORM_ID) private pid: Object) {}
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.pid) || REDUCED()) return;
    this.zone.runOutsideAngular(() => {
      addEventListener('scroll', this.onScroll, { passive: true });
      addEventListener('resize', this.onScroll, { passive: true });
      this.update();
    });
  }
  private schedule(): void {
    if (this.ticking) return;
    this.ticking = true;
    this.raf = requestAnimationFrame(() => { this.ticking = false; this.update(); });
  }
  private update(): void {
    const node = this.el.nativeElement;
    const r = node.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = node.offsetHeight - vh;
    const p = total > 0 ? (-r.top) / total : 0;
    node.style.setProperty('--fly-prog', Math.min(1, Math.max(0, p)).toFixed(4));
  }
  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.pid)) return;
    removeEventListener('scroll', this.onScroll);
    removeEventListener('resize', this.onScroll);
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

/**
 * Writes 0..1 progress to `--fly-enter` on the host as the element passes through the viewport:
 * 0 when the element's top first hits the viewport bottom, 1 when its bottom leaves the viewport top.
 * Use for scroll-tied scale/translate inside a normal-height section (no sticky pin needed).
 */
@Directive({ selector: '[flyEnter]', standalone: true })
export class EnterProgressDirective implements AfterViewInit, OnDestroy {
  private ticking = false;
  private raf = 0;
  private readonly onScroll = () => this.schedule();
  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone, @Inject(PLATFORM_ID) private pid: Object) {}
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.pid) || REDUCED()) return;
    this.zone.runOutsideAngular(() => {
      addEventListener('scroll', this.onScroll, { passive: true });
      addEventListener('resize', this.onScroll, { passive: true });
      this.update();
    });
  }
  private schedule(): void {
    if (this.ticking) return;
    this.ticking = true;
    this.raf = requestAnimationFrame(() => { this.ticking = false; this.update(); });
  }
  private update(): void {
    const node = this.el.nativeElement;
    const r = node.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = r.height + vh;            // total scroll distance for full pass
    const traveled = vh - r.top;            // how much of that pass has happened
    const p = Math.min(1, Math.max(0, traveled / total));
    node.style.setProperty('--fly-enter', p.toFixed(4));
  }
  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.pid)) return;
    removeEventListener('scroll', this.onScroll);
    removeEventListener('resize', this.onScroll);
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

/** Convenience array for component `imports`. */
export const SCROLL_FX = [RevealDirective, ParallaxDirective, CountUpDirective, TiltDirective, ScrollProgressDirective, PinDirective, EnterProgressDirective] as const;
