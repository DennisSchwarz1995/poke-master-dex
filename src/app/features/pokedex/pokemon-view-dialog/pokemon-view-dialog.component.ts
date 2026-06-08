import { Component, input, output, signal, inject, HostListener, computed } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';

import { BoxSlot } from '../../../shared/models/dex.model';
import { ThemeService } from '../../../core/services/theme.service';
import { NatureData, RibbonData, MarkData } from '../../../shared/models/dataset.model';
import { DatasetService, DatasetPokemon } from '../../../core/api/services/dataset.service';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';
import { PokemonStatchartComponent } from '../../../shared/components/pokemon-statchart/pokemon-statchart.component';
import {
  getFullGameName,
  getGameIconPath,
  getGameOriginMark,
} from '../../../core/constants/game-data.constants';
import { CommonModule } from '@angular/common';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';

@Component({
  selector: 'app-pokemon-view-dialog',
  standalone: true,
  imports: [CommonModule, CapitalizePipe, TooltipDirective, PokemonStatchartComponent, CdnUrlPipe],
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
                          [src]="pokemonData()!.type1 + '.png' | cdnUrl: 'types'"
                          [appTooltip]="pokemonData()?.type1 | capitalize"
                          [alt]="pokemonData()?.type1 | capitalize"
                          class="h-5 object-contain drop-shadow bg-surface rounded-full shadow-sm"
                          (error)="onImageError($event)"
                        />
                      }
                      @if (pokemonData()?.type2) {
                        <img
                          [src]="pokemonData()!.type2 + '.png' | cdnUrl: 'types'"
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
              <div class="flex flex-col self-start flex-1 min-w-0">
                <div class="flex items-center flex-wrap">
                  <div class="w-10 h-10 flex items-center justify-center flex-none">
                    <img
                      [src]="pkmn.ball + '.webp' | cdnUrl: 'pokeballs'"
                      [alt]="pkmn.ball | capitalize"
                      [appTooltip]="pkmn.ball | capitalize"
                      class="w-12 h-12 object-contain"
                      [class.grayscale]="!pkmn.ball"
                      (error)="onImageError($event)"
                    />
                  </div>

                  <h2 class="text-2xl font-bold truncate">
                    {{
                      (pkmn.pokemonSlug | capitalize) ||
                        pkmn.nickname ||
                        pkmn.customName ||
                        localizedName() ||
                        'Empty Slot'
                    }}
                  </h2>

                  @if (pkmn.level) {
                    <div
                      class="font-bold text-primary flex items-center gap-1 opacity-80 flex-none"
                    >
                      <span class="text-sm">Lv.</span><span class="text-lg">{{ pkmn.level }}</span>
                    </div>
                  }

                  @if (pkmn.isShiny) {
                    <div
                      class="p-1 bg-surface flex items-center justify-center w-7 h-7 flex-none"
                      [appTooltip]="'Shiny'"
                    >
                      <img
                        [src]="'ShinySVStar.png' | cdnUrl: 'special_attributes'"
                        class="w-12 h-12 object-contain"
                        alt="Shiny"
                      />
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
                      alt="Male"
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
                      [src]="'gigantamax.png' | cdnUrl: 'special_attributes'"
                      alt="'Gigantamax'"
                      class="h-6 w-6 object-contain flex-none"
                      [appTooltip]="'Gigantamax'"
                    />
                  }
                  @if (pkmn.isAlpha) {
                    <img
                      [src]="'alpha.png' | cdnUrl: 'special_attributes'"
                      alt="Alpha"
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
                        <img
                          [src]="
                            (themeService.currentTheme() === 'dark'
                              ? originMark()!.id + '-white.png'
                              : originMark()!.id + '-black.png'
                            ) | cdnUrl: 'origin_marks'
                          "
                          class="w-5 h-5"
                          [alt]="originMark()!.name"
                        />
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
                [appTooltip]="'Moves'"
                tooltipPosition="right"
              >
                <img
                  [src]="'ribbon.png' | cdnUrl: 'icons'"
                  alt="Moves"
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
                [appTooltip]="'Stats'"
                tooltipPosition="right"
              >
                <img
                  [src]="'stats.png' | cdnUrl: 'icons'"
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
                (click)="activeTabIndex.set(3)"
                class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all"
                [ngClass]="
                  activeTabIndex() === 3
                    ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
                "
                [appTooltip]="'Ribbons & Marks'"
                tooltipPosition="right"
              >
                <img
                  [src]="'ribbon.png' | cdnUrl: 'icons'"
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
                            <span class="text-secondary text-sm">Nickname</span>
                            <div class="flex items-center gap-2">
                              <span class="font-medium">{{ pkmn.nickname || '—' }}</span>
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
                              <span class="font-medium">{{ originGameName() }}</span>
                              @if (originGameIcon()) {
                                <img
                                  [src]="originGameIcon() | cdnUrl: 'games'"
                                  class="w-6 h-6 object-contain drop-shadow-sm"
                                  [appTooltip]="originGameName()"
                                  [alt]="originGameName()"
                                />
                              }
                            </div>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-secondary text-sm">Stored In</span>
                            <div class="flex items-center gap-2">
                              <span class="font-medium">{{ storedInGameName() }}</span>
                              @if (storedInGameIcon()) {
                                <img
                                  [src]="storedInGameIcon() | cdnUrl: 'games'"
                                  class="w-6 h-6 object-contain drop-shadow-sm"
                                  [appTooltip]="storedInGameName()"
                                  [alt]="storedInGameName()"
                                />
                              }
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
                    <div class="max-w-md mx-auto space-y-6">
                      <h3
                        class="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-theme pb-2"
                      >
                        Moves
                      </h3>

                      @if (hasAnyMove(pkmn)) {
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          @for (move of formattedMoves(); track $index) {
                            @if (move) {
                              <div
                                class="p-4 bg-secondary/10 border border-theme rounded-2xl flex items-center justify-between shadow-sm hover:bg-secondary/20 transition-all duration-300 relative overflow-hidden group"
                              >
                                <div class="flex flex-col">
                                  <span
                                    class="text-xs text-secondary opacity-60 uppercase font-mono mb-1"
                                    >Slot {{ $index + 1 }}</span
                                  >
                                  <span
                                    class="font-bold text-primary text-base group-hover:text-blue-500 transition-colors"
                                  >
                                    {{ formatMoveName(move) }}
                                  </span>
                                </div>
                              </div>
                            } @else {
                              <div
                                class="p-4 bg-secondary/5 border border-theme border-dashed rounded-2xl flex items-center justify-between opacity-60"
                              >
                                <div class="flex flex-col">
                                  <span
                                    class="text-xs text-secondary opacity-60 uppercase font-mono mb-1"
                                    >Slot {{ $index + 1 }}</span
                                  >
                                  <span class="italic text-tertiary text-base">Empty Slot</span>
                                </div>
                              </div>
                            }
                          }
                        </div>
                      } @else {
                        <div
                          class="flex flex-col items-center justify-center p-8 bg-secondary/5 border border-theme rounded-2xl text-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="40px"
                            viewBox="0 -960 960 960"
                            width="40px"
                            fill="currentColor"
                            class="text-secondary opacity-40 mb-3"
                          >
                            <path
                              d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L252-648q-33 42-50.5 92T184-480q0 123 86.5 209.5T480-160Zm228-112q33-42 50.5-92t17.5-104q0-123-86.5-209.5T480-800q-54 0-104 17.5t-92 50.5l424 420Z"
                            />
                          </svg>
                          <p class="text-sm font-medium text-secondary">
                            No moves configured for this Pokémon.
                          </p>
                          <p class="text-xs text-tertiary mt-1">Click Edit to add moves.</p>
                        </div>
                      }
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
                              [src]="ribbonSpriteUrl() | cdnUrl: 'ribbons'"
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
                              [src]="markSpriteUrl() | cdnUrl: 'marks'"
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
                class="px-3 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold hover:bg-theme"
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
                class="px-3 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold hover:bg-theme"
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
                class="px-5 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold hover:bg-theme"
                (click)="edit.emit()"
              >
                Edit
              </button>
              <button
                class="px-5 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold hover:bg-theme"
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
  allRibbons = signal<RibbonData[]>([]);
  allMarks = signal<MarkData[]>([]);
  activeTabIndex = signal<number>(0);

  constructor() {
    // 1. Daten reaktiv laden (ohne Memory Leak)
    toObservable(this.pokemon)
      .pipe(
        switchMap((pkmn) => {
          if (pkmn.pokemonSlug) {
            return this.datasetService.loadPokemonBySlug(pkmn.pokemonSlug);
          }
          return of(null);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((data) => {
        this.pokemonData.set(data);
      });

    // 2. Einmalige Listen laden
    this.datasetService.loadNatures().subscribe((natures) => this.allNatures.set(natures));
    this.datasetService.loadRibbons().subscribe((ribbons) => this.allRibbons.set(ribbons));
    this.datasetService.loadMarks().subscribe((marks) => this.allMarks.set(marks));
  }

  // 3. Computed Signals für Ribbons und Marks
  ribbonName = computed(() => {
    const pkmn = this.pokemon();
    const found = this.allRibbons().find((r) => r.id === pkmn.ribbon);
    return found ? found.name : '';
  });

  ribbonSpriteUrl = computed(() => {
    const pkmn = this.pokemon();
    const found = this.allRibbons().find((r) => r.id === pkmn.ribbon);
    return found ? `${found.id}.png` : '';
  });

  markName = computed(() => {
    const pkmn = this.pokemon();
    const found = this.allMarks().find((m) => m.id === pkmn.mark);
    return found ? found.name : '';
  });

  markSpriteUrl = computed(() => {
    const pkmn = this.pokemon();
    const found = this.allMarks().find((m) => m.id === pkmn.mark);
    return found ? `${found.id}.png` : '';
  });

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

  storedInGameName = computed(() => {
    const gameCode = this.pokemon().storedIn;
    return gameCode ? getFullGameName(gameCode) : '—';
  });

  storedInGameIcon = computed(() => {
    const gameCode = this.pokemon().storedIn;
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

  formattedMoves = computed(() => {
    const pkmn = this.pokemon();
    const moves = (pkmn as any).moves || [];
    const padded = [...moves];
    while (padded.length < 4) {
      padded.push('');
    }
    return padded.slice(0, 4);
  });

  hasAnyMove(pkmn: BoxSlot): boolean {
    const moves = (pkmn as any).moves;
    if (!moves || !Array.isArray(moves)) return false;
    return moves.some((move) => move && move.trim() !== '');
  }

  formatMoveName(move: string | undefined | null): string {
    if (!move) return '—';
    return move
      .split('-')
      .map((word) => this.capitalize(word))
      .join(' ');
  }

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
