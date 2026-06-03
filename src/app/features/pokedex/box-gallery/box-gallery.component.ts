import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
  ChangeDetectionStrategy,
  computed,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, filter } from 'rxjs/operators';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { TypeColorService } from '../../../core/services/type-color.service';
import { DexStateService } from '../../../core/services/dex-state.service';
import { PokemonEditDialogComponent } from '../pokemon-edit-dialog/pokemon-edit-dialog.component';
import { PokemonViewDialogComponent } from '../pokemon-view-dialog/pokemon-view-dialog.component';
import { Dex, Box, BoxSlot } from '../../../shared/models/dex.model';
import {
  ToolbarComponent,
  QuickEditState,
} from '../../../shared/components/toolbar/toolbar.component';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { HostListener } from '@angular/core';
import { AVAILABLE_SPRITES } from '../../../core/constants/available-sprites.constants';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl-pipe';
import { ToolbarService } from '../../../core/services/toolbar.service';

export interface EnrichedSlot {
  originalSlot: BoxSlot | null;
  sprite: string;
  name: string;
  colors: string[];
  slug: string;
  canGmax: boolean;
  canBeAlpha: boolean;
  isShiny: boolean;
  isGmax: boolean;
  isAlpha: boolean;
  ball?: string;
  isOwned: boolean;
}

export interface BoxWithSprites {
  box: Box;
  slots: EnrichedSlot[];
  ownedCount: number;
  loaded: boolean;
}

@Component({
  selector: 'app-box-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PokemonEditDialogComponent,
    PokemonViewDialogComponent,
    ToolbarComponent,
    RouterLink,
    TooltipDirective,
    ScrollingModule,
    CdnUrlPipe,
  ],
  template: `
    <div class="container mx-auto px-4 pt-6 pb-2">
      <div class="mx-auto w-full flex flex-col gap-6">
        <app-toolbar
          (modeChanged)="onQuickEditModeChanged($event)"
          [pendingEditsCount]="toolbarService.pendingEdits().size"
          [isSaving]="toolbarService.isSavingBatch()"
          (save)="saveAllEdits()"
          (discard)="discardAllEdits()"
          class="w-full"
        >
          <div class="flex justify-start">
            <nav class="flex-shrink-0">
              <a
                routerLink="/pokedex"
                class="flex z-10 relative items-center gap-2 text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme px-3 py-1.5 rounded-xl border border-theme hover:shadow-sm"
              >
                <svg
                  class="w-5 h-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span class="hidden sm:inline">Back to Pokédex</span>
              </a>
            </nav>
          </div>

          <div
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[220px] xs:max-w-xs sm:max-w-sm md:max-w-md z-0 px-2"
          >
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search Pokémon"
              class="w-full px-4 py-3 pr-10 rounded-lg border-2 border-theme bg-surface text-primary placeholder:text-tertiary focus:border-blue-500 focus:outline-none text-base shadow-sm transition-colors"
            />
            @if (searchQuery()) {
              <button
                (click)="clearSearch()"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
                [appTooltip]="'Clear Search'"
                appTooltipPosition="top"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            }
          </div>
        </app-toolbar>

        @if (searchQuery() && matchedLocations().length > 0) {
          <div class="flex flex-col items-center justify-center mt-2 gap-2">
            <p class="text-sm text-secondary">
              {{ matchedPokemonSlugs().size }} Pokémon species found
            </p>
            <button
              (click)="jumpToNextMatch()"
              class="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full font-bold hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              Jump to Next Match ({{ currentMatchIndex() + 1 }} / {{ matchedLocations().length }})
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
          </div>
        }
        <main class="container mx-auto py-4 flex flex-col pt-0 gap-4">
          @if (loading()) {
            <div class="text-center py-12">
              <div
                class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"
              ></div>
              <p class="text-secondary">Loading Gallery...</p>
            </div>
          } @else {
            <cdk-virtual-scroll-viewport
              itemSize="450"
              class="w-full h-[calc(100vh-180px)] overflow-x-hidden hide-scrollbar pr-2"
            >
              <div
                *cdkVirtualFor="let row of viewBoxRows()"
                class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6"
              >
                @for (boxData of row; track boxData.box.boxNumber) {
                  <div
                    #boxCard
                    [attr.data-box-number]="boxData.box.boxNumber"
                    class="bg-surface rounded-xl shadow-lg p-3 hover:shadow-xl transition-all border border-theme"
                  >
                    <div
                      class="flex items-center justify-between mb-2 cursor-pointer bg-surface-hover p-2 rounded"
                      (click)="openBox(boxData.box.boxNumber)"
                    >
                      <div>
                        <h3 class="font-bold text-sm">{{ boxData.box.name }}</h3>
                        <span class="text-xs text-secondary">Box {{ boxData.box.boxNumber }}</span>
                      </div>
                      <span
                        class="text-xs font-medium px-2 py-1 rounded"
                        [class.bg-green-100]="boxData.ownedCount === 30"
                        [class.text-green-800]="boxData.ownedCount === 30"
                        [class.bg-blue-100]="boxData.ownedCount > 0 && boxData.ownedCount < 30"
                        [class.text-blue-800]="boxData.ownedCount > 0 && boxData.ownedCount < 30"
                        [class.bg-gray-100]="boxData.ownedCount === 0"
                        [class.text-gray-600]="boxData.ownedCount === 0"
                      >
                        {{ boxData.ownedCount }}/30
                      </span>
                    </div>

                    <div class="grid grid-cols-6 gap-1 bg-secondary rounded p-1">
                      @if (boxData.loaded) {
                        @for (slot of boxData.viewSlots; track $index) {
                          <div
                            class="hover-gradient-border bg-surface-raised rounded aspect-square flex items-center justify-center relative group cursor-pointer transition-all hover:z-10 border-2 border-transparent"
                            [class.grayscale]="!slot.isOwned"
                            [class.opacity-40]="!slot.isOwned && !slot.isDisabled"
                            [class.opacity-20]="slot.isDisabled"
                            [class.cursor-not-allowed]="slot.isDisabled"
                            [class.pointer-events-none]="slot.isDisabled"
                            [class.search-match-border]="slot.isMatched"
                            [style.--c1]="slot.colors[0] || 'transparent'"
                            [style.--c2]="slot.colors[1] || 'transparent'"
                            (click)="onSlotClick(boxData.box, $index)"
                          >
                            @if (slot.sprite) {
                              <img
                                [appTooltip]="slot.name"
                                [tooltipPosition]="'top'"
                                [src]="slot.sprite"
                                loading="lazy"
                                class="w-full h-full object-contain p-0.5 group-hover:scale-110 transition-transform"
                              />
                              <div
                                class="absolute inset-0 pointer-events-none p-[2px] flex flex-col justify-between z-10"
                              >
                                <div class="flex justify-between items-start">
                                  @if (
                                    currentQuickEditState().appearance?.showPokeball && slot.ball
                                  ) {
                                    <img
                                      [src]="getBallImage(slot.ball) | cdnUrl: 'pokeballs'"
                                      class="w-3.5 h-3.5 object-contain drop-shadow"
                                    />
                                  } @else {
                                    <div></div>
                                  }
                                  @if (
                                    currentQuickEditState().appearance?.showShiny && slot.isShiny
                                  ) {
                                    <img
                                      [src]="'shiny-stars.png' | cdnUrl: 'special_attributes'"
                                      class="w-4 h-4 object-contain drop-shadow"
                                    />
                                  }
                                </div>
                                <div class="flex justify-between items-end">
                                  @if (
                                    currentQuickEditState().appearance?.showGmax && slot.isGmax
                                  ) {
                                    <img
                                      [src]="'gigantamax.png' | cdnUrl: 'special_attributes'"
                                      class="w-4 h-4 object-contain drop-shadow"
                                    />
                                  } @else {
                                    <div></div>
                                  }
                                  @if (
                                    currentQuickEditState().appearance?.showAlpha && slot.isAlpha
                                  ) {
                                    <img
                                      [src]="'alpha.png' | cdnUrl: 'special_attributes'"
                                      class="w-4 h-4 object-contain drop-shadow"
                                    />
                                  }
                                </div>
                              </div>
                              <div
                                class="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 rounded transition-opacity pointer-events-none"
                              ></div>
                            } @else {
                              <span class="text-tertiary text-xs">?</span>
                            }
                          </div>
                        }
                      } @else {
                        @for (slot of boxData.viewSlots; track $index) {
                          <div
                            class="bg-surface-raised rounded aspect-square flex items-center justify-center relative border-2 border-transparent transition-all"
                            [class.search-match-border]="slot.isMatched"
                          >
                            <div
                              class="w-4 h-4 rounded-full animate-pulse"
                              [ngClass]="
                                slot.isMatched
                                  ? 'bg-yellow-400 opacity-100'
                                  : 'bg-tertiary opacity-30'
                              "
                            ></div>
                          </div>
                        }
                      }
                    </div>
                  </div>
                }
              </div>
            </cdk-virtual-scroll-viewport>
          }
        </main>

        @if (selectedSlotForDetail()) {
          <app-pokemon-edit-dialog
            [pokemon]="selectedSlotForDetail()!"
            [dexId]="dexId()"
            [boxNumber]="selectedBoxNumber()"
            (closed)="closeDetailDialog()"
            (saved)="onDetailSaved()"
          />
        }

        @if (selectedSlotForView()) {
          <app-pokemon-view-dialog
            [pokemon]="selectedSlotForView()!"
            [dexId]="dexId()"
            [boxNumber]="selectedBoxNumber()"
            (closed)="closeViewDialog()"
            (previous)="onGalleryPrevious()"
            (next)="onGalleryNext()"
            (edit)="onGalleryEdit()"
          />
        }
      </div>
    </div>
  `,
  styles: [
    `
      .hover-gradient-border {
        --c1: transparent;
        --c2: transparent;
      }
      .hover-gradient-border:hover {
        background-image:
          linear-gradient(var(--color-surface-raised), var(--color-surface-raised)),
          linear-gradient(to right, var(--c1), var(--c2));
        background-origin: border-box;
        background-clip: padding-box, border-box;
        border-color: transparent !important;
      }
      .search-match-border {
        border-color: #ffd700 !important;
        box-shadow: 0 0 8px rgba(255, 215, 0, 0.6) !important;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
})
export class BoxGalleryComponent implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private datasetService = inject(DatasetService);
  private typeColorService = inject(TypeColorService);
  private dexStateService = inject(DexStateService);
  private pokemonLangService = inject(PokemonLanguageService);
  public toolbarService = inject(ToolbarService);

  @ViewChildren('boxCard') boxCards!: QueryList<ElementRef>;
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  private pokemonNamesMap = new Map<string, { names: { [key: string]: string | undefined } }>();
  private searchSubject = new Subject<string>();
  private observer: IntersectionObserver | null = null;
  private loadedBoxNumbers = new Set<number>();
  placeholderSlots = new Array(30);

  matchedPokemonSlugs = signal<Set<string>>(new Set());
  selectedSlotForDetail = signal<BoxSlot | null>(null);
  selectedSlotForView = signal<BoxSlot | null>(null);
  selectedBoxNumber = signal<number>(1);
  searchQuery = signal<string>('');
  dexId = signal<string>('');
  dex = signal<Dex | undefined>(undefined);
  boxes = signal<Box[]>([]);
  boxesWithSprites = signal<BoxWithSprites[]>([]);
  loading = signal(true);
  columns = signal(this.calculateColumns(window.innerWidth));

  matchedLocations = signal<{ boxIndex: number; boxNumber: number }[]>([]);
  currentMatchIndex = signal<number>(0);

  viewBoxes = computed(() => {
    const loadedBoxes = this.boxesWithSprites();
    const searchActive = !!this.searchQuery();
    const matchedSlugs = this.matchedPokemonSlugs();
    const quickEdit = this.currentQuickEditState();
    const pendingMap = this.toolbarService.pendingEdits();

    return loadedBoxes.map((boxData) => {
      return {
        ...boxData,
        viewSlots: boxData.slots.map((slot, index) => {
          const position = slot.originalSlot?.position || index + 1;
          const key = `${boxData.box.boxNumber}_${position}`;
          const pending = pendingMap.get(key);

          const isOwned = pending && pending.isOwned !== undefined ? pending.isOwned : slot.isOwned;
          const isShiny = pending && pending.isShiny !== undefined ? pending.isShiny : slot.isShiny;
          const isGmax = pending && pending.isGmax !== undefined ? pending.isGmax : slot.isGmax;
          const isAlpha = pending && pending.isAlpha !== undefined ? pending.isAlpha : slot.isAlpha;
          const ball = pending && pending.ball !== undefined ? pending.ball : slot.ball;

          const isMatched = searchActive ? matchedSlugs.has(slot.slug) : false;

          let isDisabled = false;
          if (quickEdit.active) {
            if (quickEdit.mode === 'Gmax' && !slot.canGmax) isDisabled = true;
            if (quickEdit.mode === 'Alpha' && !slot.canBeAlpha) isDisabled = true;
          }

          return {
            ...slot,
            isOwned,
            isShiny,
            isGmax,
            isAlpha,
            ball,
            isMatched,
            isDisabled,
          };
        }),
      };
    });
  });

  viewBoxRows = computed(() => {
    const boxes = this.viewBoxes();
    const cols = this.columns();
    const rows = [];

    for (let i = 0; i < boxes.length; i += cols) {
      rows.push(boxes.slice(i, i + cols));
    }
    return rows;
  });

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
      this.performSearch(query);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.dexId.set(id);
        this.loadGalleryData(id);
      }
    });
  }

  ngAfterViewInit() {
    this.boxCards.changes.subscribe(() => {
      this.setupIntersectionObserver();
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
    this.observer?.disconnect();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.columns.set(this.calculateColumns(event.target.innerWidth));
  }

  private calculateColumns(width: number): number {
    if (width >= 1280) return 3;
    if (width >= 1024) return 2;
    return 1;
  }

  private setupIntersectionObserver() {
    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const boxNumber = parseInt(
              (entry.target as HTMLElement).getAttribute('data-box-number') || '0',
              10,
            );
            if (boxNumber > 0 && !this.loadedBoxNumbers.has(boxNumber)) {
              this.loadedBoxNumbers.add(boxNumber);
              this.loadSpritesForSingleBox(boxNumber);
              this.observer?.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: '200px' },
    );

    this.boxCards.forEach((card) => {
      this.observer!.observe(card.nativeElement);
    });
  }

  loadGalleryData(id: string) {
    this.loading.set(true);
    this.loadedBoxNumbers.clear();

    this.firestoreService
      .getDex(id)
      .pipe(take(1))
      .subscribe((dex) => {
        if (!dex) return;
        this.dex.set(dex);
        this.dexStateService.setCurrentDex(dex);
      });

    this.firestoreService
      .getDexBoxes(id)
      .pipe(
        filter((boxes) => boxes && boxes.length === 200),
        take(1),
      )
      .subscribe({
        next: (boxes) => {
          if (!boxes) {
            this.loading.set(false);
            return;
          }
          const sorted = boxes.sort((a, b) => a.boxNumber - b.boxNumber);
          this.boxes.set(sorted);
          this.prepareBoxShells(sorted);
        },
        error: (err) => {
          console.error('Failed to load boxes', err);
          this.loading.set(false);
        },
      });
  }

  private prepareBoxShells(boxes: Box[]) {
    const shells: BoxWithSprites[] = boxes.map((box) => {
      const rawSlots = Array.isArray(box.slots) ? box.slots : Object.values(box.slots || []);

      const slots = new Array(30).fill(null).map((_, i) => {
        const originalSlot = rawSlots[i] as BoxSlot;

        return {
          originalSlot: originalSlot || null,
          sprite: '',
          name: '',
          colors: [],
          slug: originalSlot?.pokemonSlug || '',
          canGmax: false,
          canBeAlpha: false,
          isShiny: false,
          isGmax: false,
          isAlpha: false,
          isOwned: originalSlot.isOwned,
        };
      });

      return { box, slots, ownedCount: this.calculateOwnedCount(box), loaded: false };
    });
    this.boxesWithSprites.set(shells);
    this.loading.set(false);
  }

  private calculateOwnedCount(box: Box): number {
    return (Array.isArray(box.slots) ? box.slots : Object.values(box.slots || {})).filter(
      (s: any) => s.isOwned,
    ).length;
  }

  private loadSpritesForSingleBox(boxNumber: number) {
    const allBoxes = this.boxesWithSprites();
    const boxIndex = allBoxes.findIndex((b) => b.box.boxNumber === boxNumber);
    if (boxIndex === -1) return;

    const boxData = allBoxes[boxIndex];
    const rawSlots = Array.isArray(boxData.box.slots)
      ? boxData.box.slots
      : Object.values(boxData.box.slots || []);

    const enrichedSlots: EnrichedSlot[] = [...boxData.slots];

    let pending = 0;
    rawSlots.forEach((slot: any, index: number) => {
      if (slot && slot.pokemonSlug) {
        pending++;
        this.datasetService.loadPokemonBySlug(slot.pokemonSlug).subscribe({
          next: (pokemon) => {
            const pTypes = [pokemon.type1, pokemon.type2].filter((t) => !!t) as string[];
            let colors: string[] = [];
            if (pTypes.length > 0) {
              const c1 = this.typeColorService.getTypeColor(pTypes[0]);
              const c2 = pTypes.length > 1 ? this.typeColorService.getTypeColor(pTypes[1]) : c1;
              colors = [c1, c2];
            }

            enrichedSlots[index] = {
              originalSlot: slot,
              sprite: this.datasetService.getSpriteUrl(pokemon, slot.isShiny),
              name: `${this.pokemonLangService.getName(pokemon)} - #${pokemon.nid} - Slot ${slot.position || index + 1}`,
              colors: colors,
              slug: slot.pokemonSlug,
              canGmax: !!(pokemon.canGmax || pokemon.isGmax),
              canBeAlpha: !!pokemon.canBeAlpha,
              isShiny: !!slot.isShiny,
              isGmax: !!slot.isGmax,
              isAlpha: !!slot.isAlpha,
              ball: slot.ball,
              isOwned: slot.isOwned,
            };

            this.pokemonNamesMap.set(slot.pokemonSlug, { names: pokemon.names });

            pending--;
            if (pending <= 0) {
              this.updateBoxData(boxIndex, enrichedSlots);
            }
          },
          error: () => {
            pending--;
            if (pending <= 0) {
              this.updateBoxData(boxIndex, enrichedSlots);
            }
          },
        });
      }
    });

    if (pending === 0) {
      this.updateBoxData(boxIndex, enrichedSlots);
    }
  }

  private updateBoxData(boxIndex: number, slots: EnrichedSlot[]) {
    const allBoxes = [...this.boxesWithSprites()];
    allBoxes[boxIndex] = {
      ...allBoxes[boxIndex],
      slots,
      loaded: true,
    };
    this.boxesWithSprites.set(allBoxes);
  }

  private reloadSingleBox(boxNumber: number) {
    this.firestoreService.getDexBox(this.dexId(), boxNumber).subscribe({
      next: (box) => {
        if (!box) return;

        const allBoxes = [...this.boxesWithSprites()];
        const boxIndex = allBoxes.findIndex((boxData) => boxData.box.boxNumber === boxNumber);
        if (boxIndex === -1) return;

        const rawSlots = Array.isArray(box.slots) ? box.slots : Object.values(box.slots || []);

        const newSlots = new Array(30).fill(null).map((_, i) => {
          const originalSlot = rawSlots[i] as BoxSlot;
          return {
            originalSlot: originalSlot || null,
            sprite: '',
            name: '',
            colors: [],
            slug: originalSlot?.pokemonSlug || '',
            canGmax: false,
            canBeAlpha: false,
            isShiny: false,
            isGmax: false,
            isAlpha: false,
            isOwned: originalSlot.isOwned,
          };
        });

        allBoxes[boxIndex] = {
          ...allBoxes[boxIndex],
          box,
          ownedCount: this.calculateOwnedCount(box),
          loaded: false,
          slots: newSlots,
        };
        this.boxesWithSprites.set(allBoxes);

        const currentBoxes = [...this.boxes()];
        const bi = currentBoxes.findIndex((b) => b.boxNumber === boxNumber);
        if (bi !== -1) {
          currentBoxes[bi] = box;
          this.boxes.set(currentBoxes);
        }

        this.loadedBoxNumbers.delete(boxNumber);
        this.loadedBoxNumbers.add(boxNumber);
        this.loadSpritesForSingleBox(boxNumber);
      },
    });
  }

  currentQuickEditState = signal<QuickEditState>({ active: false, mode: 'None' });

  onQuickEditModeChanged(state: QuickEditState) {
    this.currentQuickEditState.set(state);
  }

  async onSlotClick(box: Box, slotIndex: number) {
    const slots = Array.isArray(box.slots) ? box.slots : Object.values(box.slots || []);
    const slot = slots[slotIndex] as BoxSlot;

    if (!slot) return;

    const quickEditState = this.currentQuickEditState();

    if (quickEditState.active && quickEditState.mode !== 'None') {
      if (quickEditState.mode === 'Edit') {
        this.selectedSlotForDetail.set(slot);
        this.selectedBoxNumber.set(box.boxNumber);
        return;
      }

      this.toolbarService.processToolClick(box.boxNumber, slot, quickEditState);
    } else {
      this.selectedSlotForView.set(slot);
      this.selectedBoxNumber.set(box.boxNumber);
    }
  }

  async saveAllEdits() {
    try {
      const updatedBoxes = await this.toolbarService.saveAllEdits(this.dexId());

      updatedBoxes.forEach((boxNum) => this.reloadSingleBox(boxNum));
    } catch (e) {
      console.error('Error saving edits', e);
    }
  }

  discardAllEdits() {
    this.toolbarService.discardAllEdits();
  }

  closeDetailDialog() {
    this.selectedSlotForDetail.set(null);
  }

  closeViewDialog() {
    this.selectedSlotForView.set(null);
  }

  onGalleryPrevious() {
    const currentSlot = this.selectedSlotForView();
    let boxNum = this.selectedBoxNumber();
    if (!currentSlot || !boxNum) return;

    let newPos = currentSlot.position - 1;
    if (newPos < 1) {
      newPos = 30;
      boxNum -= 1;
      if (boxNum < 1) boxNum = 200;
      this.selectedBoxNumber.set(boxNum);
    }

    const boxState = this.boxesWithSprites().find((b) => b.box.boxNumber === boxNum);
    if (!boxState) return;

    const slots = Array.isArray(boxState.box.slots)
      ? boxState.box.slots
      : Object.values(boxState.box.slots || []);
    const prevSlot = slots.find((s: any) => s.position === newPos);

    if (prevSlot) this.selectedSlotForView.set(prevSlot as BoxSlot);
  }

  onGalleryNext() {
    const currentSlot = this.selectedSlotForView();
    let boxNum = this.selectedBoxNumber();
    if (!currentSlot || !boxNum) return;

    let newPos = currentSlot.position + 1;
    if (newPos > 30) {
      newPos = 1;
      boxNum += 1;
      if (boxNum > 200) boxNum = 1;
      this.selectedBoxNumber.set(boxNum);
    }

    const boxState = this.boxesWithSprites().find((b) => b.box.boxNumber === boxNum);
    if (!boxState) return;

    const slots = Array.isArray(boxState.box.slots)
      ? boxState.box.slots
      : Object.values(boxState.box.slots || []);
    const nextSlot = slots.find((s: any) => s.position === newPos);

    if (nextSlot) this.selectedSlotForView.set(nextSlot as BoxSlot);
  }

  onGalleryEdit() {
    const slot = this.selectedSlotForView();
    if (slot) {
      this.selectedSlotForDetail.set(slot);
      this.selectedSlotForView.set(null);
    }
  }

  onDetailSaved() {
    const boxNumber = this.selectedBoxNumber();
    this.selectedSlotForDetail.set(null);
    this.reloadSingleBox(boxNumber);
  }

  openBox(boxNumber: number) {
    this.router.navigate(['/dex', this.dexId(), 'box', boxNumber]);
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  private performSearch(query: string) {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      this.matchedPokemonSlugs.set(new Set());
      this.matchedLocations.set([]);
      return;
    }

    const matches = new Set<string>();

    this.boxesWithSprites().forEach((boxData) => {
      boxData.slots.forEach((slot) => {
        const original = slot.originalSlot;
        if (original && original.pokemonSlug) {
          const slug = original.pokemonSlug.toLowerCase();
          const cleanSlug = slug.replace(/-/g, ' ');
          const customName = original.customName?.toLowerCase() || '';

          if (
            slug.includes(lowerQuery) ||
            cleanSlug.includes(lowerQuery) ||
            customName.includes(lowerQuery)
          ) {
            matches.add(original.pokemonSlug);
          }
        }
      });
    });

    this.pokemonNamesMap.forEach((data, slug) => {
      const nameValues = Object.values(data.names).filter((name): name is string => !!name);
      for (const name of nameValues) {
        if (name.toLowerCase().includes(lowerQuery)) {
          matches.add(slug);
          break;
        }
      }
    });

    this.matchedPokemonSlugs.set(matches);

    const locations: { boxIndex: number; boxNumber: number }[] = [];
    this.boxesWithSprites().forEach((boxData, bIndex) => {
      boxData.slots.forEach((slot) => {
        if (slot.slug && matches.has(slot.slug)) {
          locations.push({ boxIndex: bIndex, boxNumber: boxData.box.boxNumber });
        }
      });
    });
    this.matchedLocations.set(locations);
    this.currentMatchIndex.set(0);
  }

  jumpToNextMatch() {
    const locations = this.matchedLocations();
    if (locations.length === 0) return;

    let current = this.currentMatchIndex();
    current = (current + 1) % locations.length;
    this.currentMatchIndex.set(current);

    const target = locations[current];
    const rowIndex = Math.floor(target.boxIndex / this.columns());

    this.viewport.scrollToIndex(rowIndex, 'smooth');
  }

  clearSearch() {
    this.searchQuery.set('');
    this.matchedPokemonSlugs.set(new Set());
  }

  getBallImage(ballId: string): string {
    return AVAILABLE_SPRITES.pokeballs.has(ballId) ? `${ballId}.png` : 'poke-ball.png';
  }
}
