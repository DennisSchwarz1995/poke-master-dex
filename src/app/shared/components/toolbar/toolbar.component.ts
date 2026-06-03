import {
  Component,
  OnInit,
  inject,
  output,
  input,
  signal,
  computed,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { Trainer } from '../../models/trainer.model';
import { PokeballData } from '../../models/dataset.model';
import { AVAILABLE_SPRITES } from '../../../core/constants/available-sprites.constants';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../custom-dropdown/custom-dropdown.component';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { CdnUrlPipe } from '../../pipes/cdnUrl-pipe';

export type QuickEditMode =
  | 'None'
  | 'Edit'
  | 'Owned'
  | 'Pokeball'
  | 'Shiny'
  | 'Gmax'
  | 'Alpha'
  | 'Trainer';

export interface AppearanceState {
  showShiny: boolean;
  showGmax: boolean;
  showAlpha: boolean;
  showPokeball: boolean;
}

export interface QuickEditState {
  active: boolean;
  mode: QuickEditMode;
  trainerId?: string;
  originalTrainer?: string;
  ball?: string;
  appearance?: AppearanceState;
}

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent, TooltipDirective, CdnUrlPipe],
  template: `
    <div class="flex flex-col gap-4 w-full animate-in fade-in duration-300">
      <div class="relative flex items-center justify-between w-full">
        <ng-content></ng-content>

        <div
          class="bg-surface border border-theme rounded-2xl p-2.5 flex items-center gap-3 shadow-sm relative z-20 w-fit ml-auto"
        >
          <div class="relative flex items-center">
            <button
              (click)="toggleToolsDropdown()"
              class="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 border border-theme bg-surface hover:bg-surface-hover text-primary shadow-sm"
              [ngClass]="{
                'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-300':
                  currentMode() !== 'None',
              }"
              [appTooltip]="'Pokémon Tools'"
              tooltipPosition="top"
            >
              <img
                [src]="'options-black.png' | cdnUrl: 'icons'"
                class="w-4 h-4 dark:invert"
                alt="Tools"
              />
              {{ currentMode() !== 'None' ? '(' + getModeLabel(currentMode()) + ')' : '' }}
            </button>

            @if (isToolsDropdownOpen()) {
              <div
                class="absolute top-[120%] left-0 z-50 animate-in fade-in zoom-in-95 w-48 bg-surface border border-theme rounded-xl shadow-xl py-2 flex flex-col gap-1"
              >
                @for (mode of availableModes; track mode.value) {
                  <button
                    (click)="setMode(mode.value)"
                    class="px-4 py-2 text-left text-sm font-medium transition-all flex items-center gap-3 hover:bg-surface-hover w-full"
                    [class.bg-blue-50]="currentMode() === mode.value"
                    [class.text-blue-700]="currentMode() === mode.value"
                    [class.dark:bg-blue-950/30]="currentMode() === mode.value"
                    [class.dark:text-blue-300]="currentMode() === mode.value"
                  >
                    @if (mode.value === 'Pokeball') {
                      <img [src]="getBallIcon()" alt="Ball" class="w-5 h-5 object-contain" />
                    } @else if (mode.svgIcon) {
                      <span
                        class="w-5 h-5 flex items-center justify-center text-current [&>svg]:w-full [&>svg]:h-full"
                        [innerHTML]="mode.svgIcon"
                      >
                      </span>
                    } @else if (mode.icon) {
                      <img
                        [src]="mode.icon | cdnUrl: mode.cdnFolder || ''"
                        [alt]="mode.label"
                        class="w-5 h-5 object-contain"
                      />
                    } @else if (mode.icons) {
                      <div
                        class="flex flex-row items-center justify-center -space-x-1.5 transition-all w-5"
                      >
                        @for (icon of mode.icons; track icon) {
                          <img
                            [src]="icon | cdnUrl: mode.cdnFolder || ''"
                            alt="Icon"
                            class="w-[1.1rem] h-[1.1rem] object-contain drop-shadow-sm bg-surface rounded-full p-0.5"
                          />
                        }
                      </div>
                    }
                    {{ mode.label }}
                  </button>
                }
                @if (currentMode() !== 'None') {
                  <div class="h-px bg-theme my-1"></div>
                  <button
                    (click)="setMode('None')"
                    class="px-4 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-full flex items-center gap-3"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    Clear Tool
                  </button>
                }
              </div>
            }
          </div>

          <div class="relative flex items-center">
            <button
              (click)="toggleAppearanceDropdown()"
              class="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 bg-surface hover:bg-surface-hover border border-theme text-primary shadow-sm"
              [appTooltip]="'Appearance'"
              tooltipPosition="top"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
            </button>

            @if (isAppearanceDropdownOpen()) {
              <div
                class="absolute top-[120%] left-0 z-50 animate-in fade-in zoom-in-95 w-48 bg-surface border border-theme rounded-xl shadow-xl py-2 flex flex-col gap-1"
              >
                <label
                  class="px-4 py-2 text-sm font-medium transition-all flex items-center gap-3 hover:bg-surface-hover w-full cursor-pointer"
                >
                  <input
                    type="checkbox"
                    [checked]="appearanceState().showShiny"
                    (change)="toggleAppearance('showShiny')"
                    class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <img
                    [src]="'ShinySVStar.png' | cdnUrl: 'special_attributes'"
                    alt="Shiny"
                    class="w-5 h-5 object-contain"
                  />
                  Shiny Icon
                </label>
                <label
                  class="px-4 py-2 text-sm font-medium transition-all flex items-center gap-3 hover:bg-surface-hover w-full cursor-pointer"
                >
                  <input
                    type="checkbox"
                    [checked]="appearanceState().showGmax"
                    (change)="toggleAppearance('showGmax')"
                    class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <img
                    [src]="'gigantamax.png' | cdnUrl: 'special_attributes'"
                    alt="Gmax"
                    class="w-5 h-5 object-contain"
                  />
                  Gmax Icon
                </label>
                <label
                  class="px-4 py-2 text-sm font-medium transition-all flex items-center gap-3 hover:bg-surface-hover w-full cursor-pointer"
                >
                  <input
                    type="checkbox"
                    [checked]="appearanceState().showAlpha"
                    (change)="toggleAppearance('showAlpha')"
                    class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <img
                    [src]="'alpha.png' | cdnUrl: 'special_attributes'"
                    alt="Alpha"
                    class="w-5 h-5 object-contain"
                  />
                  Alpha Icon
                </label>
                <label
                  class="px-4 py-2 text-sm font-medium transition-all flex items-center gap-3 hover:bg-surface-hover w-full cursor-pointer"
                >
                  <input
                    type="checkbox"
                    [checked]="appearanceState().showPokeball"
                    (change)="toggleAppearance('showPokeball')"
                    class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <img
                    [src]="'pokeball.webp' | cdnUrl: 'pokeballs'"
                    alt="Pokeball"
                    class="w-6 h-6 object-contain"
                  />
                  Pokéball
                </label>
              </div>
            }
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="discard.emit()"
              [disabled]="pendingEditsCount() === 0 || isSaving()"
              class="px-4 py-2 rounded-lg transition-all flex items-center justify-center border border-theme bg-surface text-primary disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              [ngClass]="{
                'hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:border-red-900/50':
                  pendingEditsCount() > 0 && !isSaving(),
              }"
              [appTooltip]="'Discard Changes'"
              tooltipPosition="top"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>

            <button
              (click)="save.emit()"
              [disabled]="pendingEditsCount() === 0 || isSaving()"
              class="relative px-4 py-2 rounded-lg transition-all flex items-center justify-center border border-theme bg-surface text-primary disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              [ngClass]="{
                'hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-950/20 dark:hover:border-green-900/50':
                  pendingEditsCount() > 0 && !isSaving(),
              }"
              [appTooltip]="'Save All Changes'"
              tooltipPosition="top"
            >
              @if (isSaving()) {
                <div
                  class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
                ></div>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              }

              @if (pendingEditsCount() > 0) {
                <span
                  class="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm animate-in zoom-in duration-200"
                >
                  {{ pendingEditsCount() }}
                </span>
              }
            </button>
          </div>
        </div>
      </div>

      @if (currentMode() !== 'None') {
        <div
          class="bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/15 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300 shadow-sm flex items-start sm:items-center gap-3 w-full animate-in slide-in-from-top-2 duration-200"
        >
          <svg
            class="w-5 h-5 text-blue-500 shrink-0 mt-0.5 sm:mt-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="font-medium leading-relaxed">{{ getModeDescription() }}</span>
        </div>
      }
      @if (currentMode() === 'Trainer' || currentMode() === 'Pokeball') {
        @if (currentMode() === 'Trainer') {
          <div class="w-full max-w-xs sm:max-w-sm">
            <app-custom-dropdown
              [options]="trainerDropdownOptions()"
              [selectedId]="selectedTrainerId()"
              [placeholder]="'Select a Trainer...'"
              [searchable]="false"
              (valueChanged)="onTrainerSelected($event)"
            />
          </div>
        }

        @if (currentMode() === 'Pokeball') {
          <div
            class="flex flex-wrap items-center gap-2 p-2 bg-surface border border-theme rounded-2xl shadow-sm w-full animate-in slide-in-from-top-2 duration-200"
          >
            @for (ball of allPokeballs(); track ball.id) {
              <button
                (click)="onBallSelected(ball.id, $event)"
                [appTooltip]="ball.name"
                tooltipPosition="top"
                class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-hover group shadow-sm"
                [ngClass]="selectedBall() === ball.id ? 'bg-blue-500/20  shadow-md' : 'bg-surface'"
              >
                <img
                  [src]="getBallImage(ball.id) | cdnUrl: 'pokeballs'"
                  [alt]="ball.name"
                  class="w-7 h-7 object-contain drop-shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform"
                />
              </button>
            }
          </div>
        }
      }
    </div>
  `,
})
export class ToolbarComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private datasetService = inject(DatasetService);
  private elRef = inject(ElementRef);

  pendingEditsCount = input<number>(0);
  isSaving = input<boolean>(false);

  modeChanged = output<QuickEditState>();
  save = output<void>();
  discard = output<void>();

  currentMode = signal<QuickEditMode>('None');
  trainers = signal<Trainer[]>([]);
  allPokeballs = signal<PokeballData[]>([]);

  selectedTrainerId = signal<string>('');
  selectedTrainerName = signal<string>('');
  selectedBall = signal<string>('');

  isToolsDropdownOpen = signal(false);
  isAppearanceDropdownOpen = signal(false);

  appearanceState = signal<AppearanceState>({
    showShiny: false,
    showGmax: false,
    showAlpha: false,
    showPokeball: false,
  });

  availableModes: {
    value: QuickEditMode;
    label: string;
    icon?: string;
    svgIcon?: string;
    icons?: string[];
    cdnFolder?: string;
  }[] = [
    {
      value: 'Edit',
      label: 'Edit',
      icon: 'options-black.png',
      cdnFolder: 'icons',
    },
    {
      value: 'Owned',
      label: 'Caught',
      svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<path d="M0 0h24v24H0z" fill="none" />
	<path fill="currentColor" d="M14.5 12a2.5 2.5 0 0 1-5 0a2.5 2.5 0 0 1 5 0m7.5 0c0 5.52-4.48 10-10 10S2 17.52 2 12S6.48 2 12 2s10 4.48 10 10m-2 0h-4c0-2.21-1.79-4-4-4s-4 1.79-4 4H4c0 4.41 3.59 8 8 8s8-3.59 8-8" />
</svg>

        `,
      cdnFolder: 'icons',
    },
    {
      value: 'Pokeball',
      label: 'Pokéball',
    },
    {
      value: 'Shiny',
      label: 'Shiny',
      icon: 'shiny-stars.png',
      cdnFolder: 'special_attributes',
    },
    {
      value: 'Gmax',
      label: 'Gmax',
      icon: 'gigantamax.png',
      cdnFolder: 'special_attributes',
    },
    {
      value: 'Alpha',
      label: 'Alpha',
      icon: 'alpha.png',
      cdnFolder: 'special_attributes',
    },
    {
      value: 'Trainer',
      label: 'Set Trainer',
      icons: ['trainer-male.png', 'trainer-female.png'],
      cdnFolder: 'icons',
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
      iconPath: AVAILABLE_SPRITES.pokeballs.has(ball.id) ? `${ball.id}.png` : undefined,
      cdnFolder: 'pokeballs',
    }));
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isToolsDropdownOpen.set(false);
      this.isAppearanceDropdownOpen.set(false);
    }
  }

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
    this.emitState();
  }

  toggleToolsDropdown() {
    this.isToolsDropdownOpen.set(!this.isToolsDropdownOpen());
    if (this.isToolsDropdownOpen()) this.isAppearanceDropdownOpen.set(false);
  }

  toggleAppearanceDropdown() {
    this.isAppearanceDropdownOpen.set(!this.isAppearanceDropdownOpen());
    if (this.isAppearanceDropdownOpen()) this.isToolsDropdownOpen.set(false);
  }

  toggleAppearance(key: keyof AppearanceState) {
    const currentState = this.appearanceState();
    this.appearanceState.set({ ...currentState, [key]: !currentState[key] });
    this.emitState();
  }

  setMode(mode: QuickEditMode) {
    if (this.currentMode() === mode) {
      this.isToolsDropdownOpen.set(false);
      return;
    }
    this.currentMode.set(mode);
    this.isToolsDropdownOpen.set(false);
    this.emitState();
  }

  getModeLabel(modeValue: QuickEditMode): string {
    const mode = this.availableModes.find((m) => m.value === modeValue);
    return mode ? mode.label : '';
  }

  getBallImage(ballId: string): string {
    return AVAILABLE_SPRITES.pokeballs.has(ballId) ? `${ballId}.webp` : 'pokeball.webp';
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

    if (this.selectedBall() === ballId) {
      this.selectedBall.set('');
    } else {
      this.selectedBall.set(ballId);
    }

    this.emitState();
  }

  getChosenBallName(): string {
    const ball = this.allPokeballs().find((b) => b.id === this.selectedBall());
    if (!ball) return '';
    return ball.name.replace(/\s*[Bb]all$/, '');
  }

  getModeDescription(): string {
    const mode = this.currentMode();
    if (mode === 'None') return '';

    if (mode === 'Edit') {
      return 'Click on any Pokémon to open its detailed edit dialog. Use this to manually adjust specific values, levels, and items.';
    }

    if (mode === 'Owned') {
      return 'Click on any Pokémon to toggle its caught status. Useful for quickly updating your collection progress.';
    }

    if (mode === 'Pokeball') {
      const ballId = this.selectedBall();
      if (!ballId) {
        return 'Select a Poké Ball from the side panel, then click on any Pokémon to catch it.';
      }
      const chosenBall = this.getChosenBallName();
      return `Click on any Pokémon to catch it with a ${chosenBall} Ball. Click again on a Pokémon with the same ball to unset it.`;
    }

    if (mode === 'Shiny') {
      return 'Click on any Pokémon to toggle its Shiny status. Shiny Pokémon feature rare color palettes and unique sparkle effects.';
    }

    if (mode === 'Gmax') {
      return 'Click on any Pokémon to toggle its Gigantamax status. G-Max Pokémon have unique Dynamax forms and moves.';
    }

    if (mode === 'Alpha') {
      return 'Click on any Pokémon to toggle its Alpha status. Alpha Pokémon are larger in size, stronger, and have glowing red eyes.';
    }

    if (mode === 'Trainer') {
      const trainerId = this.selectedTrainerId();
      if (!trainerId) {
        return 'Select a Trainer from the selection box, then click on any Pokémon to assign this Trainer.';
      }
      const trainerName = this.selectedTrainerName() || 'selected Trainer';
      return `Click on any Pokémon to assign the Trainer "${trainerName}" to it. Click again on a Pokémon with the same Trainer to remove it.`;
    }

    return '';
  }

  private emitState() {
    this.modeChanged.emit({
      active: this.currentMode() !== 'None',
      mode: this.currentMode(),
      trainerId: this.selectedTrainerId() || undefined,
      originalTrainer: this.selectedTrainerName() || undefined,
      ball: this.selectedBall() || undefined,
      appearance: this.appearanceState(),
    });
  }
}
