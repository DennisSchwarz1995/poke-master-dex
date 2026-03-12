import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { ThemeService } from '../../../core/services/theme.service';
import { PokemonSpriteComponent } from '../../../shared/components/pokemon-sprite/pokemon-sprite.component';
import { PokemonDetailDialogComponent } from '../pokemon-detail-dialog/pokemon-detail-dialog.component';
import { DexNavigationComponent } from '../../../shared/components/dex-navigation/dex-navigation.component';
import { BoxOptionsDialogComponent, AutoFillOption } from '../box-options-dialog/box-options-dialog.component';
import { Box, BoxSlot, Dex } from '../../../shared/models/dex.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-box-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PokemonSpriteComponent,
    PokemonDetailDialogComponent,
    DexNavigationComponent,
    BoxOptionsDialogComponent,
  ],
  template: `
    <div class="min-h-screen bg-secondary flex flex-col">
      <app-dex-navigation
        [dexId]="dexId()"
        [dexName]="dex()?.name || 'Loading...'"
        currentView="box"
        [currentBoxNumber]="currentBox()"
        (nameSaved)="onDexNameSaved($event)"
      />

      <main class="container mx-auto px-4 py-8 flex-1 flex flex-col">
        @if (loading()) {
          <div class="text-center py-12">
            <div
              class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"
            ></div>
          </div>
        } @else if (box(); as currentBoxData) {
          <div class="bg-surface rounded-xl shadow-lg p-6 flex-1 flex flex-col border border-theme">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center align-center gap-2">
                <h2 class="text-2xl font-bold">{{ currentBoxData.name }}</h2>
              </div>
              
              <div class="flex items-center gap-4">
                <div class="text-sm text-secondary">{{ getOwnedCount() }} / 30 owned</div>
                <button
                  (click)="showOptionsDialog.set(true)"
                  class="text-tertiary hover:text-blue-500 px-2 flex items-center justify-center transition-colors"
                  title="Box Options"
                >
                  <img
                    [src]="
                      themeService.currentTheme() === 'dark'
                        ? '/assets/images/icons/options-white.png'
                        : '/assets/images/icons/options-black.png'
                    "
                    class="w-5 h-5 opacity-70 hover:opacity-100"
                    alt="Options"
                  />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-6 gap-2 content-start">
              @for (slot of slots(); track slot.position) {
                <div (click)="onSlotClick(slot)" class="cursor-pointer">
                  <app-pokemon-sprite
                    [pokemonSlug]="slot.pokemonSlug"
                    [isOwned]="slot.isOwned"
                    [isShiny]="slot.isShiny"
                  />
                </div>
              }
            </div>
          </div>
        }
      </main>
    </div>

    @if (showDetailDialog() && selectedSlot()) {
      <app-pokemon-detail-dialog
        [pokemon]="selectedSlot()!"
        [dexId]="dexId()"
        [boxNumber]="currentBox()"
        (closed)="closeDetailDialog()"
        (saved)="onDetailSaved()"
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
  themeService = inject(ThemeService);

  dexId = signal('');
  currentBox = signal(1);
  box = signal<Box | null>(null);
  slots = signal<BoxSlot[]>([]);
  dex = signal<Dex | null>(null);
  loading = signal(true);
  showDetailDialog = signal(false);
  selectedSlot = signal<BoxSlot | null>(null);
  showOptionsDialog = signal(false);
  autoFillOptions = signal<AutoFillOption[]>([]);

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
    this.firestoreService.getDex(dexId).subscribe((dexData) => {
      this.dex.set(dexData);
      this.generateAutoFillOptions(dexData);
    });
  }

  loadBox(dexId: string, boxNum: number) {
    this.loading.set(true);
    this.firestoreService.getBox(dexId, boxNum).subscribe({
      next: (boxData) => {
        const slots = Array.isArray(boxData.slots)
          ? boxData.slots
          : (Object.values(boxData.slots || {}) as BoxSlot[]);
        const sortedSlots = slots.sort((a, b) => a.position - b.position);

        this.box.set(boxData);
        this.slots.set(sortedSlots);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load box:', err);
        this.loading.set(false);
      },
    });
  }

  onSlotClick(slot: BoxSlot) {
    this.selectedSlot.set(slot);
    this.showDetailDialog.set(true);
  }

  closeDetailDialog() {
    this.showDetailDialog.set(false);
    this.selectedSlot.set(null);
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
      await this.firestoreService.updateBoxName(
        this.dexId(),
        this.currentBox(),
        newName
      );
      this.loadBox(this.dexId(), this.currentBox());
    } catch (err) {
      console.error('Failed to rename box:', err);
    }
  }

  async generateAutoFillOptions(currentDex: Dex) {
    try {
      const mapping = await firstValueFrom(
        this.datasetService.createDexMapping(currentDex.type)
      );

      const options: AutoFillOption[] = [];
      const totalPokemon = mapping.length;
      const pokemonPerBox = 30;
      const neededBoxes = Math.ceil(totalPokemon / pokemonPerBox);

      // Get basic english/german names to make the labels nicer.
      // We rely on getSimplePokemonList since we just need the localized names
      const basePokemonList = await firstValueFrom(this.datasetService.getSimplePokemonList());
      const nameMap = new Map<string, string>();
      basePokemonList.forEach(p => {
        nameMap.set(p.slug, p.nameGerman || p.name);
      });

      for (let offset = 0; offset < neededBoxes; offset++) {
        const startIndex = offset * pokemonPerBox;
        const endIndex = Math.min(startIndex + pokemonPerBox - 1, totalPokemon - 1);
        
        const firstPoke = mapping[startIndex];
        const lastPoke = mapping[endIndex];

        if (!firstPoke || !lastPoke) continue; // Skip empty chunks

        const numStart = String(firstPoke.dexNum).padStart(4, '0');
        const numEnd = String(lastPoke.dexNum).padStart(4, '0');
        
        const nameStart = nameMap.get(firstPoke.slug) || this.capitalize(firstPoke.slug);
        const nameEnd = nameMap.get(lastPoke.slug) || this.capitalize(lastPoke.slug);

        options.push({
          offset: offset,
          label: `#${numStart} - #${numEnd} | ${nameStart} - ${nameEnd}`
        });
      }
      
      this.autoFillOptions.set(options);
    } catch(err) {
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
        this.datasetService.createDexMapping(currentDex.type)
      );
      
      // Compute the box number the targeted autofill subset would normally live in
      // if using the user's chosen startBox layout.
      // E.g., if startBox=1 and we chose preset offset=1 (which is Box 2 natively),
      // we tell our firestore autoFill method "act like the current BoxNumber IS that box, using startBox".
      const targetedNativeBoxNumber = ((currentDex.startBox - 1 + selectedOffset) % 200) + 1;

      await this.firestoreService.autoFillBox(
        this.dexId(),
        this.currentBox(), // This specific box
        currentDex.startBox,
        pokemonMapping,
        targetedNativeBoxNumber // Pass the explicitly requested chunk
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
      await this.firestoreService.emptyBox(
        this.dexId(),
        this.currentBox()
      );
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
      await this.firestoreService.removeAllPokemon(
        this.dexId(),
        this.currentBox()
      );
      this.loadBox(this.dexId(), this.currentBox());
    } catch (err) {
      console.error('Failed to remove all Pokemon:', err);
      this.loading.set(false);
    }
  }
}
