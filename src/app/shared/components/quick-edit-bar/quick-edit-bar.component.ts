import { Component, OnInit, inject, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { Trainer } from '../../models/trainer.model';
import { PokeballData } from '../../models/dataset.model';
import { AVAILABLE_SPRITES } from '../../../core/constants/available-sprites';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../custom-dropdown/custom-dropdown.component';

export type QuickEditMode = 'None' | 'Edit' | 'Owned' | 'Pokeball' | 'Shiny' | 'Gmax' | 'Alpha' | 'Trainer';

export interface QuickEditState {
  active: boolean;
  mode: QuickEditMode;
  trainerId?: string;
  originalTrainer?: string;
  ball?: string;
}

@Component({
  selector: 'app-quick-edit-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent],
  template: `
    <div
      class="bg-surface border border-theme rounded-2xl p-3 mb-4 flex items-center gap-4 shadow-sm relative z-20"
    >
      <div class="flex gap-2 flex-wrap items-center">
        @for (mode of availableModes; track mode.value) {
          <div class="relative flex" [class.z-50]="currentMode() === mode.value">
            <button
              (click)="setMode(mode.value)"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              [ngClass]="
                currentMode() === mode.value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-secondary hover:bg-surface-hover hover:text-primary'
              "
            >
              @if (mode.value === 'Pokeball') {
                <div
                  class="w-5 h-5 flex items-center justify-center transition-all bg-surface rounded-full shadow-sm"
                >
                  <img [src]="getBallIcon()" alt="Ball" class="w-4 h-4 object-contain" />
                </div>
              } @else if (mode.icon) {
                <div
                  class="w-5 h-5 flex items-center justify-center transition-all bg-surface rounded-full shadow-sm"
                >
                  <img [src]="mode.icon" [alt]="mode.label" class="w-4 h-4 object-contain" />
                </div>
              } @else if (mode.icons) {
                <div class="flex flex-row items-center justify-center -space-x-1.5 transition-all">
                  @for (ic of mode.icons; track ic) {
                    <img
                      [src]="ic"
                      alt="Icon"
                      class="w-[1.35rem] h-[1.35rem] object-contain drop-shadow-sm bg-surface rounded-full p-0.5"
                    />
                  }
                </div>
              }
              {{ mode.label }}
            </button>

            @if (mode.value === 'Trainer' && currentMode() === 'Trainer') {
              <div
                class="absolute top-[120%] left-0 z-50 animate-in fade-in zoom-in-95 w-64"
              >
                <app-custom-dropdown
                  [options]="trainerDropdownOptions()"
                  [selectedId]="selectedTrainerId()"
                  [placeholder]="'Select a Trainer...'"
                  [searchable]="false"
                  (valueChanged)="onTrainerSelected($event)"
                />
              </div>
            }

            @if (mode.value === 'Pokeball' && currentMode() === 'Pokeball') {
              <div
                class="absolute top-[120%] left-0 md:left-1/2 md:-translate-x-1/2 z-50 animate-in fade-in zoom-in-95"
              >
                <div
                  class="absolute -top-1.5 left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-t border-l border-theme rotate-45 z-10"
                ></div>

                <div
                  class="relative bg-surface border border-theme rounded-xl shadow-xl flex gap-1 p-2 overflow-x-auto custom-scrollbar z-20 max-w-[85vw] w-max sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px]"
                >
                  @for (ball of allPokeballs(); track ball.id) {
                    <button
                      (click)="onBallSelected(ball.id, $event)"
                      [title]="ball.name"
                      class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md bg-surface"
                      [ngClass]="
                        selectedBall() === ball.id
                          ? 'bg-blue-100 ring-2 ring-blue-500 ring-opacity-50'
                          : 'hover:bg-surface-hover hover:scale-110'
                      "
                    >
                      <img
                        [src]="getBallImage(ball.id)"
                        [alt]="ball.name"
                        class="w-7 h-7 object-contain drop-shadow"
                      />
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      @if (currentMode() !== 'None') {
        <div
          class="ml-auto px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold animate-in fade-in"
        >
          Click Pokémon to apply
        </div>
      }
    </div>
  `,
})
export class QuickEditBarComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private datasetService = inject(DatasetService);

  modeChanged = output<QuickEditState>();

  currentMode = signal<QuickEditMode>('None');
  trainers = signal<Trainer[]>([]);
  allPokeballs = signal<PokeballData[]>([]);

  selectedTrainerId = signal<string>('');
  selectedTrainerName = signal<string>('');
  selectedBall = signal<string>('poke-ball');

  availableModes: {
    value: QuickEditMode;
    label: string;
    icon?: string;
    icons?: string[];
  }[] = [
    {
      value: 'Edit',
      label: 'Edit',
      icon: 'assets/images/icons/options-black.png', // Using the black options icon as an edit icon
    },
    {
      value: 'Owned',
      label: 'Caught',
      icon: 'assets/images/icons/caught.png',
    },
    {
      value: 'Pokeball',
      label: 'Pokéball',
    },
    {
      value: 'Shiny',
      label: 'Shiny',
      icon: 'assets/images/special_attributes/shiny-stars.png',
    },
    {
      value: 'Gmax',
      label: 'Gmax',
      icon: 'assets/images/special_attributes/gigantamax.png',
    },
    {
      value: 'Alpha',
      label: 'Alpha',
      icon: 'assets/images/special_attributes/alpha.png',
    },
    {
      value: 'Trainer',
      label: 'Set Trainer',
      icons: ['assets/images/icons/trainer-male.png', 'assets/images/icons/trainer-female.png'],
    },
  ];

  trainerDropdownOptions = computed<CustomDropdownOption[]>(() => {
    return this.trainers().map((tr) => ({
      id: tr.id,
      name: tr.name,
      description: `(${tr.game})`,
    }));
  });

  pokeballDropdownOptions = computed<CustomDropdownOption[]>(() => {
    const categoryLabels: Record<string, string> = {
      regular: 'Regular',
      special: 'Special',
      hisuian: 'Hisuian',
      other: 'Other',
    };
    return this.allPokeballs().map((ball) => ({
      id: ball.id,
      name: ball.name,
      description: ball.shortDesc,
      category: categoryLabels[ball.category] ?? ball.category,
      iconPath: AVAILABLE_SPRITES.pokeballs.has(ball.id)
        ? `assets/images/pokeballs/${ball.id}.png`
        : undefined,
    }));
  });

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.firestoreService.getUserTrainers().subscribe((data) => {
        this.trainers.set(data);
      });
    }

    this.datasetService.loadPokeballs().subscribe((data) => {
      this.allPokeballs.set(data);
    });
  }

  setMode(mode: QuickEditMode) {
    if (this.currentMode() === mode) {
      this.currentMode.set('None');
    } else {
      this.currentMode.set(mode);
    }
    this.emitState();
  }

  getBallImage(ballId: string): string {
    return AVAILABLE_SPRITES.pokeballs.has(ballId)
      ? `assets/images/pokeballs/${ballId}.png`
      : 'assets/images/pokeballs/pokeball.png';
  }

  getBallIcon(): string {
    return this.getBallImage(this.selectedBall());
  }

  onTrainerSelected(trainerId: string) {
    this.selectedTrainerId.set(trainerId);
    if (!trainerId) {
      this.selectedTrainerName.set('');
    } else {
      const tr = this.trainers().find((t) => t.id === trainerId);
      this.selectedTrainerName.set(tr ? tr.name : '');
    }
    this.emitState();
  }

  onBallSelected(ballId: string, event: Event) {
    event.stopPropagation();
    this.selectedBall.set(ballId);
    this.emitState();
  }

  private emitState() {
    this.modeChanged.emit({
      active: this.currentMode() !== 'None',
      mode: this.currentMode(),
      trainerId: this.selectedTrainerId() || undefined,
      originalTrainer: this.selectedTrainerName() || undefined,
      ball: this.selectedBall() !== 'poke-ball' ? this.selectedBall() : 'poke-ball',
    });
  }
}
