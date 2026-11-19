import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect,
  ElementRef,
  viewChild,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
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
import { GameDataService } from '../../../core/services/game-data.service';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { DropdownOptionService } from '../../../core/services/dropdown-option.service';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';

const createColorDot = (hex: string): string => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><circle cx='5' cy='5' r='4' fill='${hex}' stroke='rgba(128,128,128,0.35)' stroke-width='1'/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const COLOR_OPTIONS: CustomDropdownOption[] = [
  { id: '', name: 'ALL' },
  { id: 'red', name: 'Red', iconPath: createColorDot('#ef4444') },
  { id: 'blue', name: 'Blue', iconPath: createColorDot('#3b82f6') },
  { id: 'yellow', name: 'Yellow', iconPath: createColorDot('#eab308') },
  { id: 'green', name: 'Green', iconPath: createColorDot('#22c55e') },
  { id: 'black', name: 'Black', iconPath: createColorDot('#374151') },
  { id: 'brown', name: 'Brown', iconPath: createColorDot('#92400e') },
  { id: 'purple', name: 'Purple', iconPath: createColorDot('#a855f7') },
  { id: 'gray', name: 'Gray', iconPath: createColorDot('#9ca3af') },
  { id: 'white', name: 'White', iconPath: createColorDot('#e5e7eb') },
  { id: 'pink', name: 'Pink', iconPath: createColorDot('#ec4899') },
];

const GENERATION_OPTIONS: CustomDropdownOption[] = [
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
];

const REGION_OPTIONS: CustomDropdownOption[] = [
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
];

const GENERATION_RANGES: Record<string, [number, number]> = {
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

const REGION_RANGES: Record<string, [number, number][]> = {
  kanto: [[1, 151]],
  johto: [[152, 251]],
  hoenn: [[252, 386]],
  sinnoh: [[387, 493]],
  unova: [[494, 649]],
  kalos: [[650, 721]],
  alola: [[722, 809]],
  galar: [[810, 905]],
  hisui: [[899, 905]],
  paldea: [[906, 1025]],
};

const GAME_FILTER_OPTIONS = [
  { value: 'all', label: 'Show all Pokémon', desc: 'Default view – keep every Pokémon visible.' },
  {
    value: 'obtainable',
    label: 'Show only obtainable',
    desc: 'Hide Pokémon you cannot currently catch.',
  },
  {
    value: 'unobtainable',
    label: 'Show only unobtainable',
    desc: 'Focus on the Pokémon your games are missing.',
  },
] as const;

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomDropdownComponent,
    DatasetPokemonCardComponent,
    CdnUrlPipe,
    SearchInputComponent,
    IconComponent,
    TooltipDirective,
  ],
  template: `
    <main
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
              [class.text-primary]="viewMode() === 'national'"
              [class.bg-[var(--color-bg-active)]]="viewMode() === 'national'"
              [class.text-secondary]="viewMode() !== 'national'"
              [class.hover:text-primary]="viewMode() !== 'national'"
              [class.bg-transparent]="viewMode() !== 'national'"
              [class.hover:bg-surface-hover]="viewMode() !== 'national'"
            >
              National Pokédex
            </button>
            <button
              (click)="viewMode.set('games')"
              class="flex-1 py-1.5 px-4 rounded-xl font-bold transition-all shadow-sm"
              role="tab"
              [attr.aria-selected]="viewMode() === 'games'"
              [class.text-primary]="viewMode() === 'games'"
              [class.bg-[var(--color-bg-active)]]="viewMode() === 'games'"
              [class.text-secondary]="viewMode() !== 'games'"
              [class.hover:text-primary]="viewMode() !== 'games'"
              [class.bg-transparent]="viewMode() !== 'games'"
              [class.hover:bg-surface-hover]="viewMode() !== 'games'"
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

            <div class="flex flex-wrap gap-3 items-center mb-6">
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
                  class="flex items-center gap-2 p-3 bg-surface border border-theme rounded-xl shadow-sm"
                >
                  <img
                    [src]="game.iconPath | cdnUrl: game.cdnFolder"
                    [alt]="game.shortName"
                    class="w-6 h-6 object-contain"
                  />
                  <span class="font-semibold text-lg text-secondary">{{ game.shortName }}</span>
                  <button
                    (click)="removeGame(game.id!)"
                    class="flex flex-col items-center gap-2 transition-colors"
                  >
                    <div
                      class="flex items-center p-1 rounded-full text-secondary hover:text-primary hover:bg-surface-hover active:scale-95"
                    >
                      <app-icon
                        name="close"
                        size="1em"
                        [appTooltip]="'Remove'"
                        tooltipPosition="top"
                      ></app-icon>
                    </div>
                  </button>
                </div>
              }
            </div>

            @if (selectedGames().length > 0) {
              <div class="flex justify-between items-end mb-4">
                <span class="text-secondary tracking-tight">
                  Tracking {{ selectedGames().length }} game{{
                    selectedGames().length === 1 ? '' : 's'
                  }}.
                </span>
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
              >
                <h3 class="text-lg font-bold text-primary mb-1">Pokémon availability</h3>
                <p class="text-secondary text-sm mb-6">
                  Choose how the Pokédex responds to the games you own.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  @for (option of gameFilterOptions; track option.value) {
                    <button
                      (click)="gameFilterMode.set(option.value)"
                      class="flex flex-col text-left p-4 rounded-xl border transition-all md:h-full group"
                      role="radio"
                      [attr.aria-checked]="gameFilterMode() === option.value"
                      [class.border-[var(--color-active)]]="gameFilterMode() === option.value"
                      [class.bg-[--color-surface-raised]]="gameFilterMode() === option.value"
                      [class.border-theme]="gameFilterMode() !== option.value"
                      [class.hover:bg-surface-hover]="gameFilterMode() !== option.value"
                    >
                      <div class="flex items-center gap-3 mb-2">
                        <div
                          class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0"
                          [class.border-[var(--color-active)]]="gameFilterMode() === option.value"
                          [class.border-tertiary]="gameFilterMode() !== option.value"
                          [class.group-hover:border-blue-500]="gameFilterMode() !== option.value"
                        >
                          @if (gameFilterMode() === option.value) {
                            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                          }
                        </div>
                        <span class="font-bold text-primary truncate">{{ option.label }}</span>
                      </div>
                      <span class="text-sm text-secondary pl-7">{{ option.desc }}</span>
                    </button>
                  }
                </div>
              </section>
            }
          </div>
        }

        <div class="max-w-3xl w-full mx-auto relative flex flex-col gap-2">
          <div class="flex gap-3">
            <app-search-input
              class="flex-1"
              [(value)]="searchQuery"
              (searchChange)="onSearchChange()"
            />

            <button
              #filterBtn
              (click)="showFilters.set(!showFilters())"
              class="px-5 py-2.5 bg-surface text-primary border border-theme rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-bold bg-surface-hover"
              [class.bg-surface-raised]="showFilters()"
              [class.focus:border-[var(--color-active)]]="showFilters()"
            >
              <app-icon name="filter" size="1em"></app-icon>
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
                    >
                      Exclude forms
                    </span>
                    <button
                      type="button"
                      (click)="excludeForms.set(!excludeForms()); displayedCount.set(30)"
                      class="relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none flex-shrink-0"
                      [class.bg-blue-500]="excludeForms()"
                      [class.bg-[var(--color-surface-raised)]]="!excludeForms()"
                      role="switch"
                      [attr.aria-checked]="excludeForms()"
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
            <app-dataset-pokemon-card
              [pokemon]="item.pokemon"
              [isGreyedOut]="item.isGreyedOut"
            ></app-dataset-pokemon-card>
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
            <p class="text-xl font-medium">No Pokémon found matching your search.</p>
          </div>
        }
      }
    </main>
  `,
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
  private gameDataService = inject(GameDataService);
  private dropdownOptionService = inject(DropdownOptionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allSlugs = signal<string[]>([]);
  allSimplePokemon = signal<SimplePokemon[]>([]);
  searchQuery = signal('');
  debouncedSearchQuery = toSignal(toObservable(this.searchQuery).pipe(debounceTime(300)), {
    initialValue: '',
  });

  scrollTarget = viewChild<ElementRef>('scrollTarget');
  filterBtn = viewChild<ElementRef>('filterBtn');
  filterContainer = viewChild<ElementRef>('filterContainer');
  private observer: IntersectionObserver | null = null;

  showFilters = signal(false);
  selectedType = signal<string>('');
  selectedColor = signal<string>('');
  selectedGeneration = signal<string>('');
  selectedRegion = signal<string>('');
  showShinyOnly = signal(false);
  excludeForms = signal(false);

  colorOptions = signal(COLOR_OPTIONS);
  generationOptions = signal(GENERATION_OPTIONS);
  regionOptions = signal(REGION_OPTIONS);
  gameFilterOptions = GAME_FILTER_OPTIONS;

  typeOptions = computed<CustomDropdownOption[]>(() => [
    { id: '', name: 'ALL' },
    ...this.dropdownOptionService.mapTypes(this.typeColorService.getAllTypes()),
  ]);

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
  gameOptions = signal<CustomDropdownOption[]>(this.gameDataService.getGameDropdownOptions());

  availableGameOptions = computed(() => {
    const selectedIds = this.selectedGames();
    return this.gameOptions().map((game) => ({
      ...game,
      active: selectedIds.includes(game.id),
    }));
  });

  selectedGameObjects = computed(() => {
    const allGames = this.gameOptions();
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

    return this.selectedGames()
      .map((gameId) => {
        const game = allGames.find((g) => g.id === gameId);
        const gameDef = this.gameDataService.getGameByCode(gameId);
        const genText = gameDef?.gen
          ? `Generation ${romanNumerals[gameDef.gen - 1] || gameDef.gen}`
          : '';
        return {
          ...game,
          shortName: game?.name.replace('Pokémon ', '') || '',
          generation: genText,
        };
      })
      .filter((game) => game.id);
  });

  private baseFilteredPokemon = computed(() => {
    const typeFilter = this.selectedType();
    const genFilter = this.selectedGeneration();
    const regionFilter = this.selectedRegion();
    const excludeForms = this.excludeForms();
    const allPokemon = this.allSimplePokemon();

    const genRange = genFilter ? GENERATION_RANGES[genFilter] : null;
    const regionRange = regionFilter ? REGION_RANGES[regionFilter] : null;

    if (!typeFilter && !genRange && !regionRange && !excludeForms) {
      return allPokemon;
    }

    return allPokemon.filter((p) => {
      if (typeFilter && p.type1 !== typeFilter && p.type2 !== typeFilter) return false;
      if (genRange && (p.dexNum < genRange[0] || p.dexNum > genRange[1])) return false;
      if (regionRange) {
        const inRegion = regionRange.some(([lo, hi]) => p.dexNum >= lo && p.dexNum <= hi);
        if (!inRegion) return false;
      }
      if (excludeForms && p.isForm) return false;
      return true;
    });
  });

  private gameFilteredPokemon = computed(() => {
    const basePokemons = this.baseFilteredPokemon();
    const mode = this.viewMode();
    const games = this.selectedGames();
    const gameMode = this.gameFilterMode();

    if (mode !== 'games' || games.length === 0) return basePokemons;

    return basePokemons.filter((p) => {
      const isObtainable = games.some((g) => p.obtainableIn?.includes(g));
      if (gameMode === 'obtainable' && !isObtainable) return false;
      if (gameMode === 'unobtainable' && isObtainable) return false;
      return true;
    });
  });

  private filterSlugsByQuery(rawQuery: string): string[] {
    const query = rawQuery.toLowerCase().trim();
    const pokemons = this.gameFilteredPokemon();

    let matchingPokemons = pokemons;

    if (query) {
      matchingPokemons = pokemons.filter((p) => {
        if (p.slug.includes(query)) return true;
        return Object.values(p.allNames || {}).some(
          (name) => name && name.toLowerCase().includes(query),
        );
      });
    }

    const matchingIds = new Set(matchingPokemons.map((p) => p.slug));
    return this.allSlugs().filter((s) => matchingIds.has(s));
  }

  filteredSlugs = computed(() => this.filterSlugsByQuery(this.searchQuery()));

  debouncedFilteredSlugs = computed(() => this.filterSlugsByQuery(this.debouncedSearchQuery()));

  obtainableCount = computed(() => {
    const games = this.selectedGames();
    const slugs = this.debouncedFilteredSlugs();
    const all = this.allSimplePokemon();

    if (games.length === 0) return slugs.length;

    return slugs.filter((slug) => {
      const pkmn = all.find((p) => p.slug === slug);
      return pkmn && games.some((g) => pkmn.obtainableIn?.includes(g));
    }).length;
  });

  activePokemonCount = computed(() => this.debouncedFilteredSlugs().length);

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
          if (gameMode === 'all') greyedOut = !isObtainable;
          else if (gameMode === 'unobtainable') greyedOut = true;
        }
      }

      return { pokemon: pkmn, isGreyedOut: greyedOut };
    });
  });

  visibleSlugs = computed(() => this.filteredSlugs().slice(0, this.displayedCount()));

  @HostListener('document:click', ['$event'])
  onGlobalClick(event: MouseEvent) {
    if (!this.showFilters()) return;

    const target = event.target as Node;
    const isClickInsideContainer = this.filterContainer()?.nativeElement.contains(target);
    const isClickOnButton = this.filterBtn()?.nativeElement.contains(target);

    if (!isClickInsideContainer && !isClickOnButton) {
      this.showFilters.set(false);
    }
  }

  constructor() {
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
    });

    effect(() => {
      const target = this.scrollTarget()?.nativeElement;
      if (target) {
        this.setupIntersectionObserver(target);
      } else if (this.observer) {
        this.observer.disconnect();
      }
    });

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
        const validResults = results.filter((result): result is DatasetPokemon => result !== null);
        this.displayedPokemon.set(validResults);
        setTimeout(() => this.isPageLoading.set(false), 50);
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
      next: (list) => this.allSimplePokemon.set(list),
    });

    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      if (params['type']) this.selectedType.set(params['type']);
      if (params['color']) this.selectedColor.set(params['color']);
      if (params['generation']) this.selectedGeneration.set(params['generation']);
      if (params['region']) this.selectedRegion.set(params['region']);
      if (params['excludeForms'] === '1') this.excludeForms.set(true);
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver(targetElement: Element) {
    const options = { root: null, rootMargin: '400px', threshold: 0 };

    if (this.observer) this.observer.disconnect();

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
    this.selectedGames.update((games) =>
      games.includes(id) ? games.filter((g) => g !== id) : [...games, id],
    );
  }

  removeGame(id: string) {
    this.selectedGames.update((games) => games.filter((g) => g !== id));
  }

  clearSearch() {
    this.searchQuery.set('');
  }
}
