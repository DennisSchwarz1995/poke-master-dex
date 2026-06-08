import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import {
  PokemonLanguageService,
  POKEMON_LANGUAGES,
} from '../../../core/services/pokemon-language.service';
import {
  AppearanceState,
  AVAILABLE_APPEARANCES,
} from '../../../shared/components/toolbar/toolbar.component';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent, CdnUrlPipe],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      @if (user(); as currentUser) {
        <div class="bg-surface rounded-xl shadow-lg p-8 border border-theme">
          <h2 class="text-2xl font-bold mb-6 text-primary">Profile</h2>

          <div class="flex items-center gap-6 mb-8">
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

          <div class="border-t border-theme pt-6 mb-6">
            <h4 class="font-semibold text-primary mb-3">Account Information</h4>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-secondary">User ID</dt>
                <dd class="font-mono text-sm text-primary break-all">{{ currentUser.uid }}</dd>
              </div>
            </dl>
          </div>

          <div class="border-t border-theme pt-6 mb-6">
            <h4 class="font-semibold text-primary mb-3">Settings</h4>
            <div class="flex items-center justify-between py-3">
              <div>
                <p class="font-medium text-primary">Theme</p>
                <p class="text-sm text-secondary">Switch between light and dark mode</p>
              </div>
              <app-theme-toggle />
            </div>

            <div class="flex items-center justify-between py-3">
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

            <div
              class="flex items-center justify-between py-3 border-t border-theme border-opacity-50"
            >
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

          <div class="border-t border-theme pt-6 mb-6">
            <h4 class="font-semibold text-primary mb-3">Appearance Icons</h4>
            <p class="text-sm text-secondary mb-4">
              Choose which icons should be displayed on Pokémon cards.
            </p>

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
                Select Appearance Icons
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

          <div class="mt-8 flex gap-4">
            <button
              (click)="goBack()"
              class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2"
            >
              ← Back
            </button>
            <button
              (click)="signOut()"
              class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-semibold"
            >
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
