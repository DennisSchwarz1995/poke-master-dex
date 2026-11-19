import {
  Component,
  signal,
  computed,
  inject,
  output,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DexType } from '../../../shared/models/dex.model';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { firstValueFrom } from 'rxjs';
import {
  DexCategory,
  DEX_CATEGORIES,
  DEX_TYPE_CONFIGS,
} from '../../../core/constants/dex-constants';

@Component({
  selector: 'app-create-dex-dialog',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './create-dex-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDexDialogComponent {
  private readonly firestoreService = inject(FirestoreService);
  private readonly authService = inject(AuthService);
  private readonly datasetService = inject(DatasetService);

  readonly closed = output<void>();
  readonly dexCreated = output<void>();

  step = signal(1);
  selectedCategory = signal<DexCategory | null>(null);
  selectedType = signal<DexType | null>(null);
  selectedLayout = signal('grouped');

  dexName = signal('');
  startBox = signal(1);

  creating = signal(false);
  loadingCount = signal(false);
  errorMessage = signal<string | null>(null);

  readonly categories = DEX_CATEGORIES;
  readonly dexTypeConfigs = DEX_TYPE_CONFIGS;
  readonly DexType = DexType;

  expectedPokemonCount = signal(0);
  expectedSlotCount = signal(0);
  expectedBoxCount = computed(() => Math.ceil(this.expectedSlotCount() / 30));

  selectedTypeConfig = computed(() => {
    return this.dexTypeConfigs.find((c) => c.type === this.selectedType()) ?? null;
  });

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
    this.errorMessage.set(null);
  }

  async onLayoutChange(layoutId: string) {
    this.selectedLayout.set(layoutId);
    if (this.selectedTypeConfig()?.supportedLayouts?.length) {
      await this.calculatePopulationData();
    }
  }

  async nextToConfig() {
    const type = this.selectedType();
    if (type) {
      const config = this.dexTypeConfigs.find((c) => c.type === type);
      this.dexName.set(config?.name ?? '');
      this.step.set(3);
      await this.calculatePopulationData();
    }
  }

  private async calculatePopulationData() {
    this.loadingCount.set(true);
    this.errorMessage.set(null);
    try {
      const mapping = await firstValueFrom(
        this.datasetService.createDexMapping(this.selectedType()!, this.selectedLayout()),
      );
      this.expectedPokemonCount.set(mapping.filter((m) => m !== null).length);
      this.expectedSlotCount.set(mapping.length);
    } catch (err) {
      console.error('Failed to calculate dex size', err);
      this.errorMessage.set('Fehler beim Berechnen der Boxen-Anzahl.');
    } finally {
      this.loadingCount.set(false);
    }
  }

  async createDex() {
    if (!this.selectedType() || !this.dexName()) return;

    this.creating.set(true);
    this.errorMessage.set(null);

    try {
      const config = this.dexTypeConfigs.find((c) => c.type === this.selectedType());
      const selectedType = this.selectedType()!;

      const [pokemonMapping, boxNames] = await Promise.all([
        firstValueFrom(this.datasetService.createDexMapping(selectedType, this.selectedLayout())),
        firstValueFrom(this.datasetService.getDexBoxNames(selectedType, this.selectedLayout())),
      ]);

      const dexId = await this.firestoreService.createDex({
        name: this.dexName(),
        type: selectedType,
        description: config!.description,
        startBox: this.startBox(),
        totalBoxes: 200,
      });

      const userId = this.authService.user()?.uid;
      if (userId) {
        await this.firestoreService.initializeBoxes(
          userId,
          dexId,
          this.startBox(),
          pokemonMapping,
          boxNames,
        );
      }

      this.dexCreated.emit();
      this.close();
    } catch (err) {
      console.error('Failed to create Dex:', err);
      this.errorMessage.set('Fehler beim Erstellen des Dex. Bitte versuche es erneut.');
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
