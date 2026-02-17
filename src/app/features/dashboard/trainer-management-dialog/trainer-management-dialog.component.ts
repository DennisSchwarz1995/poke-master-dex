import { Component, signal, inject, output, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { Trainer } from '../../../shared/models/trainer.model';
import { GAME_CODES, GameDefinition } from '../../../shared/models/game-definitions';

@Component({
  selector: 'app-trainer-management-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            <h3 class="font-semibold mb-4 text-primary">Add New Trainer Profile</h3>

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-semibold mb-1 text-secondary"
                  >Trainer Name (OT)</label
                >
                <input
                  [(ngModel)]="newTrainerName"
                  type="text"
                  maxlength="12"
                  class="w-full px-3 py-2 bg-surface border-theme rounded text-primary placeholder:text-tertiary focus:outline-none focus:border-blue-500"
                  placeholder="e.g., ASH"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold mb-1 text-secondary"
                  >Trainer ID (TID)</label
                >
                <input
                  [(ngModel)]="newTrainerId"
                  type="text"
                  maxlength="6"
                  class="w-full px-3 py-2 bg-surface border-theme rounded text-primary placeholder:text-tertiary focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 30850"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold mb-1 text-secondary"
                  >Game (Optional)</label
                >
                <select
                  [(ngModel)]="newTrainerGame"
                  class="w-full px-3 py-2 bg-surface border-theme rounded text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Game</option>
                  @for (genGroup of gameOptions(); track genGroup.gen) {
                    <optgroup [label]="genGroup.label">
                      @for (game of genGroup.games; track game.code) {
                        <option [value]="game.code">{{ game.fullName }}</option>
                      }
                    </optgroup>
                  }
                </select>
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
            class="w-full mb-6 px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
          >
            + Add New Trainer Profile
          </button>
        }

        @if (trainers().length > 0) {
          <div class="space-y-3">
            <h3 class="font-semibold text-secondary">Saved Trainers:</h3>

            @for (trainer of trainers(); track trainer.id) {
              <div
                class="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-surface border border-theme"
              >
                <div>
                  <div class="font-bold text-primary">{{ trainer.name }}</div>
                  <div class="text-sm text-secondary">
                    TID: {{ trainer.trainerId }}
                    @if (trainer.game) {
                      <span class="ml-2">• {{ trainer.game }}</span>
                    }
                  </div>
                </div>
                <button
                  (click)="deleteTrainer(trainer.id)"
                  class="text-red-500 hover:text-red-700 px-3 py-1"
                >
                  Delete
                </button>
              </div>
            }
          </div>
        } @else {
          <p class="text-secondary text-center py-8">No trainer profiles saved yet.</p>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class TrainerManagementDialogComponent {
  private firestoreService = inject(FirestoreService);

  closed = output<void>();

  trainers = signal<Trainer[]>([]);
  showForm = signal(false);
  saving = signal(false);

  newTrainerName = '';
  newTrainerId = '';
  newTrainerGame = '';

  // Computed property to group games by generation
  gameOptions = computed(() => {
    const games = Object.values(GAME_CODES);
    const grouped = new Map<number, GameDefinition[]>();

    games.forEach((game) => {
      if (!grouped.has(game.gen)) {
        grouped.set(game.gen, []);
      }
      grouped.get(game.gen)!.push(game);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => {
        // Special games (GO, HOME) with gen 0 go last
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
      await this.firestoreService.createTrainer({
        name: this.newTrainerName,
        trainerId: this.newTrainerId,
        game: this.newTrainerGame || undefined,
      });

      this.newTrainerName = '';
      this.newTrainerId = '';
      this.newTrainerGame = '';
      this.showForm.set(false);
      this.saving.set(false);
      this.loadTrainers();
    } catch (err) {
      console.error('Failed to save trainer:', err);
      this.saving.set(false);
    }
  }

  async deleteTrainer(trainerId: string) {
    if (!confirm('Delete this trainer profile?')) return;

    try {
      await this.firestoreService.deleteTrainer(trainerId);
      this.loadTrainers();
    } catch (err) {
      console.error('Failed to delete trainer:', err);
    }
  }

  cancelForm() {
    this.newTrainerName = '';
    this.newTrainerId = '';
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
