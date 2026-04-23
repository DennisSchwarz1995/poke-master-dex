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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, filter } from 'rxjs/operators';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { TypeColorService } from '../../../core/services/type-color.service';
import { DexStateService } from '../../../core/services/dex-state.service';
import { PokemonDetailDialogComponent } from '../pokemon-edit-dialog/pokemon-edit-dialog.component';
import { PokemonViewDialogComponent } from '../pokemon-view-dialog/pokemon-view-dialog.component';
import { Dex, Box, BoxSlot } from '../../../shared/models/dex.model';
import {
  QuickEditBarComponent,
  QuickEditState,
} from '../../../shared/components/quick-edit-bar/quick-edit-bar.component';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';

interface BoxWithSprites {
  box: Box;
  sprites: string[];
  names: string[];
  types: string[][];
  colors: string[][];
  slugs: string[];
  canGmax: boolean[];
  canBeAlpha: boolean[];
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
    PokemonDetailDialogComponent,
    PokemonViewDialogComponent,
    QuickEditBarComponent,
    RouterLink,
    TooltipDirective,
  ],
  template: `
    <div class="min-h-screen bg-secondary">
      <div class="container mx-auto px-4 pt-6 pb-2">
        <nav class="flex items-center justify-start gap-4">
          <a
            routerLink="/pokedex"
            class="flex items-center gap-2 text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme px-3 py-1.5 rounded-xl border border-theme hover:shadow-sm"
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

        <app-quick-edit-bar (modeChanged)="onQuickEditModeChanged($event)" />

        <div class="max-w-2xl mx-auto">
          <div class="relative">
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
                class="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
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
          @if (searchQuery() && matchedPokemonSlugs().size > 0) {
            <p class="text-sm text-secondary mt-2 text-center">
              {{ matchedPokemonSlugs().size }} Pokémon found
            </p>
          }
          @if (searchQuery() && matchedPokemonSlugs().size === 0) {
            <p class="text-sm mt-2 text-center" style="color: var(--color-error);">
              No Pokémon found
            </p>
          }
        </div>
      </div>
      <main class="container mx-auto px-4 py-4 flex flex-col pt-0 gap-4">
        @if (loading()) {
          <div class="text-center py-12">
            <div
              class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"
            ></div>
            <p class="text-secondary">Loading Gallery...</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (boxData of boxesWithSprites(); track boxData.box.boxNumber) {
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

                <div class="grid grid-cols-6 gap-0.5 bg-secondary rounded p-1">
                  @if (boxData.loaded) {
                    @for (sprite of boxData.sprites; track $index) {
                      <div
                        class="hover-gradient-border bg-surface-raised rounded aspect-square flex items-center justify-center relative group cursor-pointer transition-all hover:z-10 border-2 border-transparent"
                        [class.grayscale]="!boxData.box.slots[$index]?.isOwned"
                        [class.opacity-40]="
                          !boxData.box.slots[$index]?.isOwned && !isSlotDisabled(boxData, $index)
                        "
                        [class.opacity-20]="isSlotDisabled(boxData, $index)"
                        [class.cursor-not-allowed]="isSlotDisabled(boxData, $index)"
                        [class.pointer-events-none]="isSlotDisabled(boxData, $index)"
                        [class.search-match-border]="
                          searchQuery() && matchedPokemonSlugs().has(boxData.slugs[$index])
                        "
                        [style.--c1]="boxData.colors[$index]?.[0] || 'transparent'"
                        [style.--c2]="boxData.colors[$index]?.[1] || 'transparent'"
                        (click)="onPokemonClick(boxData.box, $index)"
                      >
                        @if (sprite) {
                          <img
                            [appTooltip]="boxData.names[$index] || ''"
                            [tooltipPosition]="'top'"
                            [src]="sprite"
                            class="w-full h-full object-contain p-0.5 group-hover:scale-110 transition-transform"
                          />
                          <div
                            class="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 rounded transition-opacity pointer-events-none"
                          ></div>
                        } @else {
                          <span class="text-tertiary text-xs">?</span>
                        }
                      </div>
                    }
                  } @else {
                    @for (i of placeholderSlots; track $index) {
                      <div
                        class="bg-surface-raised rounded aspect-square flex items-center justify-center"
                      >
                        <div
                          class="w-4 h-4 rounded-full bg-tertiary animate-pulse opacity-30"
                        ></div>
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>
        }
      </main>

      @if (selectedSlotForDetail()) {
        <app-pokemon-detail-dialog
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

  @ViewChildren('boxCard') boxCards!: QueryList<ElementRef>;

  dexId = signal<string>('');
  dex = signal<Dex | undefined>(undefined);
  boxes = signal<Box[]>([]);
  boxesWithSprites = signal<BoxWithSprites[]>([]);
  loading = signal(true);

  selectedSlotForDetail = signal<BoxSlot | null>(null);
  selectedSlotForView = signal<BoxSlot | null>(null);
  selectedBoxNumber = signal<number>(1);
  searchQuery = signal<string>('');
  matchedPokemonSlugs = signal<Set<string>>(new Set());
  private pokemonNamesMap = new Map<string, { names: { [key: string]: string | undefined } }>();
  private searchSubject = new Subject<string>();
  private observer: IntersectionObserver | null = null;
  private loadedBoxNumbers = new Set<number>();

  placeholderSlots = new Array(30);

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
    const shells: BoxWithSprites[] = boxes.map((box) => ({
      box,
      sprites: new Array(30).fill(''),
      names: new Array(30).fill(''),
      types: new Array(30).fill([]),
      colors: new Array(30).fill([]),
      slugs: new Array(30).fill(''),
      canGmax: new Array(30).fill(false),
      canBeAlpha: new Array(30).fill(false),
      ownedCount: this.calculateOwnedCount(box),
      loaded: false,
    }));

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
    const slots = Array.isArray(boxData.box.slots)
      ? boxData.box.slots
      : Object.values(boxData.box.slots || []);

    const sprites: string[] = new Array(30).fill('');
    const names: string[] = new Array(30).fill('');
    const types: string[][] = new Array(30).fill([]);
    const colors: string[][] = new Array(30).fill([]);
    const slugs: string[] = new Array(30).fill('');
    const canGmax: boolean[] = new Array(30).fill(false);
    const canBeAlpha: boolean[] = new Array(30).fill(false);

    let pending = 0;
    slots.forEach((slot: any, index: number) => {
      if (slot.pokemonSlug) {
        pending++;
        this.datasetService.loadPokemonBySlug(slot.pokemonSlug).subscribe({
          next: (pokemon) => {
            sprites[index] = this.datasetService.getSpriteUrl(pokemon, slot.isShiny);
            const pokemonName = this.pokemonLangService.getName(pokemon);
            const position = slot.position || index + 1;
            names[index] = `${pokemonName} - #${pokemon.nid} - Slot ${position}`;

            const pTypes = [pokemon.type1, pokemon.type2].filter((t) => !!t) as string[];
            types[index] = pTypes;

            if (pTypes.length > 0) {
              const c1 = this.typeColorService.getTypeColor(pTypes[0]);
              const c2 = pTypes.length > 1 ? this.typeColorService.getTypeColor(pTypes[1]) : c1;
              colors[index] = [c1, c2];
            }

            slugs[index] = slot.pokemonSlug;
            canGmax[index] = !!(pokemon.canGmax || pokemon.isGmax);
            canBeAlpha[index] = !!pokemon.canBeAlpha;
            this.pokemonNamesMap.set(slot.pokemonSlug, { names: pokemon.names });

            pending--;
            if (pending <= 0) {
              this.updateBoxData(
                boxIndex,
                sprites,
                names,
                types,
                colors,
                slugs,
                canGmax,
                canBeAlpha,
                true,
              );
            }
          },
          error: () => {
            pending--;
            if (pending <= 0) {
              this.updateBoxData(
                boxIndex,
                sprites,
                names,
                types,
                colors,
                slugs,
                canGmax,
                canBeAlpha,
                true,
              );
            }
          },
        });
      }
    });

    // If no pokemon in this box at all, mark as loaded immediately
    if (pending === 0) {
      this.updateBoxData(boxIndex, sprites, names, types, colors, slugs, canGmax, canBeAlpha, true);
    }
  }

  private updateBoxData(
    boxIndex: number,
    sprites: string[],
    names: string[],
    types: string[][],
    colors: string[][],
    slugs: string[],
    canGmax: boolean[],
    canBeAlpha: boolean[],
    loaded: boolean,
  ) {
    const allBoxes = [...this.boxesWithSprites()];
    allBoxes[boxIndex] = {
      ...allBoxes[boxIndex],
      sprites,
      names,
      types,
      colors,
      slugs,
      canGmax,
      canBeAlpha,
      loaded,
    };
    this.boxesWithSprites.set(allBoxes);
  }

  /** Reload only the single box that was edited */
  private reloadSingleBox(boxNumber: number) {
    this.firestoreService.getDexBox(this.dexId(), boxNumber).subscribe({
      next: (box) => {
        if (!box) return;

        const allBoxes = [...this.boxesWithSprites()];
        const boxIndex = allBoxes.findIndex((b) => b.box.boxNumber === boxNumber);
        if (boxIndex === -1) return;

        allBoxes[boxIndex] = {
          ...allBoxes[boxIndex],
          box,
          ownedCount: this.calculateOwnedCount(box),
          loaded: false,
        };
        this.boxesWithSprites.set(allBoxes);

        // Also update the boxes signal
        const currentBoxes = [...this.boxes()];
        const bi = currentBoxes.findIndex((b) => b.boxNumber === boxNumber);
        if (bi !== -1) {
          currentBoxes[bi] = box;
          this.boxes.set(currentBoxes);
        }

        // Allow re-observation and reload sprites
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

  async onPokemonClick(box: Box, slotIndex: number) {
    const slots = Array.isArray(box.slots) ? box.slots : Object.values(box.slots || []);
    const slot = slots[slotIndex] as any;

    if (!slot) return;

    if (this.currentQuickEditState().active && this.currentQuickEditState().mode !== 'None') {
      const mode = this.currentQuickEditState().mode;
      const updates: any = {};

      if (mode === 'Edit') {
        this.selectedSlotForDetail.set(slot as BoxSlot);
        this.selectedBoxNumber.set(box.boxNumber);
        return;
      }

      if (mode === 'Owned') updates.isOwned = !slot.isOwned; // Toggle
      if (mode === 'Pokeball' && this.currentQuickEditState().ball) {
        updates.ball = this.currentQuickEditState().ball;
        // Optional: also set isOwned to true?
        // updates.isOwned = true;
      }
      if (mode === 'Shiny') updates.isShiny = !slot.isShiny;
      if (mode === 'Gmax') updates.isGmax = !slot.isGmax;
      if (mode === 'Alpha') updates.isAlpha = !slot.isAlpha;
      if (mode === 'Trainer' && this.currentQuickEditState().trainerId) {
        updates.trainerId = this.currentQuickEditState().trainerId;
        updates.originalTrainer = this.currentQuickEditState().originalTrainer;
      }

      await this.firestoreService.updateSlot(this.dexId(), box.boxNumber, slot.position, updates);
      this.reloadSingleBox(box.boxNumber);
    } else {
      this.selectedSlotForView.set(slot as BoxSlot);
      this.selectedBoxNumber.set(box.boxNumber);
    }
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
      return;
    }

    const matches = new Set<string>();

    this.pokemonNamesMap.forEach((data, slug) => {
      const names = data.names;
      const nameValues = Object.values(names).filter((name): name is string => !!name);

      for (const name of nameValues) {
        if (name.toLowerCase().includes(lowerQuery)) {
          matches.add(slug);
          break;
        }
      }
    });

    this.matchedPokemonSlugs.set(matches);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.matchedPokemonSlugs.set(new Set());
  }

  isSlotDisabled(boxData: BoxWithSprites, index: number): boolean {
    if (!this.currentQuickEditState().active) return false;
    const mode = this.currentQuickEditState().mode;
    if (mode === 'Gmax' && !boxData.canGmax[index]) return true;
    if (mode === 'Alpha' && !boxData.canBeAlpha[index]) return true;
    return false;
  }
}
