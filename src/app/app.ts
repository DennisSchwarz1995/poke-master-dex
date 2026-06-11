import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { Router } from '@angular/router';
import { DexStateService } from './core/services/dex-state.service';
import { Toast } from './shared/components/toast/toast.component';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, Toast, Footer],
  template: `
    <div class="min-h-screen flex flex-col bg-bg-secondary text-text-primary">
      <app-header></app-header>
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer class="py-6"></app-footer>
      <app-toast />
    </div>
  `,
  styleUrl: './app.css',
})
export class App {
  private themeService = inject(ThemeService);
  private dexStateService = inject(DexStateService);
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe(() => {
      if (!this.router.url.includes('/dex/')) {
        this.dexStateService.setCurrentDex(null);
      }
    });
  }
}
