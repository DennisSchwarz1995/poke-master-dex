import { Component, signal, computed, inject, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DexType, DexTypeConfig } from '../../../shared/models/dex.model';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { firstValueFrom } from 'rxjs';

interface DexCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  types: DexType[];
}

@Component({
  selector: 'app-create-dex-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      (click)="close()"
    >
      <div
        class="bg-surface rounded-lg p-6 max-w-2xl w-full mx-4 border border-theme overflow-hidden flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <h2 class="text-2xl font-bold mb-6 text-primary shrink-0">Create New Dex</h2>

        <div class="relative w-full overflow-hidden">
          <div
            class="flex transition-transform duration-300 ease-in-out w-full"
            [style.transform]="'translateX(-' + (step() - 1) * 100 + '%)'"
          >
            <div class="w-full shrink-0">
              <div class="space-y-4 px-1">
                <h3 class="font-semibold mb-4 text-primary">Select Dex Category:</h3>

                @for (cat of categories; track cat.id) {
                  <button
                    (click)="selectCategory(cat)"
                    class="w-full text-left p-4 rounded-lg border-2 transition-all"
                    [ngClass]="
                      selectedCategory()?.id === cat.id
                        ? 'border-blue-500 bg-secondary/50'
                        : 'border-theme hover:border-blue-500/50'
                    "
                  >
                    <div class="flex items-start gap-4">
                      <span class="text-3xl">{{ cat.icon }}</span>
                      <div class="flex-1">
                        <h4 class="font-bold text-lg text-primary">{{ cat.name }}</h4>
                        <p class="text-secondary text-sm">{{ cat.description }}</p>
                      </div>
                    </div>
                  </button>
                }

                <div class="flex justify-end gap-3 mt-6">
                  <button (click)="close()" class="px-4 py-2 text-secondary hover:text-primary">
                    Cancel
                  </button>
                  <button
                    (click)="goToStep(2)"
                    [disabled]="!selectedCategory()"
                    class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <div class="w-full shrink-0">
              <div class="space-y-4 px-1">
                <h3 class="font-semibold mb-4 text-primary">Select Dex Type:</h3>

                @for (config of availableTypes(); track config.type) {
                  <button
                    (click)="selectDexType(config.type)"
                    class="w-full text-left p-4 rounded-lg border-2 transition-all"
                    [ngClass]="
                      selectedType() === config.type
                        ? 'border-blue-500 bg-secondary/50'
                        : 'border-theme hover:border-blue-500/50'
                    "
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
                  <button (click)="goToStep(1)" class="px-4 py-2 text-secondary hover:text-primary">
                    Back
                  </button>
                  <button
                    (click)="nextToConfig()"
                    [disabled]="!selectedType()"
                    class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <div class="w-full shrink-0">
              <div class="space-y-4 px-1">
                <div>
                  <label class="block font-semibold mb-2 text-primary">Dex Name:</label>
                  <input
                    [(ngModel)]="dexName"
                    type="text"
                    placeholder="My Living Dex"
                    class="w-full px-4 py-2 bg-surface border-theme rounded text-primary placeholder:text-tertiary focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label class="block font-semibold mb-2">Start Box (1-200):</label>
                  <input
                    [(ngModel)]="startBox"
                    type="number"
                    min="1"
                    max="200"
                    class="w-full px-4 py-2 bg-surface border-theme rounded text-primary placeholder:text-tertiary focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <p class="text-sm text-secondary mt-1">
                    Pokemon will be populated starting from this box. Box {{ startBox }} will
                    contain Pokemon #1-30.
                  </p>
                </div>

                @if (selectedTypeConfig()?.supportedLayouts?.length) {
                  <div>
                    <label class="block font-semibold mb-2 text-primary">Arrangement:</label>
                    <div class="space-y-3">
                      @for (layout of selectedTypeConfig()!.supportedLayouts; track layout.id) {
                        <label
                          class="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-secondary/20 transition-colors border border-transparent"
                          [ngClass]="{
                            'border-blue-500/50 bg-secondary/10': selectedLayout() === layout.id,
                          }"
                        >
                          <input
                            type="radio"
                            name="selectedLayout"
                            [value]="layout.id"
                            [ngModel]="selectedLayout()"
                            (ngModelChange)="onLayoutChange($event)"
                            class="w-4 h-4 text-blue-500 bg-surface border-theme focus:ring-blue-500 focus:ring-2"
                          />
                          <span class="text-primary text-sm font-medium">{{ layout.name }}</span>
                        </label>
                      }
                    </div>
                  </div>
                }

                <div class="bg-secondary/50 border border-theme p-4 rounded">
                  @if (loadingCount()) {
                    <p class="text-sm text-primary flex items-center gap-2">
                      <span
                        class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"
                      ></span>
                      Calculating population data...
                    </p>
                  } @else {
                    <p class="text-sm text-primary">
                      <strong>Auto-population:</strong> All {{ expectedPokemonCount() }} Pokemon
                      will be filled across {{ expectedBoxCount() }} boxes starting from Box
                      {{ startBox }}. All Pokemon will be grayed out until you mark them as owned.
                    </p>
                  }
                </div>

                <div class="flex justify-end gap-3 mt-6">
                  <button (click)="goToStep(2)" class="px-4 py-2 text-secondary hover:text-primary">
                    Back
                  </button>
                  <button
                    (click)="createDex()"
                    [disabled]="!dexName || creating()"
                    class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    {{ creating() ? 'Creating...' : 'Create Dex' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class CreateDexDialogComponent {
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private datasetService = inject(DatasetService);

  closed = output<void>();
  dexCreated = output<void>();

  step = signal(1);
  selectedCategory = signal<DexCategory | null>(null);
  selectedType = signal<DexType | null>(null);
  dexName = '';
  startBox = 1;
  selectedLayout = signal<string>('grouped');
  creating = signal(false);
  readonly DexType = DexType;

  selectedTypeConfig = computed(() => {
    return this.dexTypeConfigs.find((c) => c.type === this.selectedType()) || null;
  });

  expectedPokemonCount = signal<number>(0);
  expectedSlotCount = signal<number>(0);
  expectedBoxCount = computed(() => Math.ceil(this.expectedSlotCount() / 30));
  loadingCount = signal<boolean>(false);

  categories: DexCategory[] = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Your own custom Pokemon collection without restrictions',
      icon: '📋',
      types: [DexType.STANDARD],
    },
    {
      id: 'living',
      name: 'Living',
      description: 'Collect one of each Pokemon species',
      icon: '🌱',
      types: [DexType.LIVING, DexType.SHINY_LIVING, DexType.COMBINED_SHINY_LIVING],
    },
    {
      id: 'form',
      name: 'Form',
      description: 'Collect all forms and variants of each Pokemon',
      icon: '🔄',
      types: [DexType.FORM],
    },
    {
      id: 'origin',
      name: 'Origin',
      description: 'Collect Pokemon originating from their debut generation',
      icon: '🏆',
      types: [DexType.ORIGIN, DexType.ORIGIN_FORM],
    },
  ];

  dexTypeConfigs: DexTypeConfig[] = [
    {
      type: DexType.STANDARD,
      name: 'Personal Pokedex',
      description: 'Your own custom Pokemon collection without restrictions',
      icon: '📋',
      color: 'blue',
    },
    {
      type: DexType.LIVING,
      name: 'Living Dex',
      description: 'One Pokemon of each species (1025 total)',
      icon: '🌱',
      color: 'green',
    },
    {
      type: DexType.SHINY_LIVING,
      name: 'Shiny Living Dex',
      description: 'Shiny version of each species',
      icon: '✨',
      color: 'yellow',
    },
    {
      type: DexType.COMBINED_SHINY_LIVING,
      name: 'Combined Shiny Living Dex',
      description: 'Normal and Shiny versions side by side',
      icon: '🌟',
      color: 'yellow',
      supportedLayouts: [
        { id: 'grouped', name: 'Species then Shiny (Side-by-side)' },
        { id: 'separate', name: 'Species then Shiny Species in a separate Box' },
      ],
    },
    {
      type: DexType.FORM,
      name: 'Form Dex',
      description: 'All forms and variants of each Pokemon',
      icon: '🔄',
      color: 'purple',
    },
    {
      type: DexType.ORIGIN,
      name: 'Origin Dex',
      description: 'Collect all 1025 Base Species, but each one must be from its debut generation.',
      icon: '🏆',
      color: 'yellow',
    },
    {
      type: DexType.ORIGIN_FORM,
      name: 'Origin Form Dex',
      description: 'Collect all 1428 Forms, where each form is caught in its debut generation.',
      icon: '🌍',
      color: 'green',
    },
  ];

  availableTypes = computed(() => {
    const cat = this.selectedCategory();
    if (!cat) return [];
    return this.dexTypeConfigs.filter((config) => cat.types.includes(config.type));
  });

  selectCategory(category: DexCategory) {
    this.selectedCategory.set(category);
    const currentType = this.selectedType();
    if (currentType && !category.types.includes(currentType)) {
      this.selectedType.set(null);
    }
  }

  selectDexType(type: DexType) {
    this.selectedType.set(type);
    const config = this.dexTypeConfigs.find((c) => c.type === type);
    if (config?.supportedLayouts?.length) {
      this.selectedLayout.set(config.supportedLayouts[0].id);
    }
  }

  goToStep(newStep: number) {
    this.step.set(newStep);
  }

  async onLayoutChange(layoutId: string) {
    this.selectedLayout.set(layoutId);
    if (this.selectedTypeConfig()?.supportedLayouts?.length) {
      this.loadingCount.set(true);
      try {
        const mapping = await firstValueFrom(
          this.datasetService.createDexMapping(this.selectedType()!, this.selectedLayout()),
        );
        this.expectedPokemonCount.set(mapping.filter((m) => m !== null).length);
        this.expectedSlotCount.set(mapping.length);
      } catch (err) {
        console.error('Failed to calculate dex size', err);
      } finally {
        this.loadingCount.set(false);
      }
    }
  }

  async nextToConfig() {
    if (this.selectedType()) {
      const config = this.dexTypeConfigs.find((c) => c.type === this.selectedType());
      this.dexName = config?.name || '';

      this.loadingCount.set(true);
      this.step.set(3);

      try {
        const mapping = await firstValueFrom(
          this.datasetService.createDexMapping(this.selectedType()!, this.selectedLayout()),
        );
        this.expectedPokemonCount.set(mapping.filter((m) => m !== null).length);
        this.expectedSlotCount.set(mapping.length);
      } catch (err) {
        console.error('Failed to calculate dex size', err);
      } finally {
        this.loadingCount.set(false);
      }
    }
  }

  async createDex() {
    if (!this.selectedType() || !this.dexName) return;

    this.creating.set(true);

    try {
      const config = this.dexTypeConfigs.find((c) => c.type === this.selectedType());
      const selectedType = this.selectedType()!;

      const [pokemonMapping, boxNames] = await Promise.all([
        firstValueFrom(this.datasetService.createDexMapping(selectedType, this.selectedLayout())),
        firstValueFrom(this.datasetService.getDexBoxNames(selectedType, this.selectedLayout())),
      ]);

      const dexId = await this.firestoreService.createDex({
        name: this.dexName,
        type: selectedType,
        description: config!.description,
        startBox: this.startBox,
        totalBoxes: 200,
      });

      const userId = this.authService.user()?.uid;
      if (userId) {
        await this.firestoreService.initializeBoxes(
          userId,
          dexId,
          this.startBox,
          pokemonMapping,
          boxNames,
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
