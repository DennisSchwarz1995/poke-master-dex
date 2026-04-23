import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { ThemeService } from '../../../core/services/theme.service';
import { DexStateService } from '../../../core/services/dex-state.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { TrainerManagementDialogComponent } from '../../../features/dashboard/trainer-management-dialog/trainer-management-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, TrainerManagementDialogComponent],
  template: `
    <header
      class="h-16 top-0 z-50 w-full backdrop-blur-md bg-surface/80 border-b border-theme shadow-sm supports-[backdrop-filter]:bg-surface/60"
    >
      <div class="container mx-auto px-4 h-16 flex items-center justify-between relative">
        <div class="flex items-center gap-6">
          @if (!getDexIdFromUrl()) {
            <a routerLink="/" class="flex items-center gap-2" title="Poke Master Dex">
              <img src="/favicon.ico" alt="" class="size-10 rounded-xl" />

              <span
                class="hidden sm:block font-extrabold text-xl tracking-tight bg-gradient-to-br from-primary to-blue-400 bg-clip-text text-transparent"
              >
                Master Dex
              </span>
            </a>
          }
        </div>

        @if (!getDexIdFromUrl()) {
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                  Home</a
                >

                <a routerLink="/pokemon" routerLinkActive="active"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 313 313"
                    fill="currentColor"
                    fill-rule="evenodd"
                    stroke-linejoin="round"
                    stroke-miterlimit="2"
                    clip-rule="evenodd"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-width="25"
                      d="M28.13 24.5c-1.4 1.06-4.53 15.74-5.92 27.8-1.14 9.85-1.04 26.34.22 35.7 2.4 17.95 7.9 34.14 16.46 48.52 7.4 12.43 19.63 25.67 32.12 34.75 1.97 1.43 3.75 2.75 3.94 2.92.2.18-.71 1.82-2.03 3.66a66.3 66.3 0 0 0-10.01 22.02c-1.57 6.28-1.95 16.52-.87 23.11 4.7 28.62 29.72 52.57 64.4 61.67 10.35 2.72 18.07 3.66 30 3.65 22.82-.02 43.17-5.86 60.65-17.4 12.41-8.18 21.71-18.5 27.71-30.74 4.66-9.49 6.48-18.04 6.1-28.62-.42-11.96-3.84-22.34-10.75-32.63-1.64-2.44-2.83-4.58-2.64-4.76.19-.17 2.81-2.16 5.84-4.42a120.04 120.04 0 0 0 27.17-28.64c19.02-28.52 25.07-65.14 17.21-104.22-1.53-7.6-2.93-12.37-3.7-12.64-1.11-.38-10.23 3.14-18.67 7.2-16.32 7.86-29.58 17.17-41.85 29.37-11.26 11.2-17.74 20.04-23.92 32.65-7.02 14.32-10.42 26.74-11.7 42.72a138.9 138.9 0 0 1-.6 6.6c-.04.07-2.17-.37-4.73-.98-9-2.15-14.47-2.7-26.79-2.68-12.03.02-18.25.68-26.8 2.86-1.94.5-3.63.9-3.74.9-.11 0-.34-2.06-.51-4.58-1.7-25.43-10.3-47.45-26.35-67.43C94.72 66.33 83.5 55.2 78.84 51.5a164.84 164.84 0 0 0-28.62-18.4c-11.77-6-20.87-9.54-22.1-8.61"
                    ></path>
                  </svg>
                  Pokémon</a
                >

                <a routerLink="/games" routerLinkActive="active"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-gamepad2-icon lucide-gamepad-2"
                  >
                    <line x1="6" x2="10" y1="11" y2="11" />
                    <line x1="8" x2="8" y1="9" y2="13" />
                    <line x1="15" x2="15.01" y1="12" y2="12" />
                    <line x1="18" x2="18.01" y1="10" y2="10" />
                    <path
                      d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"
                    />
                  </svg>
                  Games</a
                >
                <a routerLink="/pokedex" [class.active]="isPokedexRoute()"
                  ><svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    stroke="currentColor"
                    stroke-width="0.4"
                  >
                    <path
                      d="M0 0 C5.28 0 10.56 0 16 0 C16 7.92 16 15.84 16 24 C10.72 24 5.44 24 0 24 C0 16.08 0 8.16 0 0 Z M1 1 C1 2.98 1 4.96 1 7 C2.32 6.67 3.64 6.34 5 6 C4.01 6 3.02 6 2 6 C2 4.68 2 3.36 2 2 C3.32 2 4.64 2 6 2 C6.33 3.32 6.66 4.64 7 6 C7.33 5.67 7.66 5.34 8 5 C10.32817964 4.63239269 12.6618385 4.29758419 15 4 C15 3.01 15 2.02 15 1 C10.38 1 5.76 1 1 1 Z M8 7 C5.69 7.33 3.38 7.66 1 8 C1 12.95 1 17.9 1 23 C4.96 23 8.92 23 13 23 C13 17.06 13 11.12 13 5 C10.67642489 4.81509993 10.67642489 4.81509993 8 7 Z M14 5 C15 7 15 7 15 7 Z M14 8 C14 11.96 14 15.92 14 20 C14.33 20 14.66 20 15 20 C15 16.04 15 12.08 15 8 C14.67 8 14.34 8 14 8 Z M14 21 C15 23 15 23 15 23 Z "
                      fill="currentColor"
                      transform="translate(4,0)"
                    />
                    <path
                      d="M0 0 C1.98 0 3.96 0 6 0 C6 0.33 6 0.66 6 1 C4.02 1 2.04 1 0 1 C0 0.67 0 0.34 0 0 Z "
                      fill="currentColor"
                      transform="translate(9,21)"
                    />
                    <path
                      d="M0 0 C0.66 0 1.32 0 2 0 C2 0.99 2 1.98 2 3 C1.34 3 0.68 3 0 3 C0 2.01 0 1.02 0 0 Z "
                      fill="currentColor"
                      transform="translate(6,13)"
                    />
                  </svg>
                  Pokédex</a
                >
              </nav>
            </div>
          </div>
        }

        @if (getDexIdFromUrl(); as currentId) {
          <div
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-20"
          >
            <div class="nav-wrap scale-[0.80] lg:scale-100 origin-center">
              <div class="bubble active"></div>
              <div class="bubble hover"></div>
              <nav class="nav">
                <a
                  [routerLink]="['/dex', currentId, 'box', getCurrentBoxNumber()]"
                  [class.active]="getCurrentDexView() === 'box'"
                >
                  Box</a
                >
                <a
                  [routerLink]="['/dex', currentId, 'gallery']"
                  [class.active]="getCurrentDexView() === 'gallery'"
                >
                  Gallery</a
                >
                <a
                  [routerLink]="['/dex', currentId]"
                  [class.active]="getCurrentDexView() === 'overview'"
                  >Overview</a
                >
              </nav>
            </div>
          </div>
        }

        <div class="flex items-center gap-2 sm:gap-4">
          @if (user(); as currentUser) {
            <div
              class="flex items-center gap-2 sm:gap-3 mr-2 sm:mr-4 border-r border-theme pr-2 sm:pr-4"
            >
              @if (isPokedexRoute()) {
                <button
                  (click)="openTrainerManagement()"
                  class="px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 transition-all text-secondary hover:text-green-600 hover:bg-surface-hover"
                  title="Manage Trainers"
                >
                  <span class="hidden sm:inline">👤 Trainers</span>
                  <span class="sm:hidden text-lg">👤</span>
                </button>
              }

              @if (currentUser.photoURL) {
                <img
                  [src]="currentUser.photoURL"
                  [alt]="currentUser.displayName || 'User'"
                  (click)="goToProfile()"
                  class="w-9 h-9 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400 transition ml-1"
                  title="Go to Profile"
                />
              } @else {
                <button
                  (click)="goToProfile()"
                  class="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold hover:bg-blue-600 transition ml-1"
                  title="Go to Profile"
                >
                  {{ currentUser.displayName?.charAt(0) || '?' }}
                </button>
              }
            </div>
          }

          <button
            (click)="themeService.toggleTheme()"
            class="p-2.5 rounded-xl text-secondary hover:text-primary hover:bg-surface-hover transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
            [title]="
              themeService.currentTheme() === 'dark'
                ? 'Switch to Light Mode'
                : 'Switch to Dark Mode'
            "
          >
            @if (themeService.currentTheme() === 'light') {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            }
          </button>
        </div>
      </div>
    </header>

    @if (showTrainerDialog()) {
      <app-trainer-management-dialog (closed)="closeTrainerDialog()" />
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
        box-shadow: inset 10px 0 10px black;
        background: linear-gradient(0deg, #141414, #242424);
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
        color: white;
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
        color: black;
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
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--color-border);
      }
      :host-context([data-theme='dark']) .bubble.active {
        background: linear-gradient(180deg, #f2f2f2, #b3b3b3);
        box-shadow: inset 0 2px 7px #fff;
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
        box-shadow: inset 0 2px 7px #ffffff29;
      }

      .target {
        position: relative;
        z-index: -1;
      }
    `,
  ],
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  private dexStateService = inject(DexStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;
  currentDex = this.dexStateService.currentDex;
  showTrainerDialog = signal(false);

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

  openTrainerManagement() {
    this.showTrainerDialog.set(true);
  }

  closeTrainerDialog() {
    this.showTrainerDialog.set(false);
  }
}
