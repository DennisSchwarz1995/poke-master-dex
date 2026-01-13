import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { PokemonSpriteComponent } from '../../../shared/components/pokemon-sprite/pokemon-sprite.component';
import { PokemonDetailDialogComponent } from '../pokemon-detail-dialog/pokemon-detail-dialog.component';
import { DexNavigationComponent } from '../../../shared/components/dex-navigation/dex-navigation.component';
import { Box, BoxSlot, Dex } from '../../../shared/models/dex.model';

@Component({
  selector: 'app-box-view',
  standalone: true,
  imports: [CommonModule, FormsModule, PokemonSpriteComponent, PokemonDetailDialogComponent, DexNavigationComponent],
  template: `
    <div class="min-h-screen bg-secondary flex flex-col">
      <app-dex-navigation
        [dexId]="dexId()"
        [dexName]="dex()?.name || 'Loading...'"
        currentView="box"
        [currentBoxNumber]="currentBox()"
        (editNameRequested)="openEditNameDialog()"
      />
      
      <main class="container mx-auto px-4 py-8 flex-1 flex flex-col">
        @if (loading()) {
          <div class="text-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          </div>
        } @else if (box(); as currentBoxData) {
          <div class="bg-surface rounded-xl shadow-lg p-6 flex-1 flex flex-col border border-theme">
            <div class="flex items-center justify-between mb-6">
              @if (editingBoxName()) {
                <div class="flex items-center gap-2">
                  <input 
                    #boxNameInput
                    [(ngModel)]="newBoxName"
                    type="text"
                    maxlength="16"
                    class="text-2xl font-bold px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                    (keyup.enter)="saveBoxName()"
                    (keyup.escape)="cancelEditBoxName()"
                  />
                  <button 
                    (click)="saveBoxName()"
                    class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ✓
                  </button>
                  <button 
                    (click)="cancelEditBoxName()"
                    class="px-3 py-1 bg-surface-hover text-secondary rounded border border-theme"
                  >
                    ✕
                  </button>
                </div>
              } @else {
                <div class="flex items-center gap-2">
                  <h2 class="text-2xl font-bold">{{ currentBoxData.name }}</h2>
                  <button
                    (click)="startEditBoxName(currentBoxData.name)"
                    class="text-tertiary hover:text-blue-500 px-2"
                    title="Rename Box"
                  >
                    ✏️
                  </button>
                </div>
              }
              <div class="text-sm text-secondary">
                {{ getOwnedCount() }} / 30 owned
              </div>
            </div>
            
            <div class="grid grid-cols-6 gap-2 content-start">
              @for (slot of slots(); track slot.position) {
                <div 
                  (click)="onSlotClick(slot)"
                  class="cursor-pointer"
                >
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
  `,
  styles: []
})
export class BoxViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  
  dexId = signal('');
  currentBox = signal(1);
  box = signal<Box | null>(null);
  slots = signal<BoxSlot[]>([]);
  dex = signal<Dex | null>(null);
  loading = signal(true);
  showDetailDialog = signal(false);
  selectedSlot = signal<BoxSlot | null>(null);
  editingBoxName = signal(false);
  newBoxName = '';
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
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
    this.firestoreService.getDex(dexId)
      .subscribe(dexData => this.dex.set(dexData));
  }
  
  loadBox(dexId: string, boxNum: number) {
    this.loading.set(true);
    this.firestoreService.getBox(dexId, boxNum)
      .subscribe({
        next: (boxData) => {
          const slots = Array.isArray(boxData.slots) 
            ? boxData.slots 
            : Object.values(boxData.slots || {}) as BoxSlot[];
          
          // Sort by position to ensure correct display
          const sortedSlots = slots.sort((a, b) => a.position - b.position);
          
          this.box.set(boxData);
          this.slots.set(sortedSlots);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load box:', err);
          this.loading.set(false);
        }
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
    return slotsArray.filter(s => s.isOwned).length;
  }
  
  openEditNameDialog() {
    // TODO: Implement Dex renaming dialog
    console.log('Edit Dex name');
  }
  
  startEditBoxName(currentName: string) {
    this.newBoxName = currentName;
    this.editingBoxName.set(true);
  }
  
  async saveBoxName() {
    if (!this.newBoxName.trim() || this.newBoxName.length > 16) {
      this.cancelEditBoxName();
      return;
    }
    
    try {  
      await this.firestoreService.updateBoxName(
        this.dexId(),
        this.currentBox(),
        this.newBoxName.trim()
      );
      this.editingBoxName.set(false);
      this.loadBox(this.dexId(), this.currentBox());
    } catch (err) {
      console.error('Failed to rename box:', err);
      this.cancelEditBoxName();
    }
  }
  
  cancelEditBoxName() {
    this.newBoxName = '';
    this.editingBoxName.set(false);
  }
  
}
