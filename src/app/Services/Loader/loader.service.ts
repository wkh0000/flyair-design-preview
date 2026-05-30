import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Drives the global fullscreen flight loader rendered at the app root. */
@Injectable({ providedIn: 'root' })
export class LoaderService {
  private _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();

  set(value: boolean): void {
    this._loading.next(value);
  }
}
