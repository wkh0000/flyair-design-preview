import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Premium icon (Lucide, ISC-licensed — free for commercial use, no attribution).
 * Rendered as real Angular SVG template nodes via *ngSwitch — SSR-safe (no [innerHTML],
 * which throws NotYetImplemented on the server) and stable across change detection.
 * Usage: <fly-icon name="plane-takeoff" [size]="26"></fly-icon>
 */
@Component({
  selector: 'fly-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<svg viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size"
      fill="none" stroke="currentColor" [attr.stroke-width]="stroke"
      stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"
      [ngSwitch]="name">
    <ng-container *ngSwitchCase="'search'"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></ng-container>
    <ng-container *ngSwitchCase="'ticket'"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></ng-container>
    <ng-container *ngSwitchCase="'shield-check'"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></ng-container>
    <ng-container *ngSwitchCase="'percent-tag'"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></ng-container>
    <ng-container *ngSwitchCase="'star'"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></ng-container>
    <ng-container *ngSwitchCase="'seat'"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/></ng-container>
    <ng-container *ngSwitchCase="'globe'"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></ng-container>
    <ng-container *ngSwitchCase="'clock'"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></ng-container>
    <ng-container *ngSwitchCase="'headset'"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/></ng-container>
    <ng-container *ngSwitchCase="'plane-takeoff'"><path d="M2 22h20"/><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z"/></ng-container>
    <ng-container *ngSwitchCase="'map-pin'"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></ng-container>
    <ng-container *ngSwitchCase="'wifi'"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></ng-container>
    <ng-container *ngSwitchCase="'calendar'"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></ng-container>
    <ng-container *ngSwitchCase="'leaf'"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></ng-container>
    <ng-container *ngSwitchCase="'credit-card'"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></ng-container>
    <ng-container *ngSwitchDefault><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></ng-container>
  </svg>`,
  styles: [':host{display:inline-flex;line-height:0}'],
})
export class FlyIconComponent {
  @Input() name = '';
  @Input() size: number | string = 24;
  @Input() stroke: number | string = 2;
}

/** Icon keys offered in the admin picker. */
export const FLY_ICON_KEYS = [
  'search', 'ticket', 'shield-check', 'percent-tag', 'star', 'seat', 'globe', 'clock',
  'headset', 'plane-takeoff', 'map-pin', 'wifi', 'calendar', 'sparkles', 'leaf', 'credit-card',
];
