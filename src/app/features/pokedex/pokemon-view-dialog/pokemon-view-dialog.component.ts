import {
  Component,
  input,
  output,
  signal,
  OnInit,
  inject,
  HostListener,
  ViewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { BoxSlot } from '../../../shared/models/dex.model';
import { ThemeService } from '../../../core/services/theme.service';
import { NatureData } from '../../../shared/models/dataset.model';
import { DatasetService, DatasetPokemon } from '../../../core/api/services/dataset.service';
import { getAvailableGamesForPokemon } from '../../../shared/models/game-definitions';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';

@Component({
  selector: 'app-pokemon-view-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      (click)="closed.emit()"
    >
      <div
        class="bg-surface border border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
        (click)="$event.stopPropagation()"
      >
        @if (pokemon(); as pkmn) {
          <div class="p-6 pb-4 relative flex-none border-b border-theme bg-surface z-20">
            <div class="flex items-center gap-5">
              <!-- Sprite + Types -->
              <div class="flex flex-col items-center flex-none">
                <div class="relative w-32 h-32 mb-2">
                  <div
                    class="w-32 h-32 bg-secondary rounded-full flex items-center justify-center border-2 border-theme shadow-inner overflow-hidden relative"
                  >
                    @if (pokemonData()) {
                      <img
                        [src]="datasetService.getSpriteUrl(pokemonData()!, pkmn.isShiny)"
                        [alt]="pokemonData()?.names?.['eng'] || 'Pokemon'"
                        class="w-28 h-28 object-contain drop-shadow-md z-0"
                        (error)="onImageError($event)"
                      />
                    }
                  </div>

                  @if (pkmn.pokemonSlug) {
                    <div
                      class="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 z-20 whitespace-nowrap"
                    >
                      @if (pokemonData()?.type1) {
                        <img
                          [src]="'assets/images/types/' + pokemonData()!.type1 + '.png'"
                          [title]="capitalize(pokemonData()!.type1)"
                          [alt]="capitalize(pokemonData()!.type1)"
                          class="h-5 object-contain drop-shadow bg-surface rounded-full shadow-sm"
                          (error)="onImageError($event)"
                        />
                      }
                      @if (pokemonData()?.type2) {
                        <img
                          [src]="'assets/images/types/' + pokemonData()!.type2 + '.png'"
                          [title]="capitalize(pokemonData()!.type2)"
                          [alt]="capitalize(pokemonData()!.type2)"
                          class="h-5 object-contain drop-shadow bg-surface rounded-full shadow-sm"
                          (error)="onImageError($event)"
                        />
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Right side: Pokeball + Name row -->
              <div class="flex flex-col justify-center flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <!-- Pokeball -->
                  <div
                    class="w-10 h-10 bg-surface border border-theme rounded-full shadow flex items-center justify-center flex-none"
                  >
                    <img
                      [src]="'assets/images/pokeballs/' + (pkmn.ball || 'pokeball') + '.png'"
                      [alt]="capitalize(pkmn.ball)"
                      [title]="capitalize(pkmn.ball)"
                      class="w-7 h-7 object-contain"
                      [class.grayscale]="!pkmn.ball"
                      (error)="onImageError($event)"
                    />
                  </div>

                  <!-- Nickname / Name -->
                  <h2 class="text-2xl font-bold truncate">
                    {{
                      pkmn.customName || getLocalizedName() || pkmn.pokemonSlug || 'Empty Slot'
                    }}
                  </h2>

                  <!-- Shiny sparks -->
                  @if (pkmn.isShiny) {
                    <div
                      class="p-1 bg-surface border border-theme rounded-full shadow flex items-center justify-center w-7 h-7 flex-none"
                      title="Shiny"
                    >
                      <img
                        src="assets/images/special_attributes/shiny-stars.png"
                        alt="Shiny"
                        class="w-4 h-4 object-contain"
                      />
                    </div>
                  }

                  <!-- Level -->
                  @if (pkmn.level) {
                    <div class="font-bold text-primary flex items-center gap-1 opacity-80 flex-none">
                      <span class="text-sm">Lv.</span><span class="text-lg">{{ pkmn.level }}</span>
                    </div>
                  }

                  <!-- Gender -->
                  @if (pkmn.gender === 'male') {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#4285f4"
                      class="flex-none"
                    >
                      <path
                        d="M797.5-797.5v235h-75V-669L558-505.5q19 28 29.25 59.66Q597.5-414.18 597.5-380q0 90.95-63.28 154.23-63.28 63.27-154.25 63.27t-154.22-63.28q-63.25-63.28-63.25-154.25t63.27-154.22Q289.05-597.5 380-597.5q33.5 0 65.5 10T505-558l164-164.5H562.5v-75h235ZM279.25-480.78q-41.75 41.73-41.75 100.75 0 59.03 41.72 100.78 41.73 41.75 100.75 41.75 59.03 0 100.78-41.72 41.75-41.73 41.75-100.75 0-59.03-41.72-100.78-41.73-41.75-100.75-41.75-59.03 0-100.78 41.72Z"
                      />
                    </svg>
                  }
                  @if (pkmn.gender === 'female') {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#d6428c"
                      class="flex-none"
                    >
                      <path
                        d="M442.5-122.5v-80h-80v-75h80V-366q-78.5-14-129.25-74.6Q262.5-501.19 262.5-581q0-90.37 63.5-153.44 63.5-63.06 154-63.06t154 63.06q63.5 63.07 63.5 153.44 0 79.81-50.75 140.4Q596-380 517.5-366v88.5h80v75h-80v80h-75Zm138.25-356.72q41.75-41.73 41.75-100.75 0-59.03-41.72-100.78-41.73-41.75-100.75-41.75-59.03 0-100.78 41.72-41.75 41.73-41.75 100.75 0 59.03 41.72 100.78 41.73 41.75 100.75 41.75 59.03 0 100.78-41.72Z"
                      />
                    </svg>
                  }

                  @if (pkmn.isGmax) {
                    <img
                      src="assets/images/special_attributes/gigantamax.png"
                      class="h-6 w-6 object-contain flex-none"
                      title="Gigantamax"
                    />
                  }
                  @if (pkmn.isAlpha) {
                    <img
                      src="assets/images/special_attributes/alpha.png"
                      class="h-6 w-6 object-contain flex-none"
                      title="Alpha"
                    />
                  }
                  @if (pkmn.isEvent) {
                    <span
                      class="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded font-bold border border-purple-200 shadow-sm flex-none"
                      >Event</span
                    >
                  }
                </div>

                <!-- Origin Mark below the name row -->
                @if (pkmn.pokemonSlug) {
                  <div class="flex items-center gap-2 mt-1">
                    @if (getOriginMark(pkmn.originGame); as markId) {
                      <div
                        class="w-5 h-5 flex items-center justify-center opacity-70"
                        [title]="getOriginMarkName(markId)"
                      >
                        @if (themeService.currentTheme() === 'dark') {
                          <img
                            [src]="'assets/images/origin_marks/' + markId + '-white.png'"
                            class="w-5 h-5"
                            alt="Origin Mark"
                          />
                        } @else {
                          <img
                            [src]="'assets/images/origin_marks/' + markId + '-black.png'"
                            class="w-5 h-5"
                            alt="Origin Mark"
                          />
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="flex flex-1 overflow-hidden bg-secondary/10">
            <div
              class="w-20 sm:w-24 flex-none border-r border-theme bg-surface z-10 flex flex-col items-center justify-center py-4 gap-4 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)]"
            >
              <button
                (click)="activeTabIndex.set(0)"
                class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all"
                [ngClass]="
                  activeTabIndex() === 0
                    ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
                "
                title="General"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-info size-5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </button>
              <button
                (click)="activeTabIndex.set(1)"
                class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all"
                [ngClass]="
                  activeTabIndex() === 1
                    ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
                "
                title="Stats"
              >
                <img
                  src="assets/images/icons/stats.png"
                  alt="Stats"
                  class="w-6 h-6 transition-all"
                  [style.filter]="
                    themeService.currentTheme() === 'dark'
                      ? 'brightness(0) invert(1)'
                      : 'brightness(0)'
                  "
                />
              </button>
              <button
                (click)="activeTabIndex.set(2)"
                class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all"
                [ngClass]="
                  activeTabIndex() === 2
                    ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
                "
                title="Ribbons & Marks"
              >
                <img
                  src="assets/images/icons/ribbon.png"
                  alt="Ribbons"
                  class="w-6 h-6 transition-all"
                  [style.filter]="
                    themeService.currentTheme() === 'dark'
                      ? 'brightness(0) invert(1)'
                      : 'brightness(0)'
                  "
                />
              </button>
            </div>

            <div class="flex-1 relative overflow-hidden flex">
              <div
                class="flex w-full h-full transition-transform duration-300 ease-in-out"
                [style.transform]="'translateX(-' + activeTabIndex() * 100 + '%)'"
              >
                <div class="w-full h-full flex-shrink-0 overflow-y-auto custom-scrollbar p-6">
                  @if (pkmn.pokemonSlug) {
                    <div class="grid grid-cols-1 gap-6 max-w-md mx-auto">
                      <div>
                        <div class="space-y-3">
                          <div class="flex justify-between items-center">
                            <span class="text-secondary text-sm">Pokemonname</span>
                            <div class="flex items-center gap-2">
                              <span class="font-medium">{{ getLocalizedName() }}</span>
                              @if (pkmn.mark) {
                                <img [src]="markSpriteUrl()" class="w-6 h-6 object-contain drop-shadow-sm" [title]="markName() || pkmn.mark" />
                              }
                            </div>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-secondary text-sm">National Dex</span>
                            <span class="font-medium font-mono"
                              >#{{ pokemonData()?.nid || '???' }}</span
                            >
                          </div>
                          <div class="flex justify-between">
                            <span class="text-secondary text-sm">Species</span>
                            <span class="font-medium">{{ getLocalizedGenus() }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-secondary text-sm">Nature</span>
                            <span class="font-medium">{{ getNatureName(pkmn.nature) || '—' }}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div class="space-y-3">
                          <div class="flex justify-between">
                            <span class="text-secondary text-sm">Language</span>
                            <span class="font-medium">{{ pkmn.originLanguage || '—' }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-secondary text-sm" title="Original Trainer">OT</span>
                            <span class="font-medium">{{ pkmn.originalTrainer || '—' }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-secondary text-sm" title="Trainer ID">TID</span>
                            <span class="font-medium">{{ pkmn.trainerId || '—' }}</span>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-secondary text-sm">Origin Game</span>
                            <div class="flex items-center gap-2">
                              @if (getGameIconUrl(pkmn.originGame)) {
                                <img [src]="getGameIconUrl(pkmn.originGame)" class="w-6 h-6 object-contain drop-shadow-sm" [title]="formatFullGameName(pkmn.originGame)" />
                              }
                              <span class="font-medium">{{ formatFullGameName(pkmn.originGame) || '—' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  } @else {
                    <div class="flex flex-col items-center justify-center h-40 text-tertiary">
                      <p class="text-lg">This slot is empty.</p>
                    </div>
                  }
                </div>

                <div class="w-full h-full flex-shrink-0 overflow-y-auto custom-scrollbar p-6">
                  @if (pkmn.pokemonSlug) {
                    <div class="max-w-md mx-auto">
                      <div>
                        <div
                          class="flex items-center justify-between mb-4 border-b border-theme pb-2"
                        >
                          <h3 class="text-sm font-bold text-secondary uppercase tracking-wider">
                            Stats
                          </h3>
                          <div class="flex gap-2">
                            <button
                              (click)="switchStatsView('base')"
                              [class]="
                                statsView() === 'base'
                                  ? 'px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded'
                                  : 'px-2 py-0.5 text-[10px] font-medium text-secondary hover:text-primary rounded'
                              "
                            >
                              Base
                            </button>
                            <button
                              (click)="switchStatsView('current')"
                              [class]="
                                statsView() === 'current'
                                  ? 'px-2 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded'
                                  : 'px-2 py-0.5 text-[10px] font-medium text-secondary hover:text-primary rounded'
                              "
                            >
                              Current
                            </button>
                          </div>
                        </div>
                        <div class="h-64 w-full flex items-center justify-center relative">
                          <canvas #statsChart></canvas>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <div class="w-full h-full flex-shrink-0 overflow-y-auto custom-scrollbar p-6">
                  @if (pkmn.pokemonSlug) {
                    <div class="max-w-md mx-auto space-y-8">
                      <div>
                        <h3
                          class="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-theme pb-2"
                        >
                          Ribbons
                        </h3>
                        @if (pkmn.ribbon) {
                          <div class="flex items-center gap-4 p-3 bg-secondary/10 rounded-lg">
                            <img
                              [src]="ribbonSpriteUrl()"
                              class="w-10 h-10 object-contain drop-shadow-md"
                            />
                            <span class="font-bold text-lg">{{ ribbonName() || pkmn.ribbon }}</span>
                          </div>
                        } @else {
                          <p class="text-tertiary text-sm italic">None equipped</p>
                        }
                      </div>

                      <div>
                        <h3
                          class="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-theme pb-2"
                        >
                          Marks
                        </h3>
                        @if (pkmn.mark) {
                          <div class="flex items-center gap-4 p-3 bg-secondary/10 rounded-lg">
                            <img
                              [src]="markSpriteUrl()"
                              class="w-10 h-10 object-contain drop-shadow-md"
                            />
                            <span class="font-bold text-lg">{{ markName() || pkmn.mark }}</span>
                          </div>
                        } @else {
                          <p class="text-tertiary text-sm italic">None equipped</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-theme bg-surface flex justify-between items-center z-20">
            <div class="flex gap-2">
              <button
                class="px-3 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme"
                (click)="previous.emit()"
                title="Previous Pokémon"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>
              <button
                class="px-3 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme"
                (click)="next.emit()"
                title="Next Pokémon"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            </div>

            <div class="flex gap-3">
              <button
                class="px-5 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme"
                (click)="edit.emit()"
              >
                Edit
              </button>
              <button
                class="px-5 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme"
                (click)="closed.emit()"
              >
                Close
              </button>
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
export class PokemonViewDialogComponent implements OnInit {
  pokemon = input.required<BoxSlot>();
  dexId = input.required<string>();
  boxNumber = input.required<number>();

  closed = output<void>();
  previous = output<void>();
  next = output<void>();
  edit = output<void>();

  datasetService = inject(DatasetService);
  themeService = inject(ThemeService);
  langService = inject(PokemonLanguageService);

  pokemonData = signal<DatasetPokemon | null>(null);

  @ViewChild('statsChart') statsChartRef!: ElementRef<HTMLCanvasElement>;
  chartInstance: Chart | null = null;
  statsView = signal<'base' | 'current'>('base');
  allNatures = signal<NatureData[]>([]);

  activeTabIndex = signal<number>(0);

  ribbonName = signal('');
  ribbonSpriteUrl = signal('');
  markName = signal('');
  markSpriteUrl = signal('');
  pokemonName = (lang: string) => this.pokemonData()?.names[lang] || '';
  getOriginMarkName(markId: string | null): string {
    if (!markId) return '';
    const names: Record<string, string> = {
      'virtual-console': 'GameBoy Mark',
      kalos: 'Kalos Mark',
      alola: 'Alola Mark',
      'lets-go': 'Kanto Mark',
      go: 'Go Mark',
      galar: 'Galar Mark',
      sinnoh: 'Sinnoh Mark',
      hisui: 'Hisui Mark',
      paldea: 'Paldea Mark',
    };
    return names[markId] || '';
  }

  getOriginMark(gameCode: string | undefined | null): string | null {
    if (!gameCode) return null;

    // Virtual Console (Gen 1 & 2)
    if (gameCode.startsWith('rby-') || gameCode.startsWith('gsc-')) return 'virtual-console';

    // Gen 6 (Pentagon)
    if (gameCode.startsWith('xy-') || gameCode.startsWith('oras-')) return 'kalos';

    // Gen 7 (Alola clover)
    if (gameCode.startsWith('sm-') || gameCode.startsWith('usum-')) return 'alola';

    // Let's Go
    if (gameCode.startsWith('lgpe-')) return 'lets-go';

    // Pokemon GO
    if (gameCode === 'go') return 'go';

    // Gen 8 (Galar)
    if (gameCode.startsWith('swsh-')) return 'galar';

    // BDSP (Sinnoh)
    if (gameCode.startsWith('bdsp-')) return 'sinnoh';

    // Legends Arceus (Hisui)
    if (gameCode === 'la') return 'hisui';

    // Gen 9 (Paldea)
    if (gameCode.startsWith('sv-')) return 'paldea';

    // Gen 3, Gen 4, Gen 5 and anything else has no mark
    return null;
  }

  constructor() {
    effect(() => {
      const pkmn = this.pokemon();
      if (pkmn.pokemonSlug) {
        this.datasetService.loadPokemonBySlug(pkmn.pokemonSlug).subscribe((data) => {
          this.pokemonData.set(data);
          setTimeout(() => this.initChart(), 100);
        });
      } else {
        this.pokemonData.set(null);
        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }
      }

      if (pkmn.ribbon) {
        this.datasetService.loadRibbons().subscribe((ribbons) => {
          const found = ribbons.find((r) => r.id === pkmn.ribbon);
          if (found) {
            this.ribbonName.set(found.name);
            this.ribbonSpriteUrl.set(`assets/images/ribbons/${found.id}.png`);
          }
        });
      } else {
        this.ribbonName.set('');
        this.ribbonSpriteUrl.set('');
      }

      if (pkmn.mark) {
        this.datasetService.loadMarks().subscribe((marks) => {
          const found = marks.find((m) => m.id === pkmn.mark);
          if (found) {
            this.markName.set(found.name);
            this.markSpriteUrl.set(`assets/images/marks/${found.id}.png`);
          }
        });
      } else {
        this.markName.set('');
        this.markSpriteUrl.set('');
      }
    });

    this.datasetService.loadNatures().subscribe((natures) => {
      this.allNatures.set(natures);
    });
  }

  ngOnInit() {}

  getNatureName(natureId: string | undefined): string {
    if (!natureId) return '';
    const nature = this.allNatures().find(n => n.id === natureId);
    return nature ? this.capitalize(nature.name) : this.capitalize(natureId);
  }

  formatFullGameName(gameCode: string | undefined): string {
    if (!gameCode) return '';
    const code = gameCode.toLowerCase();
    const gameNames: Record<string, string> = {
      'rb-r': 'Red', 'rb-b': 'Blue', y: 'Yellow',
      'rby-r': 'Red', 'rby-b': 'Blue', 'rby-y': 'Yellow',
      'gsc-g': 'Gold', 'gsc-s': 'Silver', 'gsc-c': 'Crystal',
      'gs-g': 'Gold', 'gs-s': 'Silver', c: 'Crystal',
      'rs-r': 'Ruby', 'rs-s': 'Sapphire', e: 'Emerald',
      'rse-r': 'Ruby', 'rse-s': 'Sapphire', 'rse-e': 'Emerald',
      'frlg-fr': 'FireRed', 'frlg-lg': 'LeafGreen',
      'dp-d': 'Diamond', 'dp-p': 'Pearl', 'dppt-pt': 'Platinum', pt: 'Platinum',
      'hgss-hg': 'HeartGold', 'hgss-ss': 'SoulSilver',
      'bw-b': 'Black', 'bw-w': 'White', 'b2w2-b2': 'Black 2', 'b2w2-w2': 'White 2',
      'xy-x': 'X', 'xy-y': 'Y', 'oras-or': 'Omega Ruby', 'oras-as': 'Alpha Sapphire',
      'sm-s': 'Sun', 'sm-m': 'Moon', 'usum-us': 'Ultra Sun', 'usum-um': 'Ultra Moon',
      'lgpe-lgp': "Let's Go, Pikachu!", 'lgpe-lge': "Let's Go, Eevee!",
      'swsh-sw': 'Sword', 'swsh-sh': 'Shield',
      'bdsp-bd': 'Brilliant Diamond', 'bdsp-sp': 'Shining Pearl',
      la: 'Legends: Arceus', pla: 'Legends: Arceus',
      'sv-s': 'Scarlet', 'sv-v': 'Violet', lza: 'Legends: Z-A',
      go: 'Pokémon GO', home: 'Pokémon HOME', bank: 'Pokémon Bank',
      xd: 'Pokémon XD', colosseum: 'Pokémon Colosseum',
    };
    return gameNames[code] || this.formatGame(gameCode);
  }

  getGameIconUrl(gameCode: string | undefined): string {
    if (!gameCode) return '';
    const code = gameCode.toLowerCase();
    const map: Record<string, string> = {
      'rb-r': 'red.png', 'rb-b': 'blue.png', y: 'yellow.png',
      'rby-r': 'red.png', 'rby-b': 'blue.png', 'rby-y': 'yellow.png',
      'gsc-g': 'gold.png', 'gsc-s': 'silver.png', 'gsc-c': 'crystal.png',
      'gs-g': 'gold.png', 'gs-s': 'silver.png', c: 'crystal.png',
      'rs-r': 'ruby.png', 'rs-s': 'sapphire.png', e: 'emerald.png',
      'rse-r': 'ruby.png', 'rse-s': 'sapphire.png', 'rse-e': 'emerald.png',
      'frlg-fr': 'firered.png', 'frlg-lg': 'leafgreen.png',
      'dp-d': 'diamond.png', 'dp-p': 'pearl.png', 'dppt-pt': 'platin.png', pt: 'platin.png',
      'hgss-hg': 'heartgold.png', 'hgss-ss': 'soulsilver.png',
      'bw-b': 'black.png', 'bw-w': 'white.png', 'b2w2-b2': 'black2.png', 'b2w2-w2': 'white2.png',
      'xy-x': 'x.png', 'xy-y': 'y.png', 'oras-or': 'omega_ruby.png', 'oras-as': 'alpha_sapphire.png',
      'sm-s': 'sun.png', 'sm-m': 'moon.png', 'usum-us': 'ultra_sun.png', 'usum-um': 'ultra_moon.png',
      'lgpe-lgp': "let's_go_pikachu.png", 'lgpe-lge': "let's_go_eevee.png",
      'swsh-sw': 'sword.png', 'swsh-sh': 'shield.png',
      'bdsp-bd': 'brilliant_diamond.png', 'bdsp-sp': 'shining_pearl.png',
      la: 'legends_arceus.png', pla: 'legends_arceus.png',
      'sv-s': 'scarlet.png', 'sv-v': 'violet.png', lza: 'legends_z-a.png',
      go: 'go.png', home: 'home.png', bank: 'bank.png',
      xd: 'xd.png', colosseum: 'coloseum.png',
    };
    const filename = map[code];
    return filename ? `assets/images/games/${filename}` : '';
  }

  formatGame(gameCode: string | undefined): string {
    if (!gameCode) return '';
    const parts = gameCode.split('-');
    if (parts.length > 1) {
      return parts[1].toUpperCase();
    }
    return gameCode.toUpperCase();
  }

  capitalize(str: string | undefined | null): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getLocalizedName(): string {
    const data = this.pokemonData();
    if (!data) return '';
    return this.langService.getName(data);
  }

  getLocalizedGenus(): string {
    const data = this.pokemonData();
    if (!data) return 'Pokémon';
    const lang = this.langService.currentLang();
    return data.genus?.[lang] || data.genus?.['eng'] || 'Pokémon';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  switchStatsView(view: 'base' | 'current') {
    this.statsView.set(view);
    setTimeout(() => this.initChart(), 50);
  }

  initChart() {
    if (!this.statsChartRef || !this.pokemonData()) return;

    const ctx = this.statsChartRef.nativeElement;
    const stats = this.pokemonData()!;
    const viewMode = this.statsView();
    const pkmn = this.pokemon();

    if (this.chartInstance) this.chartInstance.destroy();

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#cbd5e1' : '#4b5563';

    const getStatColor = (stat: string) => {
      if (!pkmn.nature) return textColor;
      const nature = this.allNatures().find((n) => n.id === pkmn.nature);
      if (!nature) return textColor;
      if (nature.raises === stat) return '#e46787';
      if (nature.lowers === stat) return '#3babdf';
      return textColor;
    };

    const pointLabelColors = [
      textColor,
      getStatColor('atk'),
      getStatColor('def'),
      getStatColor('spe'),
      getStatColor('spd'),
      getStatColor('spa'),
    ];

    let statValues: number[];
    let chartColor: string;

    if (viewMode === 'current') {
      const currentLevel = pkmn.level || 50;
      const nature = this.allNatures().find((n) => n.id === pkmn.nature);
      const ivs = pkmn.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
      const evs = pkmn.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

      statValues = [
        this.calculateHP(stats.baseHp, currentLevel, ivs.hp, evs.hp),
        this.calculateStat(
          stats.baseAtk,
          currentLevel,
          nature?.raises === 'atk',
          nature?.lowers === 'atk',
          ivs.atk,
          evs.atk,
        ),
        this.calculateStat(
          stats.baseDef,
          currentLevel,
          nature?.raises === 'def',
          nature?.lowers === 'def',
          ivs.def,
          evs.def,
        ),
        this.calculateStat(
          stats.baseSpeed,
          currentLevel,
          nature?.raises === 'spe',
          nature?.lowers === 'spe',
          ivs.spe,
          evs.spe,
        ),
        this.calculateStat(
          stats.baseSpDef,
          currentLevel,
          nature?.raises === 'spd',
          nature?.lowers === 'spd',
          ivs.spd,
          evs.spd,
        ),
        this.calculateStat(
          stats.baseSpAtk,
          currentLevel,
          nature?.raises === 'spa',
          nature?.lowers === 'spa',
          ivs.spa,
          evs.spa,
        ),
      ];
      chartColor = 'rgba(34, 197, 94, 0.8)';
    } else {
      statValues = [
        stats.baseHp,
        stats.baseAtk,
        stats.baseDef,
        stats.baseSpeed,
        stats.baseSpDef,
        stats.baseSpAtk,
      ];
      chartColor = 'rgba(59, 130, 246, 0.8)';
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
            pointRadius: 3,
            pointHoverRadius: 5,
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
              font: { size: 10, weight: 'bold' },
              padding: 6,
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

  calculateHP(base: number, level: number, iv: number, ev: number): number {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }

  calculateStat(
    base: number,
    level: number,
    isRaised: boolean,
    isLowered: boolean,
    iv: number,
    ev: number,
  ): number {
    let stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    if (isRaised) stat = Math.floor(stat * 1.1);
    if (isLowered) stat = Math.floor(stat * 0.9);
    return stat;
  }

  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
