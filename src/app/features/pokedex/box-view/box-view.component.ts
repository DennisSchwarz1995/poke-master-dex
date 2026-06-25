import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { ThemeService } from '../../../core/services/theme.service';
import { DexStateService } from '../../../core/services/dex-state.service';
import { PokemonSpriteComponent } from '../../../shared/components/pokemon-sprite/pokemon-sprite.component';
import { PokemonEditDialogComponent } from '../pokemon-edit-dialog/pokemon-edit-dialog.component';
import { PokemonViewDialogComponent } from '../pokemon-view-dialog/pokemon-view-dialog.component';
import {
  BoxOptionsDialogComponent,
  AutoFillOption,
} from '../box-options-dialog/box-options-dialog.component';
import { Box, BoxSlot, Dex } from '../../../shared/models/dex.model';
import { firstValueFrom } from 'rxjs';
import {
  QuickEditState,
  ToolbarComponent,
} from '../../../shared/components/toolbar/toolbar.component';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { RouterLink } from '@angular/router';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';
import { ToolbarService } from '../../../core/services/toolbar.service';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';

@Component({
  selector: 'app-box-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PokemonSpriteComponent,
    PokemonEditDialogComponent,
    BoxOptionsDialogComponent,
    PokemonViewDialogComponent,
    ToolbarComponent,
    RouterLink,
    TooltipDirective,
    CdnUrlPipe,
  ],
  template: `
    <div class="min-h-[calc(100vh-16rem)] bg-secondary flex flex-col">
      <main class="container mx-auto px-4 flex-1 flex flex-col pt-6 gap-4">
        <app-toolbar
          (modeChanged)="onQuickEditModeChanged($event)"
          [pendingEditsCount]="this.toolbarService.pendingEdits().size"
          [isSaving]="this.toolbarService.isSavingBatch()"
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
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full xs:max-w-xs sm:max-w-sm md:max-w-md z-0 px-2"
          ></div>
        </app-toolbar>
        @if (!box() && loading()) {
          <div class="text-center py-12">
            <div
              class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"
            ></div>
          </div>
        } @else if (box(); as currentBoxData) {
          <div
            class="bg-surface rounded-xl shadow-lg p-6 flex-1 flex flex-col border border-theme mt-2 transition-opacity duration-300"
            [class.opacity-50]="loading()"
            [class.pointer-events-none]="loading()"
          >
            <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div class="flex items-center justify-center md:justify-start gap-2 overflow-hidden">
                <h2
                  class="text-xl sm:text-2xl font-bold truncate"
                  [appTooltip]="currentBoxData.name"
                  tooltipPosition="top"
                >
                  {{ currentBoxData.name }}
                </h2>
              </div>

              <div class="flex items-center justify-center gap-2 sm:gap-4 order-last md:order-none">
                <button
                  (click)="onPreviousBox()"
                  class="px-2 sm:px-4 py-1 sm:py-2 bg-secondary rounded hover:bg-surface-hover transition-colors font-bold text-lg"
                  [appTooltip]="'Previous Box'"
                  tooltipPosition="top"
                >
                  ←
                </button>
                <div
                  class="px-3 font-bold text-sm sm:text-base text-center whitespace-nowrap text-text-primary"
                >
                  Box {{ currentBox() }} / 200
                </div>
                <button
                  (click)="onNextBox()"
                  class="px-2 sm:px-4 py-1 sm:py-2 bg-secondary rounded hover:bg-surface-hover transition-colors font-bold text-lg"
                  [appTooltip]="'Next Box'"
                  tooltipPosition="top"
                >
                  →
                </button>
              </div>

              <div class="flex items-center justify-center md:justify-end gap-4">
                <div class="text-sm text-secondary whitespace-nowrap">
                  {{ getOwnedCount() }} / 30 owned
                </div>
                <button
                  (click)="showOptionsDialog.set(true)"
                  class="text-tertiary hover:text-blue-500 px-2 flex items-center justify-center transition-colors"
                  title="Box Options"
                >
                  <img
                    [src]="
                      (themeService.currentTheme() === 'dark'
                        ? 'options-white.png'
                        : 'options-black.png'
                      ) | cdnUrl: 'icons'
                    "
                    class="w-5 h-5 opacity-70 hover:opacity-100"
                    alt="Options"
                  />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-6 gap-2 content-start">
              @for (slot of slots(); track slot.position) {
                <app-pokemon-sprite
                  (click)="onSlotClick(slot)"
                  [pokemonSlug]="slot.pokemonSlug"
                  [isOwned]="slot.isOwned"
                  [isShiny]="slot.isShiny || false"
                  [isGmax]="slot.isGmax || false"
                  [isAlpha]="slot.isAlpha || false"
                  [ball]="slot.ball"
                  [showShinyIcon]="currentQuickEditState().appearance?.showShiny || false"
                  [showGmaxIcon]="currentQuickEditState().appearance?.showGmax || false"
                  [showAlphaIcon]="currentQuickEditState().appearance?.showAlpha || false"
                  [showPokeballIcon]="currentQuickEditState().appearance?.showPokeball || false"
                  [hideDefaultFormLabel]="dex()?.type !== 'form'"
                />
              }
            </div>
          </div>
        }
      </main>
    </div>

    @if (showDetailDialog() && selectedSlot()) {
      <app-pokemon-edit-dialog
        [pokemon]="selectedSlot()!"
        [dexId]="dexId()"
        [boxNumber]="currentBox()"
        (closed)="closeDetailDialog()"
        (saved)="onDetailSaved()"
      />
    }

    @if (showViewDialog() && selectedSlot()) {
      <app-pokemon-view-dialog
        [pokemon]="selectedSlot()!"
        [dexId]="dexId()"
        [boxNumber]="currentBox()"
        (closed)="closeViewDialog()"
        (previous)="onViewPrevious()"
        (next)="onViewNext()"
        (edit)="onViewEdit()"
      />
    }

    @if (showOptionsDialog()) {
      <app-box-options-dialog
        [currentName]="box()?.name || ''"
        [boxNumber]="currentBox()"
        [dexType]="dex()?.type || 'STANDARD'"
        [startBox]="dex()?.startBox || 1"
        [autoFillOptions]="autoFillOptions()"
        (closed)="showOptionsDialog.set(false)"
        (nameSaved)="onBoxNameSavedFromDialog($event)"
        (autoFillRequested)="onAutoFillRequested($event)"
        (emptyBoxRequested)="onEmptyBoxRequested()"
        (removeAllRequested)="onRemoveAllRequested()"
      />
    }
  `,
  styles: [],
})
export class BoxViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private datasetService = inject(DatasetService);
  private dexStateService = inject(DexStateService);
  toolbarService = inject(ToolbarService);
  themeService = inject(ThemeService);
  private pokemonLangService = inject(PokemonLanguageService);

  dexId = signal('');
  currentBox = signal(1);
  box = signal<Box | null>(null);
  slots = signal<BoxSlot[]>([]);
  dex = signal<Dex | null>(null);
  loading = signal(true);
  showDetailDialog = signal(false);
  showViewDialog = signal(false);
  selectedSlot = signal<BoxSlot | null>(null);
  showOptionsDialog = signal(false);
  autoFillOptions = signal<AutoFillOption[]>([]);
  pendingSelectPosition: number | null = null;

  onPreviousBox() {
    const prevBox = this.currentBox() === 1 ? 200 : this.currentBox() - 1;
    this.router.navigate(['/dex', this.dexId(), 'box', prevBox]);
  }

  onNextBox() {
    const nextBox = this.currentBox() === 200 ? 1 : this.currentBox() + 1;
    this.router.navigate(['/dex', this.dexId(), 'box', nextBox]);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      const boxNum = params.get('boxNum');

      if (id) {
        this.dexId.set(id);
        this.loadDexInfo(id);
      }

      if (boxNum && id) {
        const num = parseInt(boxNum, 10);
        if (num >= 1 && num <= 200) {
          this.currentBox.set(num);
          this.loadBox(id, num);
        }
      }
    });
  }

  loadDexInfo(dexId: string) {
    this.firestoreService.getDex(dexId).subscribe((dexData: Dex) => {
      if (!dexData) return;
      this.dex.set(dexData);
      this.dexStateService.setCurrentDex(dexData);
      this.generateAutoFillOptions(dexData);
    });
  }

  loadBox(dexId: string, boxNum: number) {
    this.loading.set(true);
    this.firestoreService.getBox(dexId, boxNum).subscribe({
      next: (boxData) => {
        if (!boxData) {
          this.loading.set(false);
          return;
        }
        const slots = Array.isArray(boxData.slots)
          ? boxData.slots
          : (Object.values(boxData.slots || {}) as BoxSlot[]);
        const sortedSlots = slots.sort((a, b) => a.position - b.position);

        this.box.set(boxData);
        this.slots.set(sortedSlots);
        this.loading.set(false);

        if (this.pendingSelectPosition !== null) {
          const target = sortedSlots.find((s) => s.position === this.pendingSelectPosition);
          if (target) this.selectedSlot.set(target);
          this.pendingSelectPosition = null;
        }
      },
      error: (err) => {
        console.error('Failed to load box:', err);
        this.loading.set(false);
      },
    });
  }

  currentQuickEditState = signal<QuickEditState>({ active: false, mode: 'None' });

  onQuickEditModeChanged(state: QuickEditState) {
    this.currentQuickEditState.set(state);
  }

  async onSlotClick(slot: BoxSlot) {
    const quickEditState = this.currentQuickEditState();

    if (quickEditState.active && quickEditState.mode !== 'None') {
      if (quickEditState.mode === 'Edit') {
        this.selectedSlot.set(slot);
        this.showDetailDialog.set(true);
        return;
      }

      const updates = this.toolbarService.processToolClick(this.currentBox(), slot, quickEditState);

      const currentSlots = [...this.slots()];
      const slotIndex = currentSlots.findIndex((s) => s.position === slot.position);
      if (slotIndex !== -1) {
        currentSlots[slotIndex] = { ...slot, ...updates };
        this.slots.set(currentSlots);
      }
    } else {
      this.selectedSlot.set(slot);
      this.showViewDialog.set(true);
    }
  }

  async saveAllEdits() {
    try {
      const updatedBoxes = await this.toolbarService.saveAllEdits(this.dexId());

      if (updatedBoxes.includes(this.currentBox())) {
        this.loadBox(this.dexId(), this.currentBox());
      }
    } catch (e) {
      console.log(e);
    }
  }

  discardAllEdits() {
    this.toolbarService.discardAllEdits();
    this.loadBox(this.dexId(), this.currentBox());
  }

  closeDetailDialog() {
    this.showDetailDialog.set(false);
    this.selectedSlot.set(null);
  }

  closeViewDialog() {
    this.showViewDialog.set(false);
    this.selectedSlot.set(null);
  }

  onViewPrevious() {
    const current = this.selectedSlot();
    if (!current) return;
    let newPos = current.position - 1;
    if (newPos < 1) {
      this.pendingSelectPosition = 30;
      let newBoxNum = this.currentBox() - 1;
      if (newBoxNum < 1) newBoxNum = 200;
      this.router.navigate(['/dex', this.dexId(), 'box', newBoxNum]);
      return;
    }
    const prevSlot = this.slots().find((s) => s.position === newPos);
    if (prevSlot) this.selectedSlot.set(prevSlot);
  }

  onViewNext() {
    const current = this.selectedSlot();
    if (!current) return;
    let newPos = current.position + 1;
    if (newPos > 30) {
      this.pendingSelectPosition = 1;
      let newBoxNum = this.currentBox() + 1;
      if (newBoxNum > 200) newBoxNum = 1;
      this.router.navigate(['/dex', this.dexId(), 'box', newBoxNum]);
      return;
    }
    const nextSlot = this.slots().find((s) => s.position === newPos);
    if (nextSlot) this.selectedSlot.set(nextSlot);
  }

  onViewEdit() {
    this.showViewDialog.set(false);
    this.showDetailDialog.set(true);
  }

  onDetailSaved() {
    this.loadBox(this.dexId(), this.currentBox());
  }

  getOwnedCount(): number {
    const slotsArray = this.slots();
    return slotsArray.filter((s) => s.isOwned).length;
  }

  async onDexNameSaved(newName: string) {
    try {
      await this.firestoreService.updateDexName(this.dexId(), newName);

      const currentDex = this.dex();
      if (currentDex) {
        this.dex.set({ ...currentDex, name: newName });
      }
    } catch (err) {
      console.error('Failed to update Dex name:', err);
    }
  }

  async onBoxNameSavedFromDialog(newName: string) {
    this.showOptionsDialog.set(false);

    try {
      await this.firestoreService.updateBoxName(this.dexId(), this.currentBox(), newName);
      this.loadBox(this.dexId(), this.currentBox());
    } catch (err) {
      console.error('Failed to rename box:', err);
    }
  }

  async generateAutoFillOptions(currentDex: Dex) {
    try {
      const mapping = await firstValueFrom(this.datasetService.createDexMapping(currentDex.type));

      const options: AutoFillOption[] = [];
      const totalPokemon = mapping.length;
      const pokemonPerBox = 30;
      const neededBoxes = Math.ceil(totalPokemon / pokemonPerBox);

      // Get localized names from SimplePokemon map
      const basePokemonList = await firstValueFrom(this.datasetService.getSimplePokemonList());
      const nameMap = new Map<string, string>();
      const lang = this.pokemonLangService.currentLang();
      basePokemonList.forEach((p) => {
        nameMap.set(p.slug, p.allNames?.[lang] || p.name);
      });

      for (let offset = 0; offset < neededBoxes; offset++) {
        const startIndex = offset * pokemonPerBox;
        const endIndex = Math.min(startIndex + pokemonPerBox - 1, totalPokemon - 1);

        const chunk = mapping.slice(startIndex, endIndex + 1).filter((p) => p !== null);
        if (chunk.length === 0) continue;

        const firstPoke = chunk[0]!;
        const lastPoke = chunk[chunk.length - 1]!;

        const numStart = String(firstPoke.dexNum).padStart(4, '0');
        const numEnd = String(lastPoke.dexNum).padStart(4, '0');

        const nameStart = nameMap.get(firstPoke.slug) || this.capitalize(firstPoke.slug);
        const nameEnd = nameMap.get(lastPoke.slug) || this.capitalize(lastPoke.slug);

        options.push({
          offset: offset,
          label: `#${numStart} - #${numEnd} | ${nameStart} - ${nameEnd}`,
        });
      }

      this.autoFillOptions.set(options);
    } catch (err) {
      console.error('Failed to generate autofill options:', err);
    }
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  async onAutoFillRequested(selectedOffset: number) {
    this.showOptionsDialog.set(false);
    this.loading.set(true);

    try {
      const currentDex = this.dex();
      if (!currentDex) throw new Error('Dex info not loaded');

      const pokemonMapping = await firstValueFrom(
        this.datasetService.createDexMapping(currentDex.type),
      );

      const targetedNativeBoxNumber = ((currentDex.startBox - 1 + selectedOffset) % 200) + 1;

      await this.firestoreService.autoFillBox(
        this.dexId(),
        this.currentBox(),
        currentDex.startBox,
        pokemonMapping,
        targetedNativeBoxNumber,
      );
      this.loadBox(this.dexId(), this.currentBox());
    } catch (err) {
      console.error('Failed to auto-fill box:', err);
      this.loading.set(false);
    }
  }

  async onEmptyBoxRequested() {
    this.showOptionsDialog.set(false);
    this.loading.set(true);

    try {
      await this.firestoreService.emptyBox(this.dexId(), this.currentBox());
      this.loadBox(this.dexId(), this.currentBox());
    } catch (err) {
      console.error('Failed to empty box:', err);
      this.loading.set(false);
    }
  }

  async onRemoveAllRequested() {
    this.showOptionsDialog.set(false);
    this.loading.set(true);

    try {
      await this.firestoreService.removeAllPokemon(this.dexId(), this.currentBox());
      this.loadBox(this.dexId(), this.currentBox());
    } catch (err) {
      console.error('Failed to remove all Pokemon:', err);
      this.loading.set(false);
    }
  }
}
