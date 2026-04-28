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
  computed,
} from '@angular/core';
import { BoxSlot } from '../../../shared/models/dex.model';
import { ThemeService } from '../../../core/services/theme.service';
import { NatureData } from '../../../shared/models/dataset.model';
import { DatasetService, DatasetPokemon } from '../../../core/api/services/dataset.service';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { CapitalizePipe } from '../../../shared/pipes/capitalize-pipe';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';
import { PokemonStatchartComponent } from '../../../shared/components/pokemon-statchart/pokemon-statchart.component';
import {
  getFullGameName,
  getGameIconPath,
  getGameOriginMark,
} from '../../../core/constants/game-data.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-view-dialog',
  standalone: true,
  imports: [CommonModule, CapitalizePipe, TooltipDirective, PokemonStatchartComponent],
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
              <div class="flex flex-col items-center flex-none">
                <div class="relative w-32 h-32 mb-2">
                  <div
                    class="w-32 h-32 bg-secondary rounded-full flex items-center justify-center border-2 border-theme shadow-inner overflow-hidden relative"
                  >
                    @if (pokemonData()) {
                      <img
                        [src]="spriteUrl()"
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
                          [appTooltip]="pokemonData()?.type1 | capitalize"
                          [alt]="pokemonData()?.type1 | capitalize"
                          class="h-5 object-contain drop-shadow bg-surface rounded-full shadow-sm"
                          (error)="onImageError($event)"
                        />
                      }
                      @if (pokemonData()?.type2) {
                        <img
                          [src]="'assets/images/types/' + pokemonData()!.type2 + '.png'"
                          [appTooltip]="pokemonData()?.type2 | capitalize"
                          [alt]="pokemonData()?.type2 | capitalize"
                          class="h-5 object-contain drop-shadow bg-surface rounded-full shadow-sm"
                          (error)="onImageError($event)"
                        />
                      }
                    </div>
                  }
                </div>
              </div>
              <div class="flex flex-col justify-center flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <div
                    class="w-10 h-10 bg-surface border border-theme rounded-full shadow flex items-center justify-center flex-none"
                  >
                    <img
                      [src]="'assets/images/pokeballs/' + (pkmn.ball || 'pokeball') + '.png'"
                      [alt]="pkmn.ball | capitalize"
                      [appTooltip]="pkmn.ball | capitalize"
                      class="w-7 h-7 object-contain"
                      [class.grayscale]="!pkmn.ball"
                      (error)="onImageError($event)"
                    />
                  </div>

                  <h2 class="text-2xl font-bold truncate">
                    {{ pkmn.customName || localizedName() || pkmn.pokemonSlug || 'Empty Slot' }}
                  </h2>

                  @if (pkmn.isShiny) {
                    <div
                      class="p-1 bg-surface border border-theme rounded-full shadow flex items-center justify-center w-7 h-7 flex-none"
                      [appTooltip]="'Shiny'"
                    >
                      <img
                        src="assets/images/special_attributes/shiny-stars.png"
                        class="w-4 h-4 object-contain"
                      />
                    </div>
                  }

                  @if (pkmn.level) {
                    <div
                      class="font-bold text-primary flex items-center gap-1 opacity-80 flex-none"
                    >
                      <span class="text-sm">Lv.</span><span class="text-lg">{{ pkmn.level }}</span>
                    </div>
                  }

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
                      [appTooltip]="'Gigantamax'"
                    />
                  }
                  @if (pkmn.isAlpha) {
                    <img
                      src="assets/images/special_attributes/alpha.png"
                      class="h-6 w-6 object-contain flex-none"
                      [appTooltip]="'Alpha'"
                    />
                  }
                  @if (pkmn.isEvent) {
                    <span
                      class="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded font-bold border border-purple-200 shadow-sm flex-none"
                      >Event</span
                    >
                  }
                </div>

                @if (pkmn.pokemonSlug) {
                  <div class="flex items-center gap-2 mt-1">
                    @if (originMark(); as markId) {
                      <div
                        class="w-5 h-5 flex items-center justify-center opacity-70"
                        [appTooltip]="originMark()!.name"
                      >
                        @if (themeService.currentTheme() === 'dark') {
                          <img
                            [src]="'assets/images/origin_marks/' + originMark()!.id + '-white.png'"
                            class="w-5 h-5"
                            [alt]="originMark()!.name"
                          />
                        } @else {
                          <img
                            [src]="'assets/images/origin_marks/' + originMark()!.id + '-black.png'"
                            class="w-5 h-5"
                            [alt]="originMark()!.name"
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
                [appTooltip]="'General'"
                tooltipPosition="right"
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
                [appTooltip]="'Stats'"
                tooltipPosition="right"
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
                [appTooltip]="'Ribbons & Marks'"
                tooltipPosition="right"
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
                              <span class="font-medium">{{ localizedName() }}</span>
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
                            <span class="font-medium">{{ localizedGenus() }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-secondary text-sm">Nature</span>
                            <span class="font-medium">{{ natureName() }}</span>
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
                              @if (originGameIcon()) {
                                <img
                                  [src]="originGameIcon()"
                                  class="w-6 h-6 object-contain drop-shadow-sm"
                                  [appTooltip]="originGameName()"
                                  [alt]="originGameName()"
                                />
                              }
                              <span class="font-medium">{{ originGameName() }}</span>
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
                      <app-pokemon-statchart
                        [pokemonData]="pokemonData()!"
                        [pokemon]="pkmn"
                      ></app-pokemon-statchart>
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
                              [alt]="ribbonName() || pkmn.ribbon"
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
                              [alt]="markName() || pkmn.mark"
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
                [appTooltip]="'Previous Pokémon'"
                tooltipPosition="top"
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
                [appTooltip]="'Next Pokémon'"
                tooltipPosition="top"
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
  styles: [],
})
export class PokemonViewDialogComponent {
  datasetService = inject(DatasetService);
  themeService = inject(ThemeService);
  langService = inject(PokemonLanguageService);

  pokemon = input.required<BoxSlot>();
  dexId = input.required<string>();
  boxNumber = input.required<number>();

  closed = output<void>();
  previous = output<void>();
  next = output<void>();
  edit = output<void>();

  pokemonData = signal<DatasetPokemon | null>(null);
  allNatures = signal<NatureData[]>([]);
  activeTabIndex = signal<number>(0);
  ribbonName = signal('');
  ribbonSpriteUrl = signal('');
  markName = signal('');
  markSpriteUrl = signal('');

  constructor() {
    effect(() => {
      const pkmn = this.pokemon();
      if (pkmn.pokemonSlug) {
        this.datasetService.loadPokemonBySlug(pkmn.pokemonSlug).subscribe((data) => {
          this.pokemonData.set(data);
        });
      } else {
        this.pokemonData.set(null);
      }

      if (pkmn.ribbon) {
        this.datasetService.loadRibbons().subscribe((ribbons) => {
          const found = ribbons.find((ribbon) => ribbon.id === pkmn.ribbon);
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
          const found = marks.find((mark) => mark.id === pkmn.mark);
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

  localizedName = computed(() => {
    const data = this.pokemonData();
    return data ? this.langService.getName(data) : '';
  });

  localizedGenus = computed(() => {
    const data = this.pokemonData();
    if (!data) return 'Pokémon';
    const lang = this.langService.currentLang();
    return data.genus?.[lang] || data.genus?.['eng'] || 'Pokémon';
  });

  natureName = computed(() => {
    const natureId = this.pokemon().nature;
    if (!natureId) return '—';
    const nature = this.allNatures().find((n) => n.id === natureId);
    return nature ? this.capitalize(nature.name) : this.capitalize(natureId);
  });

  originGameName = computed(() => {
    const gameCode = this.pokemon().originGame;
    return gameCode ? getFullGameName(gameCode) : '—';
  });

  originGameIcon = computed(() => {
    const gameCode = this.pokemon().originGame;
    return gameCode ? getGameIconPath(gameCode) : '';
  });

  originMark = computed(() => {
    const gameCode = this.pokemon().originGame;
    return gameCode ? getGameOriginMark(gameCode) : null;
  });

  spriteUrl = computed(() => {
    const data = this.pokemonData();
    const isShiny = this.pokemon().isShiny;

    if (!data) return '';
    return this.datasetService.getSpriteUrl(data, isShiny);
  });

  capitalize(str: string | undefined | null): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
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
