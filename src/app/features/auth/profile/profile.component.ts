import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import {
  PokemonLanguageService,
  POKEMON_LANGUAGES,
} from '../../../core/services/pokemon-language.service';
import {
  AppearanceState,
  AVAILABLE_APPEARANCES,
} from '../../../shared/components/toolbar/toolbar.component';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, CdnUrlPipe],
  template: `
    <div class="container mx-auto px-4 pt-6 max-w-4xl">
      @if (user(); as currentUser) {
        <div class="bg-surface rounded-xl shadow-lg p-8 border border-theme">
          <div class="flex items-center gap-6 border-b border-theme pb-6">
            @if (currentUser.photoURL) {
              <img
                [src]="currentUser.photoURL"
                [alt]="currentUser.displayName || 'User'"
                class="w-24 h-24 rounded-full border-4 border-blue-200 shadow-md"
              />
            } @else {
              <div
                class="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold"
              >
                {{ getInitials(currentUser.displayName) }}
              </div>
            }

            <div>
              <h3 class="text-3xl font-bold text-primary">{{ currentUser.displayName }}</h3>
              <p class="text-secondary mt-1">{{ currentUser.email }}</p>
              @if (currentUser.emailVerified) {
                <span
                  class="inline-block mt-2 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full"
                >
                  ✓ Verified
                </span>
              }
            </div>
          </div>

          <div class="flex flex-col gap-6 border-b border-theme py-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-primary">App Theme</p>
                <p class="text-sm text-secondary">Change the App Theme</p>
              </div>
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

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-primary">Pokémon Language</p>
                <p class="text-sm text-secondary">Choose the display language for Pokémon names</p>
              </div>
              <select
                [ngModel]="pokemonLangService.currentLang()"
                (ngModelChange)="pokemonLangService.setLanguage($event)"
                class="bg-surface border border-theme rounded-lg px-3 py-2 text-sm text-primary focus:border-blue-500 outline-none transition-colors cursor-pointer"
              >
                @for (lang of languages; track lang.code) {
                  <option [value]="lang.code">{{ lang.flag }} {{ lang.label }}</option>
                }
              </select>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-primary">Ask to save Trainer</p>
                <p class="text-sm text-secondary">Ask to save new trainers</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [checked]="!promptDisabled"
                  (change)="toggleTrainerPrompt()"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                ></div>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-between gap-6 border-b border-theme py-6">
            <div>
              <p class="font-medium text-primary">Appearance Icons</p>
              <p class="text-sm text-secondary">
                Choose which icons should be displayed on Pokémon cards.
              </p>
            </div>

            <div class="relative flex items-center">
              <button
                (click)="toggleAppearanceDropdown()"
                class="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 bg-surface hover:bg-surface-hover text-primary shadow-sm border border-theme"
              >
                <svg fill="none" width="20" height="20" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  ></path>
                </svg>
                Appearance Icons
              </button>

              @if (isAppearanceDropdownOpen) {
                <div
                  class="absolute top-[120%] left-0 z-50 animate-in fade-in zoom-in-95 w-48 bg-surface border border-theme rounded-xl p-1 shadow-xl py-1 flex flex-col gap-1"
                >
                  @for (app of availableAppearances; track app.stateKey) {
                    <label
                      class="p-2 text-left text-sm font-medium transition-all flex items-center gap-3 hover:bg-surface-hover w-full rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        [checked]="appearanceState[app.stateKey]"
                        (change)="toggleAppearance(app.stateKey)"
                        class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      @if (app.icon) {
                        <img
                          [src]="app.icon | cdnUrl: app.cdnFolder"
                          [alt]="app.label"
                          [class]="app.iconClass"
                        />
                      }
                      {{ app.label }}
                    </label>
                  }
                </div>
              }
            </div>
          </div>

          <div class="flex justify-end pt-6 gap-6">
            <button
              (click)="goBack()"
              class="flex flex-row items-center gap-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 1024 1024"
              >
                <path d="M0 0h1024v1024H0z" fill="none" />
                <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64" />
                <path
                  fill="currentColor"
                  d="m237.2 512l265.5 265.3a32 32 0 0 1-45.4 45.4l-288-288a32 32 0 0 1 0-45.4l288-288a32 32 0 1 1 45.4 45.4z"
                />
              </svg>

              Back
            </button>
            <button
              (click)="signOut()"
              class="flex flex-row items-center gap-1 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path
                  fill="currentColor"
                  d="M4 12a.5.5 0 0 0 .5.5h8.793l-2.647 2.646a.5.5 0 1 0 .707.708l3.5-3.5a.5.5 0 0 0 0-.707l-3.5-3.5a.5.5 0 0 0-.707.707l2.647 2.646H4.5a.5.5 0 0 0-.5.5M17.5 2h-11A2.5 2.5 0 0 0 4 4.5v4a.5.5 0 0 0 1 0v-4A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-4a.5.5 0 0 0-1 0v4A2.5 2.5 0 0 0 6.5 22h11a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 17.5 2"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  public themeService = inject(ThemeService);
  pokemonLangService = inject(PokemonLanguageService);
  languages = POKEMON_LANGUAGES;

  user = this.authService.user;
  promptDisabled = localStorage.getItem('disableAutoTrainerPrompt') === 'true';

  availableAppearances = AVAILABLE_APPEARANCES;
  isAppearanceDropdownOpen = false;
  private elRef = inject(ElementRef);

  appearanceState: Record<string, boolean> = {
    showShiny: false,
    showGmax: false,
    showAlpha: false,
    showPokeball: false,
  };

  constructor() {
    const savedAppearance = localStorage.getItem('appearanceState');
    if (savedAppearance) {
      try {
        this.appearanceState = { ...this.appearanceState, ...JSON.parse(savedAppearance) };
      } catch (e) {
        console.error('Error parsing appearance state', e);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isAppearanceDropdownOpen = false;
    }
  }

  toggleAppearanceDropdown() {
    this.isAppearanceDropdownOpen = !this.isAppearanceDropdownOpen;
  }

  toggleAppearance(key: keyof AppearanceState | string) {
    this.appearanceState[key] = !this.appearanceState[key];
    localStorage.setItem('appearanceState', JSON.stringify(this.appearanceState));
  }

  toggleTrainerPrompt() {
    this.promptDisabled = !this.promptDisabled;
    if (this.promptDisabled) {
      localStorage.setItem('disableAutoTrainerPrompt', 'true');
    } else {
      localStorage.removeItem('disableAutoTrainerPrompt');
    }
  }

  getInitials(name: string | null): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async signOut() {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }

  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
