import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { PokemonSpriteComponent } from '../../../shared/components/pokemon-sprite/pokemon-sprite.component';
import { PokemonDetailDialogComponent } from '../pokemon-detail-dialog/pokemon-detail-dialog.component';
import { Box, BoxSlot, Dex } from '../../../shared/models/dex.model';

@Component({
  selector: 'app-box-view',
  standalone: true,
  imports: [CommonModule, PokemonSpriteComponent, PokemonDetailDialogComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <button 
              (click)="backToOverview()"
              class="text-blue-500 hover:text-blue-700 font-medium"
            >
              ← Back to Overview
            </button>
            
            @if (dex(); as currentDex) {
              <h2 class="text-xl font-bold">{{ currentDex.name }}</h2>
            }
            
            <div class="flex items-center gap-4">
              <button
                (click)="goToOverview()"
                class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                📦 View All Boxes
              </button>
              
              <button 
                (click)="previousBox()"
                [disabled]="currentBox() === 1"
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              
              <span class="font-bold">
                Box {{ currentBox() }} / 200
              </span>
              
              <button 
                (click)="nextBox()"
                [disabled]="currentBox() === 200"
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-8">
        @if (loading()) {
          <div class="text-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          </div>
        } @else if (box(); as currentBoxData) {
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold">{{ currentBoxData.name }}</h3>
              <span class="text-gray-500 text-sm">
                {{ getOwnedCount(currentBoxData.slots) }} / 30 owned
              </span>
            </div>
            
            <div class="grid grid-cols-6 gap-3">
              @for (slot of currentBoxData.slots; track slot.position) {
                <div class="flex flex-col items-center">
                  <app-pokemon-sprite
                    [pokemonId]="slot.pokemonId"
                    [isOwned]="slot.isOwned"
                    [isShiny]="slot.isShiny"
                    (clicked)="onSlotClick(slot)"
                  />
                  @if (slot.pokemonId) {
                    <span class="text-xs text-gray-500 mt-1 font-mono">
                      #{{ slot.pokemonId.toString().padStart(4, '0') }}
                    </span>
                  }
                </div>
              }
            </div>
            
            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-700">
                <strong>Tip:</strong> Click on a Pokemon sprite to mark it as owned/unowned. 
                Owned Pokemon will appear in full color, unowned Pokemon are grayed out.
              </p>
            </div>
          </div>
        }
      </main>
    </div>
    
    @if (showDetailDialog() && selectedSlot()) {
      <app-pokemon-detail-dialog
        [pokemon]="selectedSlot()!"
        [dexId]="dexId"
        [boxNumber]="currentBox()"
        (closed)="closeDetailDialog()"
        (saved)="onPokemonUpdated()"
      />
    }
  `,
  styles: []
})
export class BoxViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  
  dexId = '';
  currentBox = signal(1);
  box = signal<Box | null>(null);
  dex = signal<Dex | null>(null);
  loading = signal(true);
  showDetailDialog = signal(false);
  selectedSlot = signal<BoxSlot | null>(null);
  
  ngOnInit() {
    this.dexId = this.route.snapshot.paramMap.get('id')!;
    this.loadDex();
    this.loadBox();
  }
  
  loadDex() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const boxNum = params.get('boxNum');
      
      if (id) {
        this.dexId.set(id);
        this.loadDexInfo(id);
      }
      
      if (boxNum) {
        const num = parseInt(boxNum, 10);
        if (num >= 1 && num <= 200) {
          this.currentBox.set(num);
          if (id) {
            this.loadBox(id, num);
          }
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
            : Object.values(boxData.slots || {});
          
          this.box.set({
            ...boxData,
            slots: slots as BoxSlot[]
          });
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load box:', err);
          this.loading.set(false);
        }
      });
  }
  
  previousBox() {
    if (this.currentBox() > 1) {
      this.currentBox.update(v => v - 1);
      this.loadBox();
    }
  }
  
  nextBox() {
    if (this.currentBox() < 200) {
      this.currentBox.update(v => v + 1);
      this.loadBox();
    }
  }
  
  onSlotClick(slot: BoxSlot) {
    if (!slot.pokemonId) return;
    
    this.selectedSlot.set(slot);
    this.showDetailDialog.set(true);
  }
  
  closeDetailDialog() {
    this.showDetailDialog.set(false);
    this.selectedSlot.set(null);
  }
  
  onPokemonUpdated() {
    this.loadBox();
  }
  
  getOwnedCount(slots: BoxSlot[] | Record<string, BoxSlot>): number {
    const slotsArray = Array.isArray(slots) ? slots : Object.values(slots || {});
    return slotsArray.filter(s => s.isOwned).length;
  }
  
  backToOverview() {
    if (this.dexId()) {
      this.router.navigate(['/dex', this.dexId()]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
  
  goToOverview() {
    this.router.navigate(['/dex', this.dexId()]);
  }
}
