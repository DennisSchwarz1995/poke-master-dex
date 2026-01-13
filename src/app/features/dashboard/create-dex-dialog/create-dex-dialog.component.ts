import { Component, signal, inject, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DexType, DexTypeConfig } from '../../../shared/models/dex.model';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-dex-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="close()">
      <div class="bg-surface rounded-lg p-6 max-w-2xl w-full mx-4 border border-theme" (click)="$event.stopPropagation()">
        <h2 class="text-2xl font-bold mb-6 text-primary">Create New Dex</h2>
        
        @if (step() === 1) {
          <div class="space-y-4">
            <h3 class="font-semibold mb-4 text-primary">Select Dex Type:</h3>
            
            @for (config of dexTypeConfigs; track config.type) {
              <button
                (click)="selectDexType(config.type)"
                class="w-full text-left p-4 rounded-lg border-2 transition-all"
                [class.border-blue-500]="selectedType() === config.type"
                [class.bg-blue-50]="selectedType() === config.type"
                [class.border-gray-200]="selectedType() !== config.type"
              >
                <div class="flex items-start gap-4">
                  <span class="text-3xl">{{ config.icon }}</span>
                  <div class="flex-1">
                    <h4 class="font-bold text-lg text-primary">{{ config.name }}</h4>
                    <p class="text-secondary text-sm">{{ config.description }}</p>
                  </div>
                </div>
              </button>
            }
            
            <div class="flex justify-end gap-3 mt-6">
              <button (click)="close()" class="px-4 py-2 text-secondary hover:text-primary">
                Cancel
              </button>
              <button 
                (click)="nextStep()"
                [disabled]="!selectedType()"
                class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        }
        
        @if (step() === 2) {
          <div class="space-y-4">
            <div>
              <label class="block font-semibold mb-2 text-primary">Dex Name:</label>
              <input 
                [(ngModel)]="dexName"
                type="text"
                placeholder="My Living Dex"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label class="block font-semibold mb-2">Start Box (1-200):</label>
              <input 
                [(ngModel)]="startBox"
                type="number"
                min="1"
                max="200"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <p class="text-sm text-gray-600 mt-1">
                Pokemon will be populated starting from this box. 
                Box {{ startBox }} will contain Pokemon #1-30.
              </p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <p class="text-sm text-gray-700">
                <strong>Auto-population:</strong> All 1025 Pokemon will be filled 
                across 35 boxes starting from Box {{ startBox }}.
                All Pokemon will be grayed out until you mark them as owned.
              </p>
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
              <button (click)="prevStep()" class="px-4 py-2 text-gray-600">
                Back
              </button>
              <button 
                (click)="createDex()"
                [disabled]="!dexName || creating()"
                class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {{ creating() ? 'Creating...' : 'Create Dex' }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class CreateDexDialogComponent {
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private datasetService = inject(DatasetService);
  
  closed = output<void>();
  dexCreated = output<void>();
  
  step = signal(1);
  selectedType = signal<DexType | null>(null);
  dexName = '';
  startBox = 1;
  creating = signal(false);
  
  dexTypeConfigs: DexTypeConfig[] = [
    {
      type: DexType.STANDARD,
      name: 'Standard Dex',
      description: 'Basic Pokemon collection without restrictions',
      icon: '📋',
      color: 'blue'
    },
    {
      type: DexType.LIVING,
      name: 'Living Dex',
      description: 'One Pokemon of each species (1025 total)',
      icon: '🌱',
      color: 'green'
    },
    {
      type: DexType.SHINY_LIVING,
      name: 'Shiny Living Dex',
      description: 'Shiny version of each species',
      icon: '✨',
      color: 'yellow'
    },
    {
      type: DexType.FORM,
      name: 'Form Dex',
      description: 'All forms and variants of each Pokemon',
      icon: '🔄',
      color: 'purple'
    },
    {
      type: DexType.ORIGIN,
      name: 'Origin Dex',
      description: 'Collection of Pokemon you caught as Original Trainer',
      icon: '🏆',
      color: 'red'
    }
  ];
  
  selectDexType(type: DexType) {
    this.selectedType.set(type);
  }
  
  nextStep() {
    if (this.selectedType()) {
      this.step.set(2);
      const config = this.dexTypeConfigs.find(c => c.type === this.selectedType());
      this.dexName = config?.name || '';
    }
  }
  
  prevStep() {
    this.step.set(1);
  }
  
  async createDex() {
    if (!this.selectedType() || !this.dexName) return;
    
    this.creating.set(true);
    
    try {
      const config = this.dexTypeConfigs.find(c => c.type === this.selectedType());
      
      // Get Pokemon mapping from dataset based on Dex type
      const pokemonMapping = await firstValueFrom(
        this.datasetService.createDexMapping(this.selectedType()!)
      );
      
      const dexId = await this.firestoreService.createDex({
        name: this.dexName,
        type: this.selectedType()!,
        description: config!.description,
        startBox: this.startBox,
        totalBoxes: 200
      });
      
      const userId = this.authService.user()?.uid;
      if (userId) {
        await this.firestoreService.initializeBoxes(
          userId, 
          dexId, 
          this.startBox,
          pokemonMapping
        );
      }
      
      this.dexCreated.emit();
      this.close();
    } catch (err) {
      console.error('Failed to create Dex:', err);
      this.creating.set(false);
    }
  }
  
  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
