import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { DexStateService } from '../../../core/services/dex-state.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    TooltipDirective,
    IconComponent,
  ],
  template: `
    <header
      class="top-0 z-50 w-full backdrop-blur-md bg-secondary shadow-sm supports-[backdrop-filter]:bg-surface/60"
      [class.border-b]="!getDexIdFromUrl()"
      [class.border-theme]="!getDexIdFromUrl()"
    >
      <div class="container mx-auto px-4 h-16 flex items-center justify-between relative">
        <div class="flex items-center gap-6">
          <a
            routerLink="/"
            class="flex items-center gap-2"
            [appTooltip]="'Home'"
            tooltipPosition="right"
          >
            <img src="/favicon.ico" alt="Poke Master Dex" class="size-10 rounded-xl" />
          </a>
        </div>

        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-20"
        >
          <div class="nav-wrap scale-[0.70] lg:scale-90 origin-center">
            <div class="bubble active"></div>
            <div class="bubble hover"></div>
            <nav class="nav">
              <a
                routerLink="/home"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <app-icon name="home"></app-icon>
                Home</a
              >

              <a routerLink="/pokemon" routerLinkActive="active">
                <app-icon name="pokemon"></app-icon>
                Pokémon</a
              >

              <a routerLink="/games" routerLinkActive="active">
                <app-icon name="gamepad"></app-icon>
                Games</a
              >
              <a routerLink="/pokedex" [class.active]="isPokedexRoute()"
                ><app-icon name="pokedex"></app-icon> Pokédex</a
              >

              @if (user()) {
                <a routerLink="/profile" routerLinkActive="active">
                  <app-icon name="profile"></app-icon>
                  Profile</a
                >
              } @else {
                <a routerLink="/login" routerLinkActive="active">
                  <app-icon name="sign-in"></app-icon>
                  Sign In</a
                >
              }
            </nav>
          </div>
        </div>
      </div>
    </header>

    @if (getDexIdFromUrl(); as currentId) {
      <nav class="sub-nav-bar border-b border-theme bg-secondary top-16 z-40">
        <div class="container mx-auto px-4">
          <div class="flex items-center gap-6">
            <a
              [routerLink]="['/dex', currentId, 'box', getCurrentBoxNumber()]"
              class="sub-nav-link"
              [class.sub-nav-active]="getCurrentDexView() === 'box'"
            >
              <app-icon name="box"></app-icon>
              Box
            </a>
            <a
              [routerLink]="['/dex', currentId, 'gallery']"
              class="sub-nav-link"
              [class.sub-nav-active]="getCurrentDexView() === 'gallery'"
            >
              <app-icon name="gallery"></app-icon>
              Gallery
            </a>
            <a
              [routerLink]="['/dex', currentId]"
              class="sub-nav-link"
              [class.sub-nav-active]="getCurrentDexView() === 'overview'"
            >
              <app-icon name="overview"></app-icon>
              Overview
            </a>
          </div>
        </div>
      </nav>
    }

  `,
  styles: [
    `
      .nav-wrap {
        border: 1px solid var(--color-border);
        width: fit-content;
        margin: 0 auto;
        border-radius: 500px;
        position: relative;
        box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
        background: var(--color-surface-hover);
      }

      :host-context([data-theme='dark']) .nav-wrap {
        border-color: var(--color-bg-secondary);
        box-shadow: inset 0 2px 5px rgba(237, 237, 237, 0.05);
        background: var(--color-surface);
      }

      :host-context([data-theme='dark']) .nav-wrap:after {
        background: linear-gradient(180deg, var(--color-bg-secondary), #212121);
      }

      .nav {
        width: fit-content;
        anchor-name: --nav;
        margin: 4px;
        display: flex;
      }

      .nav a {
        z-index: 10;
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 24px;
        color: var(--color-text-secondary);
        text-decoration: none;
        font-weight: bold;
        transition: color 0.2s;
      }

      :host-context([data-theme='dark']) .nav a {
        color: var(--color-text-primary);
      }

      .nav a:before {
        content: '';
        display: block;
        position: absolute;
        inset: 0;
        opacity: 0.2;
      }

      .nav a.active {
        anchor-name: --active;
        color: var(--color-primary);
      }

      :host-context([data-theme='dark']) .nav a.active {
        color: var(--color-text-tertiary);
      }

      .nav a:hover:before {
        anchor-name: --nav;
      }

      .bubble {
        background: transparent;
        top: anchor(top);
        right: anchor(right);
        bottom: anchor(bottom);
        left: anchor(left);
        position: absolute;
        transition: all 0.2s;
        border-radius: 500px;
      }

      :host-context([data-theme='dark']) .bubble {
        background: white;
      }

      .bubble.active {
        position-anchor: --active;
        z-index: 2;
        background: var(--color-surface);
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--color-border);
      }

      :host-context([data-theme='dark']) .bubble.active {
        box-shadow: 0 2px 4px rgba(237, 237, 237, 0.1);
        border: none;
      }

      .bubble.hover {
        z-index: 1;
        background: var(--color-surface-raised);
        box-shadow: none;
        position-anchor: --nav;
      }

      :host-context([data-theme='dark']) .bubble.hover {
        background: linear-gradient(180deg, var(--color-bg-secondary), #212121);
        box-shadow: inset 0 2px 4px #ffffff29;
      }

      .target {
        position: relative;
        z-index: -1;
      }

      .sub-nav-link {
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        margin: 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-decoration: none;
        border-radius: 6px;
        transition:
          color 0.15s ease,
          background-color 0.15s ease;
      }

      .sub-nav-link:hover {
        color: var(--color-text-primary);
        background-color: var(--color-surface-hover);
      }

      :host-context([data-theme='dark']) .sub-nav-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .sub-nav-link.sub-nav-active {
        color: var(--color-text-primary);
      }

      .sub-nav-link.sub-nav-active::after {
        content: '';
        position: absolute;
        bottom: -9px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--color-active);
        border-radius: 2px 2px 0 0;
      }
    `,
  ],
})
export class HeaderComponent {
  private dexStateService = inject(DexStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;
  currentDex = this.dexStateService.currentDex;

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
  );

  isPokedexRoute = computed(() => {
    const url = this.currentUrl() || '';
    return url.includes('/pokedex') || url.includes('/dex');
  });

  getDexIdFromUrl = computed(() => {
    const url = this.currentUrl() || '';
    const match = url.match(/\/dex\/([^\/]+)/);
    return match ? match[1] : null;
  });

  getCurrentBoxNumber = computed(() => {
    const url = this.currentUrl() || '';
    const match = url.match(/\/box\/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  });

  getCurrentDexView = computed(() => {
    const url = this.currentUrl() || '';
    if (!this.getDexIdFromUrl()) return null;
    if (url.includes('/gallery')) return 'gallery';
    if (url.includes('/box/')) return 'box';
    return 'overview';
  });

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
