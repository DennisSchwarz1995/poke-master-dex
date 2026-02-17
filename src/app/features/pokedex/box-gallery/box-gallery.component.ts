import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { TypeColorService } from '../../../core/services/type-color.service';
import { DexNavigationComponent } from '../../../shared/components/dex-navigation/dex-navigation.component';
import { PokemonDetailDialogComponent } from '../pokemon-detail-dialog/pokemon-detail-dialog.component';
import { Dex, Box, BoxSlot } from '../../../shared/models/dex.model';

interface BoxWithSprites {
  box: Box;
  sprites: string[];
  names: string[];
  types: string[][];
  slugs: string[];
}

@Component({
  selector: 'app-box-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, DexNavigationComponent, PokemonDetailDialogComponent],
  template: `
    <div class="min-h-screen bg-secondary">
      <app-dex-navigation
        [dexId]="dexId()"
        [dexName]="dex()?.name || 'Loading...'"
        currentView="gallery"
        (editNameRequested)="openEditNameDialog()"
      />
      
      <div class="container mx-auto px-4 pt-6 pb-2">
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
                title="Clear search"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
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
      <main class="container mx-auto px-4 py-4">
        @if (loading()) {
          <div class="text-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p class="text-secondary">Loading Gallery...</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (boxData of boxesWithSprites(); track boxData.box.boxNumber) {
              <div class="bg-surface rounded-xl shadow-lg p-3 hover:shadow-xl transition-all border border-theme">
                <div 
                  class="flex items-center justify-between mb-2 cursor-pointer bg-surface-hover p-2 rounded"
                  (click)="openBox(boxData.box.boxNumber)"
                >
                  <div>
                    <h3 class="font-bold text-sm">{{ boxData.box.name }}</h3>
                    <span class="text-xs text-secondary">Box {{ boxData.box.boxNumber }}</span>
                  </div>
                  <span class="text-xs font-medium px-2 py-1 rounded"
                        [class.bg-green-100]="getOwnedCount(boxData.box) === 30"
                        [class.text-green-800]="getOwnedCount(boxData.box) === 30"
                        [class.bg-blue-100]="getOwnedCount(boxData.box) > 0 && getOwnedCount(boxData.box) < 30"
                        [class.text-blue-800]="getOwnedCount(boxData.box) > 0 && getOwnedCount(boxData.box) < 30"
                        [class.bg-gray-100]="getOwnedCount(boxData.box) === 0"
                        [class.text-gray-600]="getOwnedCount(boxData.box) === 0">
                    {{ getOwnedCount(boxData.box) }}/30
                  </span>
                </div>
                
                <div class="grid grid-cols-6 gap-0.5 bg-secondary rounded p-1">
                  @for (sprite of boxData.sprites; track $index) {
                    <div 
                      class="bg-surface rounded aspect-square flex items-center justify-center relative group cursor-pointer transition-all hover:z-10 border-2 border-transparent"
                      [class.grayscale]="!boxData.box.slots[$index]?.isOwned"
                      [class.opacity-40]="!boxData.box.slots[$index]?.isOwned"
                      [title]="boxData.names[$index] || ''"
                      [ngStyle]="getBorderStyle(boxData.types[$index], boxData.box.boxNumber, $index, boxData.slugs[$index])"
                      (mouseenter)="onPokemonHover(boxData.box.boxNumber, $index)"
                      (mouseleave)="onPokemonLeave()"
                      (click)="onPokemonClick(boxData.box, $index)"
                    >
                      @if (sprite) {
                        <img 
                          [src]="sprite" 
                          class="w-full h-full object-contain p-0.5 group-hover:scale-110 transition-transform"
                        />
                        <div class="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 rounded transition-opacity pointer-events-none"></div>
                      } @else {
                        <span class="text-tertiary text-xs">?</span>
                      }
                    </div>
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
    </div>
  `,
  styles: []
})
export class BoxGalleryComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private datasetService = inject(DatasetService);
  private typeColorService = inject(TypeColorService);
  
  dexId = signal<string>('');
  dex = signal<Dex | undefined>(undefined);
  boxes = signal<Box[]>([]);
  boxesWithSprites = signal<BoxWithSprites[]>([]);
  loading = signal(true);
  
  selectedSlotForDetail = signal<BoxSlot | null>(null);
  selectedBoxNumber = signal<number>(1);
  searchQuery = signal<string>('');
  matchedPokemonSlugs = signal<Set<string>>(new Set());
  private pokemonNamesMap = new Map<string, { names: { [key: string]: string | undefined } }>();
  private searchSubject = new Subject<string>();
  
  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.dexId.set(id);
        this.loadGalleryData(id);
      }
    });
  }
  
  ngOnDestroy() {
    this.searchSubject.complete();
  }
  
  loadGalleryData(id: string) {
    this.loading.set(true);
    
    this.firestoreService.getDex(id).subscribe(dex => {
      this.dex.set(dex);
    });
    
    this.firestoreService.getDexBoxes(id).subscribe({
      next: (boxes) => {
        const sorted = boxes.sort((a, b) => a.boxNumber - b.boxNumber);
        this.boxes.set(sorted);
        this.loadSpritesForBoxes(sorted);
      },
      error: (err) => {
        console.error('Failed to load boxes', err);
        this.loading.set(false);
      }
    });
  }
  
  loadSpritesForBoxes(boxes: Box[]) {
    if (boxes.length === 0) {
      this.loading.set(false);
      return;
    }

    const boxesWithSpritesData: BoxWithSprites[] = [];
    
    boxes.forEach((box) => {
      const slots = Array.isArray(box.slots) ? box.slots : Object.values(box.slots || []);
      const sprites: string[] = new Array(30).fill('');
      const names: string[] = new Array(30).fill('');
      const types: string[][] = new Array(30).fill([]);
      const slugs: string[] = new Array(30).fill('');
      
      slots.forEach((slot: any, index: number) => {
        if (slot.pokemonSlug) {
          this.datasetService.loadPokemonBySlug(slot.pokemonSlug).subscribe({
            next: (pokemon) => {
              sprites[index] = this.datasetService.getSpriteUrl(pokemon, slot.isShiny);
              const pokemonName = pokemon.names.deu || pokemon.names.eng;
              const position = slot.position || (index + 1);
              names[index] = `${pokemonName} - #${pokemon.nid} - Slot ${position}`;
              types[index] = [pokemon.type1, pokemon.type2].filter(t => !!t) as string[];
              slugs[index] = slot.pokemonSlug;
              
              this.pokemonNamesMap.set(slot.pokemonSlug, { names: pokemon.names });
              
              this.boxesWithSprites.set([...boxesWithSpritesData]);
            },
            error: () => {
              sprites[index] = '';
              names[index] = '';
              types[index] = [];
              slugs[index] = '';
            }
          });
        }
      });
      
      boxesWithSpritesData.push({
        box,
        sprites,
        names,
        types,
        slugs
      });
    });
    
    this.boxesWithSprites.set(boxesWithSpritesData);
    this.loading.set(false);
  }
  
  getOwnedCount(box: Box): number {
    return (Array.isArray(box.slots) ? box.slots : Object.values(box.slots || {}))
      .filter((s: any) => s.isOwned).length;
  }
  
  onPokemonClick(box: Box, slotIndex: number) {
    const slots = Array.isArray(box.slots) ? box.slots : Object.values(box.slots || []);
    const slot = slots[slotIndex] as any;
    
    if (slot && slot.pokemonSlug) {
      this.selectedSlotForDetail.set(slot as BoxSlot);
      this.selectedBoxNumber.set(box.boxNumber);
    }
  }
  
  closeDetailDialog() {
    this.selectedSlotForDetail.set(null);
  }
  
  onDetailSaved() {
    this.loadGalleryData(this.dexId());
    this.selectedSlotForDetail.set(null);
  }
  
  openBox(boxNumber: number) {
    this.router.navigate(['/dex', this.dexId(), 'box', boxNumber]);
  }
  
  openEditNameDialog() {
    console.log('Edit Dex name');
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
      
      // Check all language variations
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

  hoveredPokemon = signal<{ boxNumber: number, slotIndex: number } | null>(null);

  onPokemonHover(boxNumber: number, slotIndex: number) {
    this.hoveredPokemon.set({ boxNumber, slotIndex });
  }

  onPokemonLeave() {
    this.hoveredPokemon.set(null);
  }

  getBorderStyle(types: string[], boxNumber: number, slotIndex: number, slug?: string): { [key: string]: string } {
    const isSearchMatch = slug && this.searchQuery() && this.matchedPokemonSlugs().has(slug);
    
    if (isSearchMatch) {
      return {
        'border': '3px solid #FFD700',
        'box-shadow': '0 0 8px rgba(255, 215, 0, 0.6)'
      };
    }
    
    const hovered = this.hoveredPokemon();
    const isHovered = hovered && hovered.boxNumber === boxNumber && hovered.slotIndex === slotIndex;

    if (!isHovered || !types || types.length === 0) return { 'border-color': 'transparent' };

    if (types.length === 1) {
      return { 'border-color': this.typeColorService.getTypeColor(types[0]) };
    } 
    
    // Dual type: Gradient
    const color1 = this.typeColorService.getTypeColor(types[0]);
    const color2 = this.typeColorService.getTypeColor(types[1]);
    
    return {
      'background-image': `linear-gradient(var(--color-surface), var(--color-surface)), linear-gradient(to right, ${color1}, ${color2})`,
      'background-origin': 'border-box',
      'background-clip': 'padding-box, border-box',
      'border': '2px solid transparent'
    };
  }
}
