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
import { AVAILABLE_SPRITES } from '../../../core/constants/available-sprites';
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
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../shared/components/custom-dropdown/custom-dropdown.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-pokemon-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        class="bg-surface border border-theme rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        @if (pokemon(); as pkmn) {
          <div class="p-6 pb-4 relative flex-none border-b border-theme bg-surface z-20">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-6">
                <div class="flex flex-col items-center">
                  <div class="relative group">
                    <div
                      class="w-32 h-32 bg-secondary rounded-full flex items-center justify-center border-2 border-theme shadow-inner"
                    >
                      @if (localPokemonSlug() && currentSpriteUrl()) {
                        <img
                          [src]="currentSpriteUrl()"
                          [alt]="pokemonName('eng')"
                          class="w-28 h-28 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                          (error)="onImageError($event)"
                        />
                      }
                    </div>
                    @if (ball) {
                      <div
                        class="absolute bottom-0 left-0 w-7 h-7 bg-surface border border-theme rounded-full shadow flex items-center justify-center"
                      >
                        <img
                          [src]="'assets/images/pokeballs/' + ball + '.png'"
                          [alt]="ball"
                          class="w-5 h-5 object-contain"
                          style="image-rendering: pixelated"
                          (error)="onImageError($event)"
                        />
                      </div>
                    }
                    @if (localPokemonSlug()) {
                      <button
                        (click)="toggleShinyPreview()"
                        class="absolute bottom-0 right-0 p-1 bg-surface border border-theme rounded-full shadow hover:bg-surface-hover transition-colors flex items-center justify-center w-7 h-7"
                        title="Toggle Shiny Preview"
                      >
                        <img
                          src="assets/images/special_attributes/shiny-stars.png"
                          alt="Shiny"
                          class="w-5 h-5 object-contain"
                        />
                      </button>
                    }
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    @if (pokemonData()?.type1) {
                      <img
                        [src]="'assets/images/types/' + pokemonData()!.type1 + '.png'"
                        [alt]="pokemonData()!.type1"
                        class="h-5 object-contain"
                        (error)="onImageError($event)"
                      />
                    }
                    @if (pokemonData()?.type2) {
                      <img
                        [src]="'assets/images/types/' + pokemonData()!.type2 + '.png'"
                        [alt]="pokemonData()!.type2"
                        class="h-5 object-contain"
                        (error)="onImageError($event)"
                      />
                    }
                  </div>
                </div>

                <div class="flex-1">
                  <div class="mb-3">
                    <label class="block text-xs font-bold text-secondary uppercase mb-2"
                      >Pokemon</label
                    >
                    <app-custom-dropdown
                      [options]="pokemonSearchOptions()"
                      [selectedId]="localPokemonSlug() || ''"
                      [placeholder]="'Search Pokemon...'"
                      (valueChanged)="onPokemonChange($event)"
                    />
                  </div>

                  @if (localPokemonSlug()) {
                    <div class="flex flex-col gap-1 text-sm text-secondary">
                      <span class="flex items-center gap-2">
                        🇬🇧 {{ pokemonName('eng') }} | 🇯🇵 {{ pokemonName('jap') }}
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
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="flex flex-col gap-[18px]">
                <div class="flex flex-col gap-[18px]">
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

                    <div class="w-px h-6 bg-theme"></div>

                    <label
                      class="flex items-center gap-3 cursor-pointer group select-none relative"
                      [class.opacity-50]="!pokemonData()?.canGmax && !pokemonData()?.isGmax"
                    >
                      <div class="relative flex items-center">
                        <input
                          type="checkbox"
                          [(ngModel)]="isGmax"
                          [disabled]="!pokemonData()?.canGmax && !pokemonData()?.isGmax"
                          class="peer sr-only"
                        />
                        <div
                          class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-red-600 peer-checked:border-red-600 transition-all peer-disabled:bg-surface-hover peer-disabled:border-theme"
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
                        class="font-medium text-primary transition-colors"
                        [ngClass]="
                          pokemonData()?.canGmax || pokemonData()?.isGmax
                            ? 'group-hover:text-red-400'
                            : ''
                        "
                        >Gigantamax</span
                      >
                    </label>

                    <div class="w-px h-6 bg-theme"></div>

                    <label
                      class="flex items-center gap-3 cursor-pointer group select-none relative"
                      [class.opacity-50]="!pokemonData()?.canBeAlpha"
                    >
                      <div class="relative flex items-center">
                        <input
                          type="checkbox"
                          [(ngModel)]="isAlpha"
                          [disabled]="!pokemonData()?.canBeAlpha"
                          class="peer sr-only"
                        />
                        <div
                          class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-orange-600 peer-checked:border-orange-600 transition-all peer-disabled:bg-surface-hover peer-disabled:border-theme"
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
                        class="font-medium text-primary transition-colors"
                        [ngClass]="pokemonData()?.canBeAlpha ? 'group-hover:text-orange-400' : ''"
                        >Alpha</span
                      >
                    </label>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="relative group">
                      <input
                        type="number"
                        [(ngModel)]="level"
                        (ngModelChange)="onLevelChange($event)"
                        min="1"
                        max="100"
                        class="w-full h-[50px] bg-surface border-2 border-theme rounded-lg px-3 py-3 text-primary font-mono text-lg focus:border-blue-500 outline-none transition-colors peer placeholder-transparent no-spinners"
                        placeholder="Level"
                      />
                      <label
                        class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
                      >
                        Level
                      </label>
                    </div>

                    <div class="relative group">
                      <app-custom-dropdown
                        [label]="'Language'"
                        [options]="languageOptions()"
                        [selectedId]="originLanguage"
                        [placeholder]="'Select Language'"
                        [searchable]="false"
                        (valueChanged)="originLanguage = $event"
                      />
                    </div>
                  </div>

                  <div class="flex flex-col gap-[18px]">
                    <app-custom-dropdown
                      [options]="pokeballOptions()"
                      [selectedId]="ball"
                      [label]="'Poké Ball'"
                      [placeholder]="'Select Poké Ball'"
                      (valueChanged)="ball = $event"
                    />

                    <app-custom-dropdown
                      [options]="itemOptions()"
                      [selectedId]="item"
                      [label]="'Held Item'"
                      [placeholder]="'Select Held Item'"
                      (valueChanged)="item = $event"
                    />
                  </div>
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

              <div class="flex flex-col gap-[18px]">
                <div class="grid grid-cols-2 gap-4">
                  <div class="relative group">
                    <app-custom-dropdown
                      [label]="'Ability'"
                      [options]="abilityOptions()"
                      [selectedId]="ability"
                      [placeholder]="'Select Ability'"
                      [searchable]="false"
                      (valueChanged)="ability = $event"
                    />
                    <p class="text-xs text-secondary mt-1 min-h-[1.25rem] truncate">
                      {{ getAbilityDescription() }}
                    </p>
                  </div>

                  <div class="relative group">
                    <app-custom-dropdown
                      [label]="'Nature'"
                      [options]="natureOptions()"
                      [selectedId]="nature"
                      [placeholder]="'Select Nature'"
                      (valueChanged)="onNatureChange($event)"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-[18px]">
                  <app-custom-dropdown
                    [options]="ribbonOptions()"
                    [selectedId]="ribbon"
                    [label]="'Ribbon'"
                    [placeholder]="'Select Ribbon'"
                    (valueChanged)="ribbon = $event"
                  />

                  <app-custom-dropdown
                    [options]="markOptions()"
                    [selectedId]="mark"
                    [label]="'Mark'"
                    [placeholder]="'Select Mark'"
                    (valueChanged)="mark = $event"
                  />
                </div>

                <div class="bg-secondary/10 border border-theme rounded-xl p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-bold text-primary">Original Trainer</h4>
                    <div class="w-40">
                      <app-custom-dropdown
                        [options]="trainerOptions()"
                        [selectedId]="''"
                        [label]="''"
                        [placeholder]="'Auto-fill...'"
                        [searchable]="false"
                        (valueChanged)="onTrainerSelect($event)"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div class="relative group">
                      <input
                        [(ngModel)]="originalTrainer"
                        placeholder="OT Name"
                        class="w-full bg-surface border-2 border-theme rounded-lg px-3 py-3 text-sm text-primary placeholder-transparent focus:border-blue-500 outline-none transition-colors peer"
                      />
                      <label
                        class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
                      >
                        OT Name
                      </label>
                    </div>
                    <div class="relative group">
                      <input
                        [(ngModel)]="trainerId"
                        placeholder="ID No."
                        class="w-full bg-surface border-2 border-theme rounded-lg px-3 py-3 text-sm text-primary placeholder-transparent focus:border-blue-500 outline-none transition-colors peer"
                      />
                      <label
                        class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
                      >
                        ID No.
                      </label>
                    </div>
                  </div>

                  <app-custom-dropdown
                    [label]="'Origin Game'"
                    [options]="originGameOptions()"
                    [selectedId]="originGame"
                    [placeholder]="'Select Origin Game'"
                    (valueChanged)="onOriginGameChange($event)"
                  />
                </div>

                <div class="relative group">
                  <textarea
                    [(ngModel)]="notes"
                    rows="2"
                    class="w-full bg-surface border-2 border-theme rounded-lg px-4 py-3 text-sm text-primary placeholder-transparent focus:border-blue-500 outline-none resize-none transition-colors peer"
                    placeholder="Notes"
                  ></textarea>
                  <label
                    class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
                  >
                    Notes
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer (Static) -->
          <div class="p-6 pt-4 border-t border-theme flex-none bg-surface z-10">
            <div class="flex justify-between items-center">
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

      /* Hide arrows/spinners for number inputs */
      .no-spinners::-webkit-outer-spin-button,
      .no-spinners::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .no-spinners {
        -moz-appearance: textfield;
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

  localPokemonSlug = signal<string | null>(null);

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

  ribbonOptions = computed<CustomDropdownOption[]>(() => {
    return this.allRibbons()
      .map((ribbon) => ({
        id: ribbon.id,
        name: ribbon.name,
        description: ribbon.shortDesc,
        category: `Gen ${ribbon.gen}`,
        iconPath: AVAILABLE_SPRITES.ribbons.has(ribbon.id)
          ? `assets/images/ribbons/${ribbon.id}.png`
          : undefined,
      }))
      .sort((a, b) => {
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA;
        return a.name.localeCompare(b.name);
      });
  });

  markOptions = computed<CustomDropdownOption[]>(() => {
    return this.allMarks()
      .map((mark) => ({
        id: mark.id,
        name: mark.name,
        description: mark.shortDesc,
        category: `Gen ${mark.gen}`,
        iconPath: AVAILABLE_SPRITES.marks.has(mark.id)
          ? `assets/images/marks/${mark.id}.png`
          : undefined,
      }))
      .sort((a, b) => {
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA;
        return a.name.localeCompare(b.name);
      });
  });

  pokemonSearchOptions = computed<CustomDropdownOption[]>(() => {
    return this.allPokemon().map((p) => ({
      id: p.slug,
      name: p.name,
      description: p.nameGerman && p.nameGerman !== p.name ? p.nameGerman : '',
      searchTerms: p.allNames ? Object.values(p.allNames).filter((n) => n) : [],
    }));
  });

  abilityOptions = computed<CustomDropdownOption[]>(() => {
    return this.availableAbilities().map((abil) => ({
      id: abil.id,
      name: abil.name,
      description: abil.isHidden ? 'Hidden Ability' : 'Standard Ability',
    }));
  });

  natureOptions = computed<CustomDropdownOption[]>(() => {
    return this.allNatures().map((nat) => {
      let desc = '';
      let descHtml = '';
      if (nat.raises && nat.lowers) {
        desc = `(+${this.getNatureStatLabel(nat.raises)} -${this.getNatureStatLabel(nat.lowers)})`;
        descHtml = `(<span class="text-[#e46787] font-bold">+${this.getNatureStatLabel(nat.raises)}</span> <span class="text-[#3babdf] font-bold">-${this.getNatureStatLabel(nat.lowers)}</span>)`;
      }
      return {
        id: nat.id,
        name: nat.name,
        description: desc,
        descriptionHtml: descHtml,
      };
    });
  });

  languageOptions = computed<CustomDropdownOption[]>(() => {
    return [
      { id: '', name: 'None' },
      { id: 'ENG', name: 'ENG', description: 'English' },
      { id: 'DEU', name: 'DEU', description: 'German' },
      { id: 'JPN', name: 'JPN', description: 'Japanese' },
      { id: 'FRA', name: 'FRA', description: 'French' },
      { id: 'ITA', name: 'ITA', description: 'Italian' },
      { id: 'ESP', name: 'ESP', description: 'Spanish' },
      { id: 'KOR', name: 'KOR', description: 'Korean' },
      { id: 'CHS', name: 'CHS', description: 'Chinese (Simp)' },
      { id: 'CHT', name: 'CHT', description: 'Chinese (Trad)' },
    ];
  });

  trainerOptions = computed<CustomDropdownOption[]>(() => {
    return this.trainers().map((tr) => ({
      id: tr.id,
      name: tr.name,
      description: `(${tr.game})${!this.isTrainerCompatible(tr) ? ' — incompatible' : ''}`,
      category: !this.isTrainerCompatible(tr) ? 'Incompatible' : 'Compatible',
    }));
  });

  pokeballOptions = computed<CustomDropdownOption[]>(() => {
    const categoryLabels: Record<string, string> = {
      regular: 'Regular',
      special: 'Special',
      hisuian: 'Hisuian',
      other: 'Other',
    };
    return this.allPokeballs().map((ball) => ({
      id: ball.id,
      name: ball.name,
      description: ball.shortDesc,
      category: categoryLabels[ball.category] ?? ball.category,
      iconPath: AVAILABLE_SPRITES.pokeballs.has(ball.id)
        ? `assets/images/pokeballs/${ball.id}.png`
        : undefined,
    }));
  });

  itemOptions = computed<CustomDropdownOption[]>(() => {
    const categoryLabels: Record<string, string> = {
      ball: 'Poké Ball',
      berry: 'Berry',
      other: 'Item',
    };
    return this.allItems().map((item) => ({
      id: item.id,
      name: item.name,
      description: item.shortDesc,
      category: categoryLabels[item.category] ?? item.category,
      iconPath: AVAILABLE_SPRITES.items.has(item.id)
        ? `assets/images/items/${item.id}.png`
        : undefined,
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
  isGmax = false;
  isAlpha = false;
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
  availableGames = () => {
    const pokemon = this.pokemonData();
    if (!pokemon) return [];

    // Always include games where it can be naturally caught or received via event
    const validGames = new Set<string>([
      ...(pokemon.obtainableIn || []),
      ...(pokemon.eventOnlyIn || []),
    ]);

    // If it can breed, it can also be hatched in any game it can be transferred to.
    const cannotBreed =
      pokemon.isLegendary || pokemon.isMythical || pokemon.isUltraBeast || pokemon.isParadox;

    if (!cannotBreed && pokemon.storableIn) {
      pokemon.storableIn.forEach((game) => validGames.add(game));
    }

    return getAvailableGamesForPokemon(Array.from(validGames));
  };
  availableGamesByGen = () => {
    const games = this.availableGames();
    const grouped = new Map<number, GameDefinition[]>();

    games.forEach((game) => {
      if (!grouped.has(game.gen)) {
        grouped.set(game.gen, []);
      }
      grouped.get(game.gen)!.push(game);
    });
    return Array.from(grouped.entries())
      .sort((a, b) => {
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

  originGameOptions = computed<CustomDropdownOption[]>(() => {
    const GAME_ICON_MAP: Record<string, string> = {
      'rby-r': 'red.png',
      'rby-b': 'blue.png',
      'rby-y': 'yellow.png',
      'gsc-g': 'gold.png',
      'gsc-s': 'silver.png',
      'gsc-c': 'crystal.png',
      'rse-r': 'ruby.png',
      'rse-s': 'sapphire.png',
      'rse-e': 'emerald.png',
      'frlg-fr': 'fireredwebp.png',
      'frlg-lg': 'leafgreen.png',
      'dp-d': 'diamond.png',
      'dp-p': 'pearl.png',
      pt: 'platin.png',
      'hgss-hg': 'heartgold.png',
      'hgss-ss': 'soulsilver.png',
      'xy-x': 'x.png',
      'xy-y': 'y.png',
      'oras-or': 'omega_ruby.png',
      'oras-as': 'alpha_sapphire.png',
      'sm-s': 'sun.png',
      'sm-m': 'moon.png',
      'usum-us': 'ultra_sun.png',
      'usum-um': 'ultra_moon.png',
      'lgpe-lgp': "let's_go_pikachu.png",
      'lgpe-lge': "let's_go_eevee.png",
      'swsh-sw': 'sword.png',
      'swsh-sh': 'shield.png',
      'bdsp-bd': 'brilliant_diamond.png',
      'bdsp-sp': 'shining_pearl.png',
      la: 'legends_arceus.png',
      'sv-s': 'scarlet.png',
      'sv-v': 'violet.png',
      lza: 'legends_z-a.png',
      go: 'go.png',
      home: 'home.png',
      bank: 'bank.png',
    };

    const options: CustomDropdownOption[] = [];
    options.push({
      id: '',
      name: 'None',
      description: 'No Origin Game selected',
      category: 'Options',
    });

    this.availableGamesByGen().forEach((group) => {
      group.games.forEach((game) => {
        const iconFilename = GAME_ICON_MAP[game.code];
        options.push({
          id: game.code,
          name: game.fullName,
          category: group.label,
          iconPath: iconFilename ? `assets/images/games/${iconFilename}` : undefined,
        });
      });
    });

    return options;
  });

  onOriginGameChange(gameCode: string) {
    this.originGame = gameCode;
  }

  isObtainableIn(gameCode: string): boolean {
    const pokemon = this.pokemonData();
    return pokemon?.obtainableIn?.includes(gameCode) || false;
  }

  ngOnInit() {
    const pkmn = this.pokemon();
    this.localPokemonSlug.set(pkmn.pokemonSlug);
    this.isOwned = pkmn.isOwned;
    this.isEvent = pkmn.isEvent || false;
    this.isShiny = pkmn.isShiny;
    this.isGmax = pkmn.isGmax || false;
    this.isAlpha = pkmn.isAlpha || false;
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
    this.datasetService.getSimplePokemonList().subscribe((pokemonList) => {
      this.allPokemon.set(pokemonList);
    });

    if (this.localPokemonSlug()) {
      this.datasetService.loadPokemonBySlug(this.localPokemonSlug()!).subscribe((data) => {
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
    if (this.isOwned) {
      if (!this.level) {
        this.level = 5;
      }
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
      if (!this.ability && this.pokemonData()) {
        const pokemon = this.pokemonData();
        if (pokemon?.ability1) {
          this.ability = this.findAbilityName(pokemon.ability1);
        }
        if (pokemon?.isGmax) {
          this.isGmax = true;
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
  isTrainerCompatible(trainer: Trainer): boolean {
    if (!trainer.game) return true; // No game set → always compatible
    return this.availableGames().some((g) => g.code === trainer.game);
  }

  onTrainerSelect(trainerId: string) {
    if (!trainerId) return;
    const trainer = this.trainers().find((t) => t.id === trainerId);
    if (trainer) {
      if (!this.isTrainerCompatible(trainer)) return;

      this.originalTrainer = trainer.name;
      this.trainerId = trainer.trainerId;
      if (trainer.game && this.isObtainableIn(trainer.game)) {
        this.originGame = trainer.game;
      }
    }
  }

  updateChart() {
    setTimeout(() => this.initChart(), 50);
  }

  onLevelChange(newLevel: number | null) {
    if (newLevel !== null && newLevel !== undefined) {
      if (newLevel < 1) this.level = 1;
      else if (newLevel > 100) this.level = 100;
      else this.level = newLevel;
    } else {
      this.level = undefined;
    }
    this.updateChart();
  }

  onNatureChange(natureId: string) {
    this.nature = natureId;
    this.updateChart();
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

    const getStatColor = (stat: string) => {
      if (!this.nature) return textColor;
      const nature = this.allNatures().find((n) => n.id === this.nature);
      if (!nature) return textColor;
      if (nature.raises === stat) return '#e46787'; // Red for increased stat
      if (nature.lowers === stat) return '#3babdf'; // Blue for decreased stat
      return textColor;
    };

    const pointLabelColors = [
      textColor, // HP
      getStatColor('atk'), // Atk
      getStatColor('def'), // Def
      getStatColor('spe'), // Spe
      getStatColor('spd'), // SpD
      getStatColor('spa'), // SpA
    ];

    let statValues: number[];
    let chartColor: string;

    if (viewMode === 'current') {
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
              color: pointLabelColors as any,
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
        pokemonSlug: this.localPokemonSlug() || null,
        isOwned: this.isOwned,
        isEvent: this.isEvent,
        isShiny: this.isShiny,
        isGmax: this.isGmax,
        isAlpha: this.isAlpha,
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
      this.pokemonData.set(null);
      this.currentSpriteUrl.set('');
      this.localPokemonSlug.set(null);
      return;
    }
    this.localPokemonSlug.set(newPokemonSlug);
    this.datasetService.loadPokemonBySlug(newPokemonSlug).subscribe((data) => {
      this.pokemonData.set(data);
      this.updateSpritePreview();
      setTimeout(() => this.initChart(), 100);
    });
  }

  onImageError(event: Event) {
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
