import { Component, signal, inject, output, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { Trainer } from '../../../shared/models/trainer.model';
import { GameDefinition } from '../../../shared/models/game-definitions.model';
import { GAME_DEFINITIONS } from '../../../core/constants/game-data.constants';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { GameDataService } from '../../../core/services/game-data.service';
import { CustomDropdownComponent } from '../../../shared/components/custom-dropdown/custom-dropdown.component';
import { TrainerCardComponent } from './components/trainer-card.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-trainer-management-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialogComponent,
    CustomDropdownComponent,
    TrainerCardComponent,
    IconComponent,
  ],
  template: `
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      (click)="close()"
    >
      <div
        class="bg-surface rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-theme"
        (click)="$event.stopPropagation()"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-primary">Trainer Profiles</h2>
          <button (click)="close()" class="text-secondary hover:text-primary text-2xl">×</button>
        </div>

        @if (showForm()) {
          <div class="bg-secondary p-4 rounded-lg mb-6 border border-theme">
            <h3 class="font-semibold mb-4 text-primary">
              {{ editingTrainerId() ? 'Edit Trainer Profile' : 'Add New Trainer Profile' }}
            </h3>

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-semibold mb-1 text-secondary">Trainer Name</label>
                <input
                  [(ngModel)]="newTrainerName"
                  type="text"
                  maxlength="12"
                  class="w-full px-3 py-2 bg-surface border-theme rounded text-primary placeholder:text-secondary focus:outline-none focus:border-blue-500"
                  placeholder="e.g. ASH"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold mb-1 text-secondary">Trainer ID</label>
                <input
                  [(ngModel)]="newTrainerId"
                  type="text"
                  maxlength="6"
                  class="w-full px-3 py-2 bg-surface border-theme rounded text-primary placeholder:text-secondary focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 30850"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold mb-1 text-secondary"
                  >Secret ID (SID) - Optional</label
                >
                <input
                  [(ngModel)]="newTrainerSecretId"
                  type="text"
                  maxlength="6"
                  class="w-full px-3 py-2 bg-surface border-theme rounded text-primary placeholder:text-secondary focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 11111"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2 text-secondary"
                  >Gender (Optional)</label
                >
                <div
                  class="flex bg-surface-raised rounded-xl overflow-hidden h-10 border border-theme shadow-inner relative"
                >
                  <div
                    class="absolute top-0 bottom-0 w-1/2 transition-all duration-300 ease-in-out z-0"
                    [ngClass]="{
                      'translate-x-0': newTrainerGender === 'male',
                      'translate-x-full': newTrainerGender === 'female',
                      'opacity-0': newTrainerGender === '',
                    }"
                  ></div>

                  <button
                    (click)="setGender('male')"
                    class="flex-1 flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm z-0 relative"
                    [ngClass]="{ 'bg-[--color-male]': newTrainerGender === 'male' }"
                  >
                    <app-icon
                      name="male"
                      size="1.5em"
                      class="transition-colors duration-200"
                      [ngClass]="{
                        'text-white': newTrainerGender === 'male',
                        'text-[--color-male]': newTrainerGender !== 'male',
                      }"
                    ></app-icon>
                    <span
                      class="transition-colors duration-200"
                      [ngClass]="{
                        'text-white': newTrainerGender === 'male',
                        'text-secondary': newTrainerGender !== 'male',
                      }"
                      >Male</span
                    >
                  </button>

                  <button
                    (click)="setGender('female')"
                    class="flex-1 flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm z-0 relative"
                    [ngClass]="{ 'bg-[--color-female]': newTrainerGender === 'female' }"
                  >
                    <app-icon
                      name="female"
                      size="1.5em"
                      class="transition-colors duration-200"
                      [ngClass]="{
                        'text-white': newTrainerGender === 'female',
                        'text-[--color-female]': newTrainerGender !== 'female',
                      }"
                    ></app-icon>
                    <span
                      class="transition-colors duration-200"
                      [ngClass]="{
                        'text-white': newTrainerGender === 'female',
                        'text-secondary': newTrainerGender !== 'female',
                      }"
                      >Female</span
                    >
                  </button>
                </div>
              </div>

              <div class="relative mt-2">
                <app-custom-dropdown
                  [label]="'Game'"
                  [options]="dropdownGameOptions()"
                  [selectedId]="newTrainerGame"
                  (valueChanged)="newTrainerGame = $event"
                  [placeholder]="'Select Game'"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-4">
              <button (click)="cancelForm()" class="px-4 py-2 text-secondary hover:text-primary">
                Cancel
              </button>
              <button
                (click)="saveTrainer()"
                [disabled]="!newTrainerName || !newTrainerId || saving()"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {{ saving() ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        } @else {
          <button
            (click)="showForm.set(true)"
            class="flex items-center justify-center gap-4 w-full mb-6 px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
          >
            <app-icon name="plus" size="1.25em"></app-icon>
            Add New Trainer Profile
          </button>
        }

        @if (trainers().length > 0) {
          <div class="space-y-3">
            <h3 class="font-semibold text-secondary">Saved Trainers:</h3>

            <div class="grid grid-cols-1 gap-4">
              @for (trainer of trainers(); track trainer.id) {
                <div class="relative group">
                  <app-trainer-card
                    [trainer]="trainer"
                    (cardClick)="editTrainer(trainer)"
                  ></app-trainer-card>
                  <button
                    (click)="deleteTrainer(trainer.id); $event.stopPropagation()"
                    class="absolute top-2 right-2 bg-surface text-red-500 hover:text-white hover:bg-red-500 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    title="Delete Trainer"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>
        } @else {
          <p class="text-secondary text-center py-8">No trainer profiles saved yet.</p>
        }
      </div>
    </div>

    @if (trainerToDelete()) {
      <app-confirm-dialog
        title="Delete Trainer Profile"
        message="Are you sure you want to delete this trainer profile? This action cannot be undone."
        icon="⚠️"
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="confirmDeleteTrainer()"
        (cancelled)="cancelDeleteTrainer()"
      />
    }
  `,
  styles: [],
})
export class TrainerManagementDialogComponent {
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);
  private gameDataService = inject(GameDataService);

  closed = output<void>();

  trainers = signal<Trainer[]>([]);
  showForm = signal(false);
  saving = signal(false);
  trainerToDelete = signal<string | null>(null);
  editingTrainerId = signal<string | null>(null);

  newTrainerName = '';
  newTrainerId = '';
  newTrainerSecretId = '';
  newTrainerGender = '';
  newTrainerGame = '';
  gameOptions = computed(() => {
    const games = GAME_DEFINITIONS;
    const grouped = new Map<number, GameDefinition[]>();

    games.forEach((game) => {
      if (!grouped.has(game.gen)) {
        grouped.set(game.gen, []);
      }
      grouped.get(game.gen)!.push(game);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => {
        if (a[0] === 0) return 1;
        if (b[0] === 0) return -1;
        return b[0] - a[0];
      })
      .map(([gen, games]) => ({
        gen,
        label: gen === 0 ? 'Special' : `Generation ${gen}`,
        games: games.sort((a, b) => b.year - a.year),
      }));
  });

  dropdownGameOptions = computed(() =>
    this.gameDataService.getOriginGameOptions(this.gameOptions()),
  );

  constructor() {
    this.loadTrainers();
  }

  loadTrainers() {
    this.firestoreService.getUserTrainers().subscribe((trainers) => this.trainers.set(trainers));
  }

  async saveTrainer() {
    if (!this.newTrainerName || !this.newTrainerId) return;

    this.saving.set(true);

    try {
      if (this.editingTrainerId()) {
        await this.firestoreService.updateTrainer(this.editingTrainerId()!, {
          name: this.newTrainerName,
          trainerId: this.newTrainerId,
          secretId: this.newTrainerSecretId || undefined,
          gender: this.newTrainerGender || undefined,
          game: this.newTrainerGame || undefined,
        });
        this.toastService.success('Trainer updated successfully');
      } else {
        await this.firestoreService.createTrainer({
          name: this.newTrainerName,
          trainerId: this.newTrainerId,
          secretId: this.newTrainerSecretId || undefined,
          gender: this.newTrainerGender || undefined,
          game: this.newTrainerGame,
        });
        this.toastService.success('Trainer saved successfully');
      }

      this.cancelForm();
      this.saving.set(false);
      this.loadTrainers();
    } catch (err) {
      console.error('Failed to save trainer:', err);
      this.saving.set(false);
      this.toastService.error('Failed to save trainer');
    }
  }

  editTrainer(trainer: Trainer) {
    this.editingTrainerId.set(trainer.id);
    this.newTrainerName = trainer.name;
    this.newTrainerId = trainer.trainerId;
    this.newTrainerSecretId = trainer.secretId || '';
    this.newTrainerGender = trainer.gender || '';
    this.newTrainerGame = trainer.game || '';
    this.showForm.set(true);
  }

  setGender(gender: string) {
    if (this.newTrainerGender === gender) {
      this.newTrainerGender = '';
    } else {
      this.newTrainerGender = gender;
    }
  }

  deleteTrainer(trainerId: string) {
    this.trainerToDelete.set(trainerId);
  }

  cancelDeleteTrainer() {
    this.trainerToDelete.set(null);
  }

  async confirmDeleteTrainer() {
    const trainerId = this.trainerToDelete();
    if (!trainerId) return;

    this.trainerToDelete.set(null);

    try {
      await this.firestoreService.deleteTrainer(trainerId);
      this.loadTrainers();
      this.toastService.success(`Trainer deleted successfully`);
    } catch (err) {
      this.toastService.error('Failed to delete trainer');
    }
  }

  cancelForm() {
    this.editingTrainerId.set(null);
    this.newTrainerName = '';
    this.newTrainerId = '';
    this.newTrainerSecretId = '';
    this.newTrainerGender = '';
    this.newTrainerGame = '';
    this.showForm.set(false);
  }

  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
