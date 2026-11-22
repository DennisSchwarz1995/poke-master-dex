import { Component, inject, signal, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DemoSeedService } from '../../../core/services/demo-seed.service';
import {
  PokemonLanguageService,
  POKEMON_LANGUAGES,
  PokemonLangCode,
} from '../../../core/services/pokemon-language.service';
import {
  AppearanceState,
  AVAILABLE_APPEARANCES,
} from '../../../shared/components/toolbar/toolbar.component';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';
import { ThemeService } from '../../../core/services/theme.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TrainerManagementDialogComponent } from '../../dashboard/trainer-management-dialog/trainer-management-dialog.component';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdnUrlPipe,
    IconComponent,
    TrainerManagementDialogComponent,
    TooltipDirective,
    CustomDropdownComponent,
  ],
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

            <div class="flex flex-col gap-2 items-start">
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="text-3xl font-bold text-primary">
                  {{ currentUser.displayName || (isDemoUser() ? 'Demo Trainer' : '') }}
                </h3>
                @if (isDemoUser()) {
                  <span
                    class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  >
                    Demo Session
                  </span>
                }
              </div>
              @if (isDemoUser()) {
                <p class="text-secondary text-sm mt-1">
                  Temporary guest session, demo data is cleared on sign out
                </p>
              } @else {
                <p class="text-secondary mt-1">{{ currentUser.email }}</p>
                @if (currentUser.emailVerified) {
                  <span class="self-start bg-surface-raised text-xs py-1 px-2 rounded-full">
                    E-Mail Verified
                  </span>
                }
              }
            </div>
          </div>

          <div class="flex flex-col gap-6 py-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-primary">App Theme</p>
                <p class="text-sm text-secondary">Change the App Theme</p>
              </div>
              <button
                (click)="themeService.toggleTheme()"
                class="p-2 flex items-center rounded-xl text-secondary hover:text-primary hover:bg-surface-hover transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
                [appTooltip]="
                  themeService.currentTheme() === 'dark'
                    ? 'Switch to Light Mode'
                    : 'Switch to Dark Mode'
                "
                tooltipPosition="top"
              >
                @if (themeService.currentTheme() === 'light') {
                  <app-icon name="sun"></app-icon>
                } @else {
                  <app-icon name="moon"></app-icon>
                }
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-primary">Pokémon Language</p>
                <p class="text-sm text-secondary">Choose the display language for Pokémon names</p>
              </div>
              <app-custom-dropdown
                [options]="languageOptions"
                [selectedId]="pokemonLangService.currentLang()"
                (valueChanged)="onLanguageChange($event)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-primary">Ask to save Trainer</p>
                <p class="text-sm text-secondary">
                  If adding an Trainer which is not in the List to a Pokemon, a Dialog will open
                  asking you if you want to save the Trainer.
                </p>
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

          <div class="flex items-center justify-between py-6">
            <div>
              <p class="font-medium text-primary">Appearance Icons</p>
              <p class="text-sm text-secondary">
                Choose which icons should be displayed on Pokémon cards.
              </p>
            </div>

            <div class="relative flex items-center" #appearanceDropdown>
              <button
                (click)="toggleAppearanceDropdown()"
                class="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 bg-surface hover:bg-surface-hover text-primary shadow-sm border border-theme"
              >
                <app-icon name="appearance"></app-icon>
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

          <div class="flex items-center justify-between gap-6 border-b border-theme py-6">
            <div>
              <p class="font-medium text-primary">Manage Trainers</p>
              <p class="text-sm text-secondary">
                Add, edit or remove trainers for your Pokédex collections.
              </p>
            </div>
            <button
              (click)="openTrainerManagement()"
              class="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 bg-surface hover:bg-surface-hover text-primary shadow-sm border border-theme"
            >
              <app-icon name="forms"></app-icon>
              Trainers
            </button>
          </div>

          <div class="flex justify-end pt-6 gap-6">
            <button
              (click)="goBack()"
              class="flex flex-row items-center gap-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2"
            >
              <app-icon name="previous"></app-icon>
              Back
            </button>
            <button
              (click)="signOut()"
              class="flex flex-row items-center gap-1 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              <app-icon name="sign-out"></app-icon>
              Sign Out
            </button>
          </div>
        </div>
      }
    </div>

    @if (showTrainerDialog()) {
      <app-trainer-management-dialog (closed)="closeTrainerDialog()" />
    }
  `,
  styles: [],
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private demoSeedService = inject(DemoSeedService);
  private router = inject(Router);
  public themeService = inject(ThemeService);
  pokemonLangService = inject(PokemonLanguageService);
  languages = POKEMON_LANGUAGES;

  languageOptions: CustomDropdownOption[] = this.languages.map((lang) => ({
    id: lang.code,
    name: lang.label,
    iconHtml: `<span class="border text-primary rounded-md px-4 py-[4px] text-[10px] leading-none font-bold w-9 flex items-center justify-center">${lang.badge}</span>`,
  }));

  user = this.authService.user;
  isDemoUser = this.authService.isDemoUser;
  promptDisabled = localStorage.getItem('disableAutoTrainerPrompt') === 'true';
  showTrainerDialog = signal(false);

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

  @ViewChild('appearanceDropdown') appearanceDropdownRef?: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isAppearanceDropdownOpen && this.appearanceDropdownRef) {
      if (!this.appearanceDropdownRef.nativeElement.contains(event.target)) {
        this.isAppearanceDropdownOpen = false;
      }
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

  onLanguageChange(langId: string) {
    if (langId) {
      this.pokemonLangService.setLanguage(langId as PokemonLangCode);
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
    if (this.isDemoUser()) {
      await this.demoSeedService.cleanupDemoAccount();
    }
    await this.authService.signOutAndCleanup();
    await this.router.navigate(['/home']);
  }

  private location = inject(Location);

  goBack() {
    this.location.back();
  }

  openTrainerManagement() {
    this.showTrainerDialog.set(true);
  }

  closeTrainerDialog() {
    this.showTrainerDialog.set(false);
  }
}
