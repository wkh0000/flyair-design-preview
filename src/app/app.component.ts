import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FooterComponent } from './Components/footer/footer.component';
import { HeaderComponent } from './Components/header/header.component';
import { ScrollToTopComponent } from './Misc/scroll-to-top/scroll-to-top.component';
import { CommonModule } from '@angular/common';
import { ScrollProgressDirective } from './Misc/scroll-fx.directive';
import { LoaderComponent } from './Components/loader/loader.component';
import { LoaderService } from './Services/Loader/loader.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, FooterComponent, HeaderComponent, ScrollToTopComponent, CommonModule, ScrollProgressDirective, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'WhiteLabelITQ';

  /** True when the static GitHub Pages preview build is running — drives the demo banner. */
  demoMode = !!(environment as any).demoMode;

  isAdminRoute$: Observable<boolean>;

  constructor(router: Router, public loader: LoaderService) {
    this.isAdminRoute$ = router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
      startWith(router.url),
      map((url) => /^\/admin(-|$|\/)/.test(url))
    );
  }
}
