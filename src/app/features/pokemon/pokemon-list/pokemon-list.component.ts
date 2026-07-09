import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect,
  ElementRef,
  ViewChild,
  viewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, debounceTime, tap, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { DatasetPokemon, SimplePokemon } from '../../../shared/models/dataset.model';
import { ThemeService } from '../../../core/services/theme.service';
import { TypeColorService } from '../../../core/services/type-color.service';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../shared/components/custom-dropdown/custom-dropdown.component';
import { DatasetPokemonCardComponent } from '../../../shared/components/dataset-pokemon-card/dataset-pokemon-card.component';
import { getGameDropdownOptions } from '../../../core/constants/game-data.constants';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomDropdownComponent,
    DatasetPokemonCardComponent,
    CdnUrlPipe,
  ],
  template: `<main
    class="h-full max-w-[1600px] mx-auto w-full flex flex-col bg-bg-secondary px-4 pb-8 sm:px-6 lg:px-8"
  >
    <header class="z-40 bg-bg-secondary/95 pt-6 space-y-4 mb-6">
      <div class="flex justify-center">
        <div
          class="bg-surface border border-theme p-1 rounded-2xl flex max-w-md w-full shadow-sm gap-1"
        >
          <button
            (click)="viewMode.set('national')"
            class="flex-1 py-1.5 px-4 rounded-xl font-bold transition-all shadow-sm"
            role="tab"
            [attr.aria-selected]="viewMode() === 'national'"
            [ngClass]="
              viewMode() === 'national'
                ? 'text-primary bg-[var(--color-bg-active)]'
                : 'text-secondary hover:text-primary font-medium bg-transparent hover:bg-surface-hover'
            "
          >
            National Pokédex
          </button>
          <button
            (click)="viewMode.set('games')"
            class="flex-1 py-1.5 px-4 rounded-xl font-bold transition-all shadow-sm"
            role="tab"
            [attr.aria-selected]="viewMode() === 'games'"
            [ngClass]="
              viewMode() === 'games'
                ? 'text-primary bg-[var(--color-bg-active)]'
                : 'text-secondary hover:text-primary font-medium bg-transparent hover:bg-surface-hover'
            "
          >
            By Games
          </button>
        </div>
      </div>

      @if (viewMode() === 'games') {
        <div class="mt-8 mb-6 animation-fade-in max-w-3xl mx-auto w-full">
          <h1 class="text-3xl font-extrabold text-primary mb-2">See what you can catch</h1>
          <p class="text-secondary mb-6 leading-relaxed">
            Add every game you currently own to highlight which Pokémon are obtainable across the
            combined adventures. We will still list every Pokémon in National Dex order, but
            unavailable ones are greyed out.
          </p>

          <div class="flex flex-wrap gap-3 items-center mb-6 ">
            <div class="relative max-w-sm w-[300px]" #addGameContainer>
              <app-custom-dropdown
                [options]="availableGameOptions()"
                [searchable]="true"
                placeholder="+ Add a game"
                (valueChanged)="toggleGame($event)"
                [selectedId]="''"
              />
            </div>

            @for (game of selectedGameObjects(); track game.id) {
              <div
                class="flex items-center gap-2 px-3 py-1.5 bg-surface border border-theme rounded-xl shadow-sm"
              >
                <img
                  [src]="game.iconPath | cdnUrl: game.cdnFolder"
                  [alt]="game.shortName"
                  class="w-6 h-6 object-contain"
                />
                <span class="font-bold text-sm text-primary">{{ game.shortName }}</span>
                <button
                  (click)="removeGame(game.id!)"
                  class="ml-1 text-tertiary hover:text-primary transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            }
          </div>

          @if (selectedGames().length > 0) {
            <div class="flex justify-between items-end mb-4">
              <span class="text-secondary tracking-tight"
                >Tracking {{ selectedGames().length }} game{{
                  selectedGames().length === 1 ? '' : 's'
                }}.</span
              >
              <div
                class="flex gap-4 text-sm font-bold text-blue-500 underline underline-offset-4 decoration-dotted"
              >
                <button
                  class="hover:text-blue-400 transition-colors cursor-pointer"
                  (click)="selectedGames.set([])"
                >
                  Clear games
                </button>
              </div>
            </div>

            <section
              class="bg-surface rounded-2xl border border-theme p-5 sm:p-6 shadow-md mb-8"
              role="radiogroup"
              aria-labelledby="availability-heading"
            >
              <h3 class="text-lg font-bold text-primary mb-1">Pokémon availability</h3>
              <p class="text-secondary text-sm mb-6">
                Choose how the Pokédex responds to the games you own.
              </p>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  (click)="gameFilterMode.set('all')"
                  class="flex flex-col text-left p-4 rounded-xl border transition-all md:h-full group"
                  role="radio"
                  [attr.aria-checked]="gameFilterMode() === 'all'"
                  [ngClass]="
                    gameFilterMode() === 'all'
                      ? 'border-primary bg-blue-500/5'
                      : 'border-theme hover:border-primary/50 hover:bg-surface-hover'
                  "
                >
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0"
                      [ngClass]="
                        gameFilterMode() === 'all'
                          ? 'border-blue-500'
                          : 'border-tertiary group-hover:border-blue-500/50'
                      "
                    >
                      @if (gameFilterMode() === 'all') {
                        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                      }
                    </div>
                    <span class="font-bold text-primary truncate">Show all Pokémon</span>
                  </div>
                  <span class="text-sm text-secondary pl-7"
                    >Default view – keep every Pokémon visible.</span
                  >
                </button>

                <button
                  (click)="gameFilterMode.set('obtainable')"
                  class="flex flex-col text-left p-4 rounded-xl border transition-all md:h-full group"
                  [ngClass]="
                    gameFilterMode() === 'obtainable'
                      ? 'border-primary bg-blue-500/5'
                      : 'border-theme hover:border-primary/50 hover:bg-surface-hover'
                  "
                >
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0"
                      [ngClass]="
                        gameFilterMode() === 'obtainable'
                          ? 'border-blue-500'
                          : 'border-tertiary group-hover:border-blue-500/50'
                      "
                    >
                      @if (gameFilterMode() === 'obtainable') {
                        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                      }
                    </div>
                    <span class="font-bold text-primary truncate">Show only obtainable</span>
                  </div>
                  <span class="text-sm text-secondary pl-7"
                    >Hide Pokémon you cannot currently catch.</span
                  >
                </button>

                <button
                  (click)="gameFilterMode.set('unobtainable')"
                  class="flex flex-col text-left p-4 rounded-xl border transition-all md:h-full group"
                  [ngClass]="
                    gameFilterMode() === 'unobtainable'
                      ? 'border-primary bg-blue-500/5'
                      : 'border-theme hover:border-primary/50 hover:bg-surface-hover'
                  "
                >
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0"
                      [ngClass]="
                        gameFilterMode() === 'unobtainable'
                          ? 'border-blue-500'
                          : 'border-tertiary group-hover:border-blue-500/50'
                      "
                    >
                      @if (gameFilterMode() === 'unobtainable') {
                        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                      }
                    </div>
                    <span class="font-bold text-primary truncate">Show only unobtainable</span>
                  </div>
                  <span class="text-sm text-secondary pl-7"
                    >Focus on the Pokémon your games are missing.</span
                  >
                </button>
              </div>
            </section>
          }
        </div>
      }

      <div class="max-w-3xl w-full mx-auto relative flex flex-col gap-2">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search Pokémon..."
              aria-label="Search Pokémon"
              class="w-full pl-11 pr-4 py-2.5 bg-surface text-text-primary border border-theme rounded-3xl shadow-sm focus:border-[var(--color-active)] outline-none transition-all placeholder:text-text-tertiary font-medium bg-surface-hover"
            />
            <svg
              class="absolute left-4 top-3 w-5 h-5 text-text-tertiary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <button
            #filterBtn
            (click)="showFilters.set(!showFilters())"
            class="px-5 py-2.5 bg-surface text-primary border border-theme rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-bold bg-surface-hover"
            [class.bg-surface-raised]="showFilters()"
            [ngClass]="
              showFilters() ? 'bg-surface-raised focus:border-[var(--color-active)]' : 'bg-surface'
            "
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                aria-hidden="true"
              />
            </svg>
            <span class="hidden sm:inline">Filters</span>
          </button>
        </div>

        <div class="py-2 flex justify-center text-md font-medium text-secondary text-center px-4">
          @if (viewMode() === 'games' && selectedGames().length > 0) {
            @switch (gameFilterMode()) {
              @case ('all') {
                You can obtain {{ obtainableCount() }} of {{ allSimplePokemon().length }} Pokémon
                with the selected games.
              }
              @case ('obtainable') {
                Showing {{ activePokemonCount() }} obtainable Pokémon out of
                {{ allSimplePokemon().length }}.
              }
              @case ('unobtainable') {
                Showing {{ activePokemonCount() }} unobtainable Pokémon out of
                {{ allSimplePokemon().length }}.
              }
            }
          } @else {
            Showing {{ activePokemonCount() }} of {{ allSimplePokemon().length }} Pokémon.
          }
        </div>
        @if (showFilters()) {
          <div
            #filterContainer
            class="absolute top-[52px] right-0 w-120 bg-surface border border-theme rounded-2xl shadow-2xl p-5 z-50"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 mb-5">
              <div>
                <app-custom-dropdown
                  [options]="typeOptions()"
                  [selectedId]="selectedType()"
                  [searchable]="false"
                  (valueChanged)="selectedType.set($event); displayedCount.set(30)"
                  placeholder="ALL"
                  label="Type"
                />
              </div>
              <div>
                <app-custom-dropdown
                  [options]="colorOptions()"
                  [selectedId]="selectedColor()"
                  [searchable]="false"
                  (valueChanged)="selectedColor.set($event)"
                  placeholder="ALL"
                  label="Color"
                />
              </div>
              <div>
                <app-custom-dropdown
                  [options]="generationOptions()"
                  [selectedId]="selectedGeneration()"
                  [searchable]="false"
                  (valueChanged)="selectedGeneration.set($event); displayedCount.set(30)"
                  placeholder="ALL"
                  label="Generation"
                />
              </div>
              <div>
                <app-custom-dropdown
                  [options]="regionOptions()"
                  [selectedId]="selectedRegion()"
                  [searchable]="false"
                  (valueChanged)="selectedRegion.set($event); displayedCount.set(30)"
                  placeholder="ALL"
                  label="Region"
                />
              </div>
            </div>

            <div class="border-t border-theme pt-4 mb-4 flex flex-col gap-2">
              <p class="text-xs font-bold uppercase tracking-wider text-secondary">Options</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  class="flex items-center justify-between gap-3 cursor-pointer select-none group"
                >
                  <span
                    class="text-sm font-medium text-primary group-hover:text-blue-400 transition-colors"
                    >Exclude forms</span
                  >
                  <button
                    type="button"
                    (click)="excludeForms.set(!excludeForms()); displayedCount.set(30)"
                    class="relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none flex-shrink-0"
                    [class.bg-blue-500]="excludeForms()"
                    [class.bg-[var(--color-surface-raised)]]="!excludeForms()"
                    role="switch"
                    [attr.aria-checked]="excludeForms()"
                    aria-labelledby="exclude-forms-label"
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                      [class.translate-x-5]="excludeForms()"
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="resetFilters()"
                [disabled]="!hasActiveFilters()"
                class="flex items-center gap-1.5 px-1.5 py-1.5 text-xs font-semibold rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:text-red-500 enabled:hover:bg-surface-hover"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Reset
              </button>
            </div>
          </div>
        }
      </div>
    </header>

    @if (isLoadingList()) {
      <div class="flex justify-center items-center h-64" aria-live="polite" aria-busy="true">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    } @else {
      <section
        class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 pb-8"
      >
        @for (item of processedDisplayedPokemon(); track item.pokemon.id) {
          <app-dataset-pokemon-card [pokemon]="item.pokemon" [isGreyedOut]="item.isGreyedOut">
          </app-dataset-pokemon-card>
        }
      </section>

      <div #scrollTarget class="h-20 w-full flex items-center justify-center">
        @if (isPageLoading()) {
          <div class="animate-pulse flex space-x-2">
            <div class="h-3 w-3 bg-blue-500 rounded-full"></div>
            <div class="h-3 w-3 bg-blue-500 rounded-full animation-delay-200"></div>
            <div class="h-3 w-3 bg-blue-500 rounded-full animation-delay-400"></div>
          </div>
        }
      </div>

      @if (!isPageLoading() && displayedPokemon().length === 0) {
        <div class="text-center py-20 text-secondary" aria-live="polite">
          <svg
            class="w-16 h-16 mx-auto text-tertiary mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p aria-live="polite" class="text-xl font-medium">
            No Pokémon found matching your search.
          </p>
        </div>
      }
    }
  </main> `,
  styles: [
    `
      .animation-delay-200 {
        animation-delay: 200ms;
      }
      .animation-delay-400 {
        animation-delay: 400ms;
      }
    `,
  ],
})
export class PokemonListComponent implements OnInit, OnDestroy {
  datasetService = inject(DatasetService);
  themeService = inject(ThemeService);
  typeColorService = inject(TypeColorService);
  langService = inject(PokemonLanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allSlugs = signal<string[]>([]);
  allSimplePokemon = signal<SimplePokemon[]>([]);
  searchQuery = signal('');

  scrollTarget = viewChild<ElementRef>('scrollTarget');
  @ViewChild('filterBtn') filterBtn!: ElementRef;
  @ViewChild('filterContainer') filterContainer!: ElementRef;
  private observer: IntersectionObserver | null = null;

  showFilters = signal(false);
  selectedType = signal<string>('');
  selectedColor = signal<string>('');
  selectedGeneration = signal<string>('');
  showShinyOnly = signal(false);
  excludeForms = signal(false);

  typeOptions = signal<CustomDropdownOption[]>([
    { id: '', name: 'ALL' },
    ...[
      'normal',
      'fire',
      'water',
      'grass',
      'electric',
      'ice',
      'fighting',
      'poison',
      'ground',
      'flying',
      'psychic',
      'bug',
      'rock',
      'ghost',
      'dragon',
      'dark',
      'steel',
      'fairy',
    ].map((type) => ({
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      iconPath: `${type}.png`,
      cdnFolder: 'types',
    })),
  ]);

  private colorDot(hex: string): string {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><circle cx='5' cy='5' r='4' fill='${hex}' stroke='rgba(128,128,128,0.35)' stroke-width='1'/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  colorOptions = signal<CustomDropdownOption[]>([
    { id: '', name: 'ALL' },
    { id: 'red', name: 'Red', iconPath: this.colorDot('#ef4444') },
    { id: 'blue', name: 'Blue', iconPath: this.colorDot('#3b82f6') },
    { id: 'yellow', name: 'Yellow', iconPath: this.colorDot('#eab308') },
    { id: 'green', name: 'Green', iconPath: this.colorDot('#22c55e') },
    { id: 'black', name: 'Black', iconPath: this.colorDot('#374151') },
    { id: 'brown', name: 'Brown', iconPath: this.colorDot('#92400e') },
    { id: 'purple', name: 'Purple', iconPath: this.colorDot('#a855f7') },
    { id: 'gray', name: 'Gray', iconPath: this.colorDot('#9ca3af') },
    { id: 'white', name: 'White', iconPath: this.colorDot('#e5e7eb') },
    { id: 'pink', name: 'Pink', iconPath: this.colorDot('#ec4899') },
  ]);

  generationOptions = signal<CustomDropdownOption[]>([
    { id: '', name: 'ALL' },
    { id: '1', name: 'Generation I', description: 'Kanto (#1–151)' },
    { id: '2', name: 'Generation II', description: 'Johto (#152–251)' },
    { id: '3', name: 'Generation III', description: 'Hoenn (#252–386)' },
    { id: '4', name: 'Generation IV', description: 'Sinnoh (#387–493)' },
    { id: '5', name: 'Generation V', description: 'Unova (#494–649)' },
    { id: '6', name: 'Generation VI', description: 'Kalos (#650–721)' },
    { id: '7', name: 'Generation VII', description: 'Alola (#722–809)' },
    { id: '8', name: 'Generation VIII', description: 'Galar (#810–905)' },
    { id: '9', name: 'Generation IX', description: 'Paldea (#906–1025)' },
  ]);

  regionOptions = signal<CustomDropdownOption[]>([
    { id: '', name: 'ALL' },
    { id: 'kanto', name: 'Kanto', description: 'Gen I' },
    { id: 'johto', name: 'Johto', description: 'Gen II' },
    { id: 'hoenn', name: 'Hoenn', description: 'Gen III' },
    { id: 'sinnoh', name: 'Sinnoh', description: 'Gen IV' },
    { id: 'unova', name: 'Unova', description: 'Gen V' },
    { id: 'kalos', name: 'Kalos', description: 'Gen VI' },
    { id: 'alola', name: 'Alola', description: 'Gen VII' },
    { id: 'galar', name: 'Galar', description: 'Gen VIII' },
    { id: 'hisui', name: 'Hisui', description: 'Gen VIII' },
    { id: 'paldea', name: 'Paldea', description: 'Gen IX' },
  ]);

  selectedRegion = signal<string>('');

  private generationRanges: Record<string, [number, number]> = {
    '1': [1, 151],
    '2': [152, 251],
    '3': [252, 386],
    '4': [387, 493],
    '5': [494, 649],
    '6': [650, 721],
    '7': [722, 809],
    '8': [810, 905],
    '9': [906, 1025],
  };

  private regionRanges: Record<string, [number, number][]> = {
    kanto: [[1, 151]],
    johto: [[152, 251]],
    hoenn: [[252, 386]],
    sinnoh: [[387, 493]],
    unova: [[494, 649]],
    kalos: [[650, 721]],
    alola: [[722, 809]],
    galar: [[810, 905]],
    hisui: [[899, 905]], // Hisuian forms share Sinnoh dex but hisui-specific range roughly
    paldea: [[906, 1025]],
  };

  hasActiveFilters = computed(
    () =>
      !!this.selectedType() ||
      !!this.selectedColor() ||
      !!this.selectedGeneration() ||
      !!this.selectedRegion() ||
      this.excludeForms(),
  );

  displayedCount = signal(30);

  isLoadingList = signal(true);
  isPageLoading = signal(false);

  displayedPokemon = signal<DatasetPokemon[]>([]);

  viewMode = signal<'national' | 'games'>('national');
  selectedGames = signal<string[]>([]);
  gameFilterMode = signal<'all' | 'obtainable' | 'unobtainable'>('all');

  availableGameOptions = computed(() => {
    const selectedIds = this.selectedGames();
    return this.gameOptions().map((game) => ({
      ...game,
      active: selectedIds.includes(game.id),
    }));
  });

  selectedGameObjects = computed(() => {
    const allGames = this.gameOptions();
    return this.selectedGames()
      .map((gameId) => {
        const game = allGames.find((game) => game.id === gameId);
        return {
          ...game,
          shortName: game?.name.replace('Pokémon ', '') || '',
        };
      })
      .filter((game) => game.id);
  });

  obtainableCount = computed(() => {
    const games = this.selectedGames();
    const all = this.allSimplePokemon();
    const slugs = this.filteredSlugs();

    if (games.length === 0) return slugs.length;

    return slugs.filter((slug) => {
      const pkmn = all.find((pokemon) => pokemon.slug === slug);
      return pkmn && games.some((g) => pkmn.obtainableIn?.includes(g));
    }).length;
  });

  processedDisplayedPokemon = computed(() => {
    const pokemons = this.displayedPokemon();
    const mode = this.viewMode();
    const games = this.selectedGames();
    const gameMode = this.gameFilterMode();
    const allSimple = this.allSimplePokemon();

    return pokemons.map((pkmn) => {
      let greyedOut = false;

      if (mode === 'games' && games.length > 0) {
        const simple = allSimple.find((pokemon) => pokemon.slug === pkmn.id);
        if (simple) {
          const isObtainable = games.some((game) => simple.obtainableIn?.includes(game));

          if (gameMode === 'all') {
            greyedOut = !isObtainable;
          } else if (gameMode === 'unobtainable') {
            greyedOut = true;
          }
        }
      }

      return {
        pokemon: pkmn,
        isGreyedOut: greyedOut,
      };
    });
  });

  gameOptions = signal<CustomDropdownOption[]>(getGameDropdownOptions());

  filteredSlugs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const typeFilter = this.selectedType();
    const genFilter = this.selectedGeneration();
    const regionFilter = this.selectedRegion();
    const excludeForms = this.excludeForms();
    const mode = this.viewMode();
    const games = this.selectedGames();
    const gameMode = this.gameFilterMode();
    let slugs = this.allSlugs();

    const genRange = genFilter ? this.generationRanges[genFilter] : null;
    const regionRange = regionFilter ? this.regionRanges[regionFilter] : null;

    const allPokemon = this.allSimplePokemon();
    if (allPokemon.length > 0) {
      const matchingIds = new Set<string>();
      for (const p of allPokemon) {
        if (typeFilter && p.type1 !== typeFilter && p.type2 !== typeFilter) continue;

        if (genRange && (p.dexNum < genRange[0] || p.dexNum > genRange[1])) continue;

        if (regionRange) {
          const inRegion = regionRange.some(([lo, hi]) => p.dexNum >= lo && p.dexNum <= hi);
          if (!inRegion) continue;
        }

        if (excludeForms && p.isForm) continue;

        if (mode === 'games' && games.length > 0) {
          const isObtainable = games.some((g) => p.obtainableIn?.includes(g));
          if (gameMode === 'obtainable' && !isObtainable) continue;
          if (gameMode === 'unobtainable' && isObtainable) continue;
        }

        if (!query) {
          matchingIds.add(p.slug);
          continue;
        }

        if (p.slug.includes(query)) {
          matchingIds.add(p.slug);
          continue;
        }

        for (const name of Object.values(p.allNames || {})) {
          if (name && name.toLowerCase().includes(query)) {
            matchingIds.add(p.slug);
            break;
          }
        }
      }
      return slugs.filter((s) => matchingIds.has(s));
    }

    // Fallback: slug-only search if dataset isn't fully loaded
    return slugs.filter((s) => s.includes(query) || s.replace(/-/g, ' ').includes(query));
  });

  activePokemonCount = computed(() => {
    const slugs = this.filteredSlugs();
    const mode = this.viewMode();
    const games = this.selectedGames();
    const gameMode = this.gameFilterMode();

    if (mode === 'games' && games.length > 0 && gameMode === 'all') {
      const all = this.allSimplePokemon();
      return slugs.filter((slug) => {
        const p = all.find((ap) => ap.slug === slug);
        return p && games.some((g) => p.obtainableIn?.includes(g));
      }).length;
    }

    return slugs.length;
  });

  @HostListener('document:click', ['$event'])
  onGlobalClick(event: MouseEvent) {
    if (!this.showFilters()) return;

    const target = event.target as Node;
    const isClickInsideContainer = this.filterContainer?.nativeElement.contains(target);
    const isClickOnButton = this.filterBtn?.nativeElement.contains(target);

    if (!isClickInsideContainer && !isClickOnButton) {
      this.showFilters.set(false);
    }
  }

  visibleSlugs = computed(() => {
    return this.filteredSlugs().slice(0, this.displayedCount());
  });

  constructor() {
    toObservable(this.visibleSlugs)
      .pipe(
        tap(() => this.isPageLoading.set(true)),
        debounceTime(300),
        switchMap((currentList) => {
          if (currentList.length === 0) return of([]);

          const requests = currentList.map((slug) =>
            this.datasetService.loadPokemonBySlug(slug).pipe(catchError(() => of(null))),
          );

          return forkJoin(requests);
        }),
      )
      .subscribe((results) => {
        const validResults = results.filter((r): r is DatasetPokemon => r !== null);
        this.displayedPokemon.set(validResults);
        setTimeout(() => this.isPageLoading.set(false), 50); // slight delay to prevent flicker
      });

    effect(() => {
      const params: Record<string, string> = {};
      if (this.selectedType()) params['type'] = this.selectedType();
      if (this.selectedColor()) params['color'] = this.selectedColor();
      if (this.selectedGeneration()) params['generation'] = this.selectedGeneration();
      if (this.selectedRegion()) params['region'] = this.selectedRegion();
      if (this.excludeForms()) params['excludeForms'] = '1';

      this.router.navigate([], {
        queryParams: Object.keys(params).length > 0 ? params : {},
        replaceUrl: true,
      });

      const target = this.scrollTarget()?.nativeElement;

      if (target) {
        this.setupIntersectionObserver(target);
      } else {
        if (this.observer) {
          this.observer.disconnect();
        }
      }
    });
  }

  ngOnInit() {
    this.datasetService.loadPokemonIndex().subscribe({
      next: (slugs) => {
        this.allSlugs.set(slugs);
        this.isLoadingList.set(false);
      },
      error: (err) => {
        console.error('Failed to load pokemon indices', err);
        this.isLoadingList.set(false);
      },
    });

    this.datasetService.getSimplePokemonList().subscribe({
      next: (list) => {
        this.allSimplePokemon.set(list);
      },
    });

    this.route.queryParams
      .pipe(take(1))
      .subscribe(({ type, color, generation, region, excludeForms }) => {
        if (type) this.selectedType.set(type);
        if (color) this.selectedColor.set(color);
        if (generation) this.selectedGeneration.set(generation);
        if (region) this.selectedRegion.set(region);
        if (excludeForms === '1') this.excludeForms.set(true);
      });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver(targetElement: Element) {
    const options = {
      root: null,
      rootMargin: '400px',
      threshold: 0,
    };

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this.isPageLoading() && !this.isLoadingList()) {
        const totalFiltered = this.filteredSlugs().length;
        if (this.displayedCount() < totalFiltered) {
          this.displayedCount.update((c) => c + 30);
        }
      }
    }, options);

    this.observer.observe(targetElement);
  }

  onSearchChange() {
    this.displayedCount.set(30);
  }

  resetFilters() {
    this.selectedType.set('');
    this.selectedColor.set('');
    this.selectedGeneration.set('');
    this.selectedRegion.set('');
    this.showShinyOnly.set(false);
    this.excludeForms.set(false);
    this.displayedCount.set(30);
  }

  toggleGame(id: string) {
    if (!id) {
      this.selectedGames.set([]);
      return;
    }

    this.selectedGames.update((games) => {
      if (games.includes(id)) {
        return games.filter((g) => g !== id);
      }
      return [...games, id];
    });
  }

  removeGame(id: string) {
    this.selectedGames.update((games) => games.filter((g) => g !== id));
  }
}
