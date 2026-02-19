import {
  Component,
  input,
  output,
  signal,
  computed,
  OnInit,
  inject,
  HostListener,
  effect,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  getAvailableGamesForPokemon,
  getGameName,
  GameDefinition,
  GAME_CODES,
} from '../../../shared/models/game-definitions';
import { BoxSlot } from '../../../shared/models/dex.model';
import { Trainer } from '../../../shared/models/trainer.model';
import {
  DatasetService,
  DatasetPokemon,
  SimplePokemon,
} from '../../../core/api/services/dataset.service';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import {
  AbilityData,
  ItemData,
  PokeballData,
  NatureData,
  MarkData,
  RibbonData,
} from '../../../shared/models/dataset.model';
import {
  SearchableDropdownComponent,
  SearchableOption,
} from '../../../shared/components/searchable-dropdown/searchable-dropdown.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-pokemon-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableDropdownComponent],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        class="bg-surface border border-theme rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative animate-fade-in custom-scrollbar"
      >
        @if (pokemon(); as pkmn) {
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-8">
              <div class="flex items-center gap-6">
                <!-- Sprite -->
                <div class="relative group">
                  <div
                    class="w-32 h-32 bg-secondary rounded-full flex items-center justify-center border-2 border-theme shadow-inner"
                  >
                    @if (pokemon().pokemonSlug && currentSpriteUrl()) {
                      <img
                        [src]="currentSpriteUrl()"
                        [alt]="pokemonName('eng')"
                        class="w-28 h-28 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                        (error)="onImageError($event)"
                      />
                    }
                  </div>
                  @if (pokemon().pokemonSlug) {
                    <button
                      (click)="toggleShinyPreview()"
                      class="absolute bottom-0 right-0 p-1.5 bg-surface border border-theme rounded-full shadow hover:bg-surface-hover transition-colors"
                      title="Toggle Shiny Preview"
                    >
                      ✨
                    </button>
                  }
                </div>

                <!-- Names & Info -->
                <div class="flex-1">
                  <!-- Pokemon Selection Dropdown -->
                  <div class="mb-3">
                    <label class="block text-xs font-bold text-secondary uppercase mb-2"
                      >Pokemon</label
                    >
                    <app-searchable-dropdown
                      [options]="pokemonSearchOptions()"
                      [selectedId]="pokemon().pokemonSlug || ''"
                      [placeholder]="'Search Pokemon...'"
                      (valueChanged)="onPokemonChange($event)"
                    />
                  </div>

                  @if (pokemon().pokemonSlug) {
                    <div class="flex flex-col gap-1 text-sm text-secondary">
                      <span class="flex items-center gap-2">
                        🇬🇧 {{ pokemonName('eng') }} | 🇯🇵 {{ pokemonName('jap') }} | 🇫🇷
                        {{ pokemonName('fra') }}
                      </span>
                      <span class="italic">{{ pokemonGenus() }}</span>
                    </div>

                    <div class="flex gap-2 mt-3">
                      <a
                        [href]="'https://www.serebii.net/pokedex-sv/' + pokemonSlug()"
                        target="_blank"
                        class="px-2 py-0.5 bg-green-900/30 text-green-400 border border-green-800 rounded text-xs hover:bg-green-900/50"
                        >Serebii</a
                      >
                      <a
                        [href]="
                          'https://bulbapedia.bulbagarden.net/wiki/' +
                          pokemonName('eng').replace(' ', '_') +
                          '_(Pokémon)'
                        "
                        target="_blank"
                        class="px-2 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-800 rounded text-xs hover:bg-blue-900/50"
                        >Bulbapedia</a
                      >
                    </div>
                  } @else {
                    <!-- Empty slot - just show placeholder -->
                    <div class="text-lg text-tertiary italic">Empty Slot</div>
                  }
                </div>
              </div>

              <button
                (click)="close()"
                class="text-secondary hover:text-primary transition-colors p-2 text-2xl leading-none block"
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Left Column: Edit Form & Stats -->
              <div class="space-y-6">
                <!-- Main Edit Form -->
                <div class="space-y-4">
                  <!-- Checkboxes -->
                  <div
                    class="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-theme"
                  >
                    <label class="flex items-center gap-3 cursor-pointer group select-none">
                      <div class="relative flex items-center">
                        <input
                          type="checkbox"
                          [(ngModel)]="isOwned"
                          (change)="onCaughtChange()"
                          class="peer sr-only"
                        />
                        <div
                          class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all"
                        ></div>
                        <svg
                          class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path
                            d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"
                          />
                        </svg>
                      </div>
                      <span
                        class="font-medium text-primary group-hover:text-blue-400 transition-colors"
                        >Caught</span
                      >
                    </label>

                    <div class="w-px h-6 bg-theme"></div>

                    <label class="flex items-center gap-3 cursor-pointer group select-none">
                      <div class="relative flex items-center">
                        <input
                          type="checkbox"
                          [(ngModel)]="isShiny"
                          (change)="updateSpritePreview()"
                          class="peer sr-only"
                        />
                        <div
                          class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-yellow-500 peer-checked:border-yellow-500 transition-all"
                        ></div>
                        <svg
                          class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path
                            d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"
                          />
                        </svg>
                      </div>
                      <span
                        class="font-medium text-primary group-hover:text-yellow-400 transition-colors"
                        >Shiny</span
                      >
                    </label>

                    <div class="w-px h-6 bg-theme"></div>

                    <label class="flex items-center gap-3 cursor-pointer group select-none">
                      <div class="relative flex items-center">
                        <input type="checkbox" [(ngModel)]="isEvent" class="peer sr-only" />
                        <div
                          class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-purple-500 peer-checked:border-purple-500 transition-all"
                        ></div>
                        <svg
                          class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path
                            d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"
                          />
                        </svg>
                      </div>
                      <span
                        class="font-medium text-primary group-hover:text-purple-400 transition-colors"
                        >Event</span
                      >
                    </label>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div
                      class="bg-secondary/20 p-3 rounded-lg border border-theme hover:border-blue-500/50 transition-colors"
                    >
                      <label class="block text-xs font-bold text-secondary uppercase mb-1"
                        >Level</label
                      >
                      <input
                        type="number"
                        [(ngModel)]="level"
                        (ngModelChange)="updateChart()"
                        min="1"
                        max="100"
                        class="w-full bg-transparent text-primary font-mono text-lg focus:outline-none placeholder:text-tertiary"
                        placeholder="--"
                      />
                    </div>

                    <div
                      class="bg-secondary/20 p-3 rounded-lg border border-theme hover:border-blue-500/50 transition-colors"
                    >
                      <label class="block text-xs font-bold text-secondary uppercase mb-1"
                        >Language</label
                      >
                      <select
                        [(ngModel)]="originLanguage"
                        class="w-full bg-transparent text-primary font-medium focus:outline-none cursor-pointer appearance-none"
                      >
                        <option value="" class="bg-surface text-secondary">None</option>
                        <option value="ENG" class="bg-surface">ENG - English</option>
                        <option value="DEU" class="bg-surface">DEU - German</option>
                        <option value="JPN" class="bg-surface">JPN - Japanese</option>
                        <option value="FRA" class="bg-surface">FRA - French</option>
                        <option value="ITA" class="bg-surface">ITA - Italian</option>
                        <option value="ESP" class="bg-surface">ESP - Spanish</option>
                        <option value="KOR" class="bg-surface">KOR - Korean</option>
                        <option value="CHS" class="bg-surface">CHS - Chinese (Simp)</option>
                        <option value="CHT" class="bg-surface">CHT - Chinese (Trad)</option>
                      </select>
                    </div>
                  </div>
                  <!-- Mark & Ribbon -->
                  <div class="grid grid-cols-2 gap-4">
                    <div
                      class="bg-secondary/20 p-3 rounded-lg border border-theme hover:border-blue-500/50 transition-colors"
                    >
                      <label class="block text-xs font-bold text-secondary uppercase mb-2"
                        >Mark</label
                      >
                      <app-searchable-dropdown
                        [options]="markOptions()"
                        [selectedId]="mark"
                        [placeholder]="'Select Mark'"
                        (valueChanged)="mark = $event"
                      />
                    </div>

                    <div
                      class="bg-secondary/20 p-3 rounded-lg border border-theme hover:border-blue-500/50 transition-colors"
                    >
                      <label class="block text-xs font-bold text-secondary uppercase mb-2"
                        >Ribbon</label
                      >
                      <app-searchable-dropdown
                        [options]="ribbonOptions()"
                        [selectedId]="ribbon"
                        [placeholder]="'Select Ribbon'"
                        (valueChanged)="ribbon = $event"
                      />
                    </div>
                  </div>

                  <!-- Notes -->
                  <!-- Level & Origin Language -->
                </div>

                <div class="bg-secondary/30 p-4 rounded-xl border border-theme">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex gap-2">
                      <button
                        (click)="switchStatsView('base')"
                        [class]="
                          statsView() === 'base'
                            ? 'px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded'
                            : 'px-3 py-1 text-xs font-medium text-secondary hover:text-primary rounded'
                        "
                      >
                        Base Stats
                      </button>
                      <button
                        (click)="switchStatsView('current')"
                        [class]="
                          statsView() === 'current'
                            ? 'px-3 py-1 text-xs font-bold bg-green-600 text-white rounded'
                            : 'px-3 py-1 text-xs font-medium text-secondary hover:text-primary rounded'
                        "
                      >
                        Current Stats
                      </button>
                    </div>
                  </div>
                  <div class="h-56 w-full flex items-center justify-center relative">
                    <canvas #statsChart></canvas>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div
                  class="bg-secondary/20 p-3 rounded-lg border border-theme hover:border-blue-500/50 transition-colors"
                >
                  <label class="block text-xs font-bold text-secondary uppercase mb-1"
                    >Ability</label
                  >
                  <select
                    [(ngModel)]="ability"
                    class="w-full bg-transparent text-primary font-medium focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="" class="bg-surface text-secondary" hidden>
                      Select Ability
                    </option>
                    @for (ab of availableAbilities(); track ab.id) {
                      <option [value]="ab.name" class="bg-surface text-primary">
                        {{ ab.name }}
                        @if (ab.isHidden) {
                          (Hidden)
                        }
                      </option>
                    }
                  </select>
                  <p class="text-xs text-secondary mt-1 min-h-[1.25rem] truncate">
                    {{ getAbilityDescription() }}
                  </p>
                </div>

                <div
                  class="bg-secondary/20 p-3 rounded-lg border border-theme hover:border-blue-500/50 transition-colors"
                >
                  <label class="block text-xs font-bold text-secondary uppercase mb-1"
                    >Nature</label
                  >
                  <select
                    [(ngModel)]="nature"
                    (change)="updateChart()"
                    class="w-full bg-transparent text-primary font-medium focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="" class="bg-surface text-secondary" hidden>Select Nature</option>
                    @for (nat of allNatures(); track nat.id) {
                      <option [value]="nat.id" class="bg-surface text-primary">
                        {{ nat.name }}
                        @if (nat.raises && nat.lowers) {
                          (+{{ getNatureStatLabel(nat.raises) }} -{{
                            getNatureStatLabel(nat.lowers)
                          }})
                        }
                      </option>
                    }
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div
                    class="bg-secondary/20 p-3 rounded-lg border border-theme hover:border-blue-500/50 transition-colors group"
                  >
                    <label class="block text-xs font-bold text-secondary uppercase mb-1"
                      >Poké Ball</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="ball"
                      list="ballsList"
                      placeholder="Search..."
                      class="w-full bg-transparent text-primary font-medium focus:outline-none"
                    />
                    <datalist id="ballsList">
                      @for (ball of allPokeballs(); track ball.id) {
                        <option [value]="ball.name"></option>
                      }
                    </datalist>
                  </div>

                  <div
                    class="bg-secondary/20 p-3 rounded-lg border border-theme hover:border-blue-500/50 transition-colors"
                  >
                    <label class="block text-xs font-bold text-secondary uppercase mb-1"
                      >Held Item</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="item"
                      list="itemsList"
                      placeholder="Search..."
                      class="w-full bg-transparent text-primary font-medium focus:outline-none"
                    />
                    <datalist id="itemsList">
                      @for (itm of allItems(); track itm.id) {
                        <option [value]="itm.name"></option>
                      }
                    </datalist>
                  </div>
                </div>

                <div class="bg-secondary/10 border border-theme rounded-xl p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-bold text-primary">Trainer Info</h4>
                    <select
                      (change)="onTrainerSelect($event)"
                      class="text-xs bg-surface border border-theme rounded px-2 py-1 text-secondary focus:text-primary focus:border-blue-500 outline-none max-w-[150px]"
                    >
                      <option value="">Auto-fill...</option>
                      @for (tr of trainers(); track tr.id) {
                        <option [value]="tr.id">{{ tr.name }} ({{ tr.game }})</option>
                      }
                    </select>
                  </div>

                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <input
                        [(ngModel)]="originalTrainer"
                        placeholder="OT Name"
                        class="w-full bg-surface border border-theme rounded px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        [(ngModel)]="trainerId"
                        placeholder="ID No."
                        class="w-full bg-surface border border-theme rounded px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div class="relative">
                    <select
                      [(ngModel)]="originGame"
                      class="w-full bg-surface border border-theme rounded px-3 py-2 text-sm text-primary appearance-none focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="" class="text-secondary">Select Origin Game</option>
                      @for (genGroup of availableGamesByGen(); track genGroup.gen) {
                        <optgroup [label]="genGroup.label">
                          @for (game of genGroup.games; track game.code) {
                            <option [value]="game.code">
                              {{ game.fullName }}
                              @if (!isObtainableIn(game.code)) {
                                (via Trade/Breeding)
                              }
                            </option>
                          }
                        </optgroup>
                      }
                    </select>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
                    >
                      ▼
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    [(ngModel)]="notes"
                    rows="2"
                    class="w-full bg-surface border border-theme rounded-xl px-4 py-3 text-sm text-primary placeholder:text-tertiary focus:border-blue-500 outline-none resize-none"
                    placeholder="Add specific notes about this Pokémon..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center mt-8 pt-4 border-t border-theme">
              <div class="text-xs text-secondary">Last updated: {{ 'Just now' }}</div>
              <div class="flex gap-3">
                <button
                  (click)="close()"
                  class="px-5 py-2 rounded-lg font-medium text-secondary hover:bg-secondary/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  (click)="save()"
                  [disabled]="saving()"
                  class="px-6 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {{ saving() ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: var(--color-border);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: var(--color-text-secondary);
      }
    `,
  ],
})
export class PokemonDetailDialogComponent implements OnInit, AfterViewInit {
  pokemon = input.required<BoxSlot>();
  dexId = input.required<string>();
  boxNumber = input.required<number>();

  closed = output<void>();
  saved = output<void>();

  @ViewChild('statsChart') statsChartRef!: ElementRef<HTMLCanvasElement>;
  chartInstance: Chart | null = null;

  private datasetService = inject(DatasetService);
  private firestoreService = inject(FirestoreService);

  pokemonData = signal<DatasetPokemon | null>(null);
  trainers = signal<Trainer[]>([]);
  allAbilities = signal<AbilityData[]>([]);
  allPokeballs = signal<PokeballData[]>([]);
  allItems = signal<ItemData[]>([]);
  allNatures = signal<NatureData[]>([]);
  allMarks = signal<MarkData[]>([]);
  allRibbons = signal<RibbonData[]>([]);
  allPokemon = signal<SimplePokemon[]>([]);

  // Computed options for searchable dropdowns
  ribbonOptions = computed<SearchableOption[]>(() => {
    return this.allRibbons()
      .map((ribbon) => ({
        id: ribbon.id,
        name: ribbon.name,
        description: ribbon.shortDesc,
        category: `Gen ${ribbon.gen}`,
      }))
      .sort((a, b) => {
        // Sort by category (Gen) desc, then by name
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA; // Newest gen first
        return a.name.localeCompare(b.name);
      });
  });

  // Also sort markOptions by gen desc
  markOptions = computed<SearchableOption[]>(() => {
    return this.allMarks()
      .map((mark) => ({
        id: mark.id,
        name: mark.name,
        description: mark.shortDesc,
        category: `Gen ${mark.gen}`,
      }))
      .sort((a, b) => {
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA;
        return a.name.localeCompare(b.name);
      });
  });

  pokemonSearchOptions = computed<SearchableOption[]>(() => {
    return this.allPokemon().map((p) => ({
      id: p.slug,
      name: p.name,
      description: p.nameGerman && p.nameGerman !== p.name ? p.nameGerman : '',
      category: `#${p.dexNum.toString().padStart(4, '0')}`,
      searchTerms: p.allNames ? Object.values(p.allNames).filter((n) => n) : [],
    }));
  });

  pokemonName = (lang: string) => this.pokemonData()?.names[lang] || '';
  pokemonGenus = () => this.pokemonData()?.genus['eng'] || 'Pokémon'; // Fallback
  pokemonNid = () => this.pokemonData()?.nid || '???';
  pokemonSlug = () => this.pokemonData()?.id || '';

  availableAbilities = () => {
    const p = this.pokemonData();
    if (!p) return [];

    const abs = [];
    if (p.ability1)
      abs.push({ name: this.findAbilityName(p.ability1), id: p.ability1, isHidden: false });
    if (p.ability2)
      abs.push({ name: this.findAbilityName(p.ability2), id: p.ability2, isHidden: false });
    if (p.abilityHidden)
      abs.push({
        name: this.findAbilityName(p.abilityHidden),
        id: p.abilityHidden,
        isHidden: true,
      });

    return abs;
  };

  isOwned = false;
  isEvent = false;
  isShiny = false;
  level?: number;
  ball = '';
  item = '';
  originGame = '';
  originLanguage = '';
  originalTrainer = '';
  trainerId = '';
  customName = '';
  notes = '';
  ability = '';
  nature = '';
  mark = '';
  ribbon = '';

  saving = signal(false);
  currentSpriteUrl = signal('');
  statsView = signal<'base' | 'current'>('base');

  // Get available games based on Pokemon's storableIn data
  availableGames = () => {
    const pokemon = this.pokemonData();
    if (!pokemon || !pokemon.storableIn) return [];
    return getAvailableGamesForPokemon(pokemon.storableIn);
  };

  // Group available games by generation for optgroup display
  availableGamesByGen = () => {
    const games = this.availableGames();
    const grouped = new Map<number, GameDefinition[]>();

    games.forEach((game) => {
      if (!grouped.has(game.gen)) {
        grouped.set(game.gen, []);
      }
      grouped.get(game.gen)!.push(game);
    });

    // Convert to array and sort by generation (descending)
    return Array.from(grouped.entries())
      .sort((a, b) => {
        // Special games (GO, HOME) with gen 0 go last
        if (a[0] === 0) return 1;
        if (b[0] === 0) return -1;
        return b[0] - a[0];
      })
      .map(([gen, games]) => ({
        gen,
        label: gen === 0 ? 'Special' : `Generation ${gen}`,
        games,
      }));
  };

  // Check if Pokemon is obtainable in a specific game (not via trade/breeding)
  isObtainableIn(gameCode: string): boolean {
    const pokemon = this.pokemonData();
    return pokemon?.obtainableIn?.includes(gameCode) || false;
  }

  ngOnInit() {
    const pkmn = this.pokemon();
    this.isOwned = pkmn.isOwned;
    this.isEvent = pkmn.isEvent || false;
    this.isShiny = pkmn.isShiny;
    this.customName = pkmn.customName || '';
    this.notes = pkmn.notes || '';
    this.level = pkmn.level;
    this.ball = pkmn.ball || '';
    this.originGame = pkmn.originGame || '';
    this.originLanguage = pkmn.originLanguage || '';
    this.originalTrainer = pkmn.originalTrainer || '';
    this.trainerId = pkmn.trainerId || '';
    this.item = pkmn.item || '';
    this.ability = pkmn.ability || '';
    this.nature = pkmn.nature || '';
    this.mark = pkmn.mark || '';
    this.ribbon = pkmn.ribbon || '';

    this.loadData();
  }

  ngAfterViewInit() {}

  loadData() {
    this.firestoreService.getUserTrainers().subscribe((t) => this.trainers.set(t));
    this.datasetService.loadAbilities().subscribe((a) => this.allAbilities.set(a));
    this.datasetService.loadPokeballs().subscribe((p) => this.allPokeballs.set(p));
    this.datasetService.loadItems().subscribe((i) => this.allItems.set(i));
    this.datasetService.loadNatures().subscribe((n) => this.allNatures.set(n));
    this.datasetService.loadMarks().subscribe((m) => this.allMarks.set(m));
    this.datasetService.loadRibbons().subscribe((r) => this.allRibbons.set(r));

    // Load Pokemon list for search dropdown
    this.datasetService.getSimplePokemonList().subscribe((pokemonList) => {
      this.allPokemon.set(pokemonList);
    });

    if (this.pokemon().pokemonSlug) {
      this.datasetService.loadPokemonBySlug(this.pokemon().pokemonSlug!).subscribe((data) => {
        this.pokemonData.set(data);
        this.updateSpritePreview();
        setTimeout(() => this.initChart(), 100);
      });
    }
  }

  updateSpritePreview() {
    const data = this.pokemonData();
    if (!data) return;
    this.currentSpriteUrl.set(this.datasetService.getSpriteUrl(data, this.isShiny));
  }

  toggleShinyPreview() {
    this.isShiny = !this.isShiny;
    this.updateSpritePreview();
  }

  onCaughtChange() {
    // Auto-fill when marking Pokemon as caught (isOwned = true)
    if (this.isOwned) {
      // Set level to 5 if not already set
      if (!this.level) {
        this.level = 5;
      }

      // Set language to current browser/app language if not already set
      if (!this.originLanguage) {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('de')) {
          this.originLanguage = 'DEU';
        } else if (browserLang.startsWith('ja')) {
          this.originLanguage = 'JPN';
        } else if (browserLang.startsWith('fr')) {
          this.originLanguage = 'FRA';
        } else if (browserLang.startsWith('es')) {
          this.originLanguage = 'ESP';
        } else if (browserLang.startsWith('it')) {
          this.originLanguage = 'ITA';
        } else {
          this.originLanguage = 'ENG'; // Default to English
        }
      }

      // Set ability to first ability in array if not already set
      if (!this.ability && this.pokemonData()) {
        const pokemon = this.pokemonData();
        if (pokemon?.ability1) {
          // Use ability1 as the default ability
          this.ability = this.findAbilityName(pokemon.ability1);
        }
      }
    }
  }

  findAbilityName(slug: string): string {
    const match = this.allAbilities().find((a) => a.id === slug);
    return match ? match.name : slug;
  }

  getAbilityDescription(): string {
    if (!this.ability) return '';
    const match = this.allAbilities().find((a) => a.name === this.ability);
    return match ? match.shortDesc : '';
  }

  getNatureStatLabel(stat: string): string {
    const labels: Record<string, string> = {
      atk: 'Atk',
      def: 'Def',
      spa: 'SpA',
      spd: 'SpD',
      spe: 'Spe',
    };
    return labels[stat] || stat;
  }

  onTrainerSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const tId = select.value;
    const trainer = this.trainers().find((t) => t.id === tId);
    if (trainer) {
      this.originalTrainer = trainer.name;
      this.trainerId = trainer.trainerId;
      if (trainer.game) this.originGame = trainer.game;
    }
  }

  updateChart() {
    setTimeout(() => this.initChart(), 50);
  }

  switchStatsView(view: 'base' | 'current') {
    this.statsView.set(view);
    this.updateChart();
  }

  initChart() {
    if (!this.statsChartRef || !this.pokemonData()) return;

    const ctx = this.statsChartRef.nativeElement;
    const stats = this.pokemonData()!;
    const viewMode = this.statsView();

    if (this.chartInstance) this.chartInstance.destroy();

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#cbd5e1' : '#4b5563';

    let statValues: number[];
    let chartColor: string;

    if (viewMode === 'current') {
      // Calculate current stats based on level, IVs (assumed 31), EVs (assumed 0), nature
      const currentLevel = this.level || 50; // Default to 50 if no level set
      const nature = this.allNatures().find((n) => n.id === this.nature);

      statValues = [
        this.calculateHP(stats.baseHp, currentLevel),
        this.calculateStat(
          stats.baseAtk,
          currentLevel,
          nature?.raises === 'atk',
          nature?.lowers === 'atk',
        ),
        this.calculateStat(
          stats.baseDef,
          currentLevel,
          nature?.raises === 'def',
          nature?.lowers === 'def',
        ),
        this.calculateStat(
          stats.baseSpeed,
          currentLevel,
          nature?.raises === 'spe',
          nature?.lowers === 'spe',
        ),
        this.calculateStat(
          stats.baseSpDef,
          currentLevel,
          nature?.raises === 'spd',
          nature?.lowers === 'spd',
        ),
        this.calculateStat(
          stats.baseSpAtk,
          currentLevel,
          nature?.raises === 'spa',
          nature?.lowers === 'spa',
        ),
      ];
      chartColor = 'rgba(34, 197, 94, 0.8)'; // Green for current stats
    } else {
      // Base stats
      statValues = [
        stats.baseHp,
        stats.baseAtk,
        stats.baseDef,
        stats.baseSpeed,
        stats.baseSpDef,
        stats.baseSpAtk,
      ];
      chartColor = 'rgba(59, 130, 246, 0.8)'; // Blue for base stats
    }

    this.chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          `HP (${statValues[0]})`,
          `Atk (${statValues[1]})`,
          `Def (${statValues[2]})`,
          `Spe (${statValues[3]})`,
          `SpD (${statValues[4]})`,
          `SpA (${statValues[5]})`,
        ],
        datasets: [
          {
            label: viewMode === 'current' ? 'Current Stats' : 'Base Stats',
            data: statValues,
            backgroundColor: chartColor.replace('0.8', '0.2'),
            borderColor: chartColor,
            borderWidth: 2,
            pointBackgroundColor: chartColor,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: viewMode === 'current' ? Math.max(400, ...statValues) : 200,
            grid: { color: gridColor },
            pointLabels: {
              color: textColor,
              font: { size: 11, weight: 'bold' },
              padding: 8,
            },
            ticks: { display: false, count: 5 },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => `${context.label.split(' ')[0]}: ${context.parsed.r}`,
            },
          },
        },
        maintainAspectRatio: false,
      },
    });
  }

  calculateHP(base: number, level: number, iv: number = 31, ev: number = 0): number {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }

  calculateStat(
    base: number,
    level: number,
    isRaised: boolean,
    isLowered: boolean,
    iv: number = 31,
    ev: number = 0,
  ): number {
    let stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    if (isRaised) stat = Math.floor(stat * 1.1);
    if (isLowered) stat = Math.floor(stat * 0.9);
    return stat;
  }

  async save() {
    this.saving.set(true);
    try {
      const updates: any = {
        isOwned: this.isOwned,
        isEvent: this.isEvent,
        isShiny: this.isShiny,
        level: this.level || null,
        ball: this.ball || null,
        item: this.item || null,
        originGame: this.originGame || null,
        originLanguage: this.originLanguage || null,
        originalTrainer: this.originalTrainer || null,
        trainerId: this.trainerId || null,
        customName: this.customName || null,
        notes: this.notes || null,
        ability: this.ability || null,
        nature: this.nature || null,
        mark: this.mark || null,
        ribbon: this.ribbon || null,
      };

      // Cleanup undefined
      Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

      await this.firestoreService.updateSlot(
        this.dexId(),
        this.boxNumber(),
        this.pokemon().position,
        updates,
      );

      this.saved.emit();
      this.close();
    } catch (e) {
      console.error('Error saving Pokemon data', e);
    } finally {
      this.saving.set(false);
    }
  }

  onPokemonChange(newPokemonSlug: string | null) {
    if (!newPokemonSlug) {
      // User cleared selection - reset to empty slot
      this.pokemonData.set(null);
      this.currentSpriteUrl.set('');
      return;
    }

    // Load new Pokemon data
    this.datasetService.loadPokemonBySlug(newPokemonSlug).subscribe((data) => {
      this.pokemonData.set(data);
      // Update the slot's pokemonSlug (will be saved when user clicks Save)
      const currentPokemon = this.pokemon();
      currentPokemon.pokemonSlug = newPokemonSlug;
      this.updateSpritePreview();
      setTimeout(() => this.initChart(), 100);
    });
  }

  onImageError(event: Event) {
    // Hide broken image icon by clearing display
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
