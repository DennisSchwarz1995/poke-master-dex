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
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';
import { ToolbarService } from '../../../core/services/toolbar.service';

export interface EnrichedSlot {
  originalSlot: BoxSlot | null;
  sprite: string;
  spriteId: string;
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
  templateUrl: 'box-gallery.component.html',
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
            sprite: slot.spriteId
              ? this.datasetService.getSpriteUrl(
                  { id: slot.slug, refs: { pkApiId: slot.spriteId } } as any,
                  isShiny,
                )
              : slot.sprite,
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
          spriteId: '',
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

            const isFormDex = this.dex()?.type === 'form';
            const formLabel = this.pokemonLangService.getFormLabel(pokemon, !isFormDex);
            const displayName = formLabel
              ? `${this.pokemonLangService.getName(pokemon)} (${formLabel})`
              : this.pokemonLangService.getName(pokemon);

            enrichedSlots[index] = {
              originalSlot: slot,
              sprite: this.datasetService.getSpriteUrl(pokemon, slot.isShiny),
              spriteId: pokemon.refs.pkApiId,
              name: `${displayName} - #${pokemon.nid.slice(0, 4)} - Slot ${slot.position || index + 1}`,
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
            spriteId: '',
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
    return AVAILABLE_SPRITES.pokeballs.has(ballId) ? `${ballId}.webp` : 'pokeball.webp';
  }
}
