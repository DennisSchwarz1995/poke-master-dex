import { Component, inject, output, input, signal, computed, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { CdnUrlPipe } from '../../pipes/cdnUrl.pipe';
import { SafeHtmlPipe } from '../../pipes/safeHtml.pipe';

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

export const AVAILABLE_APPEARANCES: {
  label: string;
  stateKey: keyof AppearanceState;
  icon: string;
  cdnFolder: string;
  iconClass: string;
  svgPath?: string;
  svgViewBox?: string;
}[] = [
  {
    label: 'Shiny Icon',
    stateKey: 'showShiny',
    icon: 'shiny.png',
    cdnFolder: 'special_attributes',
    iconClass: 'w-5 h-5 object-contain',
  },
  {
    label: 'Gmax Icon',
    stateKey: 'showGmax',
    icon: 'gigantamax.png',
    cdnFolder: 'special_attributes',
    iconClass: 'w-5 h-5 object-contain',
  },
  {
    label: 'Alpha Icon',
    stateKey: 'showAlpha',
    icon: 'alpha.png',
    cdnFolder: 'special_attributes',
    iconClass: 'w-5 h-5 object-contain',
  },
  {
    label: 'Pokéball',
    stateKey: 'showPokeball',
    icon: 'pokeball.webp',
    cdnFolder: 'pokeballs',
    iconClass: 'w-6 h-6 object-contain',
  },
];

export interface QuickEditState {
  active: boolean;
  mode: QuickEditMode;
  trainerId?: string;
  originalTrainer?: string;
  originGame?: string;
  ball?: string;
  appearance?: AppearanceState;
}

@Component({
  selector: 'app-toolbar',
  imports: [
    NgClass,
    FormsModule,
    CustomDropdownComponent,
    TooltipDirective,
    CdnUrlPipe,
    SafeHtmlPipe,
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
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
              class="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 bg-surface hover:bg-surface-hover text-primary shadow-sm"
              [ngClass]="{
                'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-300':
                  currentMode() !== 'None',
              }"
              [appTooltip]="'Pokémon Tools'"
              tooltipPosition="top"
            >
              @if (currentMode() === 'None') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path
                    fill="currentColor"
                    d="M5.33 3.272a3.5 3.5 0 0 1 4.472 4.473L20.647 18.59l-2.122 2.122L7.68 9.867a3.5 3.5 0 0 1-4.472-4.474L5.444 7.63a1.5 1.5 0 0 0 2.121-2.121zm10.367 1.883l3.182-1.768l1.414 1.415l-1.768 3.182l-1.768.353l-2.12 2.121l-1.415-1.414l2.121-2.121zm-7.071 7.778l2.121 2.122l-4.95 4.95A1.5 1.5 0 0 1 3.58 17.99l.097-.107z"
                  />
                </svg>
              } @else {
                @if (currentMode() === 'Pokeball') {
                  <img
                    [src]="(selectedBall() || 'pokeball') + '.webp' | cdnUrl: 'pokeballs'"
                    alt="Ball"
                    class="w-5 h-5 object-contain"
                  />
                } @else if (activeMode()?.icon) {
                  <img
                    [src]="activeMode()?.icon | cdnUrl: activeMode()?.cdnFolder || ''"
                    [alt]="activeMode()?.label"
                    class="w-5 h-5 object-contain"
                  />
                } @else if (activeMode()?.svgString) {
                  <span
                    [innerHTML]="activeMode()?.svgString | safeHtml"
                    class="flex items-center justify-center text-inherit"
                  ></span>
                }
              }
            </button>

            @if (isToolsDropdownOpen()) {
              <div
                class="absolute top-[150%] left-[-8px] z-50 animate-in fade-in zoom-in-95 w-48 bg-surface border border-theme rounded-xl shadow-xl p-1 flex flex-col gap-1"
              >
                @for (mode of availableModes; track mode.value) {
                  <button
                    (click)="setMode(mode.value)"
                    class="p-2 text-left text-sm font-medium transition-all flex items-center gap-2 hover:bg-surface-hover w-full rounded-lg"
                    [class.bg-blue-50]="currentMode() === mode.value"
                    [class.text-blue-700]="currentMode() === mode.value"
                    [class.dark:bg-blue-950/30]="currentMode() === mode.value"
                    [class.dark:text-blue-300]="currentMode() === mode.value"
                  >
                    @if (mode.value === 'Pokeball') {
                      <img
                        [src]="'pokeball.webp' | cdnUrl: 'pokeballs'"
                        alt="Ball"
                        class="w-5 h-5 object-contain"
                      />
                    } @else if (mode.icon) {
                      <img
                        [src]="mode.icon | cdnUrl: mode.cdnFolder || ''"
                        [alt]="mode.label"
                        class="w-5 h-5 object-contain"
                      />
                    } @else if (mode.svgString) {
                      <span
                        [innerHTML]="mode.svgString | safeHtml"
                        class="flex items-center justify-center text-inherit"
                      ></span>
                    }
                    {{ mode.label }}
                  </button>
                }

                <button
                  (click)="setMode('None')"
                  class="p-2 text-left text-sm font-medium transition-all flex items-center gap-2 hover:bg-surface-hover w-full rounded-lg"
                  [disabled]="currentMode() === 'None'"
                  ngClass="disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg fill="none" width="20" height="20" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                  Clear Tool
                </button>
              </div>
            }
          </div>

          <div class="relative flex items-center">
            <button
              (click)="toggleAppearanceDropdown()"
              class="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 bg-surface hover:bg-surface-hover text-primary shadow-sm"
              [appTooltip]="'Appearance'"
              tooltipPosition="top"
            >
              <svg fill="none" width="20" height="20" stroke="currentColor" viewBox="0 0 24 24">
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
                class="absolute top-[150%] left-[-4px] z-50 animate-in fade-in zoom-in-95 w-48 bg-surface border border-theme rounded-xl p-1 shadow-xl py-1 flex flex-col gap-1"
              >
                @for (appearance of availableAppearances; track appearance.stateKey) {
                  <label
                    class="p-2 text-left text-sm font-medium transition-all flex items-center gap-3 hover:bg-surface-hover w-full rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      [checked]="appearanceState()[appearance.stateKey]"
                      (change)="toggleAppearance(appearance.stateKey)"
                      class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    @if (appearance.icon) {
                      <img
                        [src]="appearance.icon | cdnUrl: appearance.cdnFolder"
                        [alt]="appearance.label"
                        [class]="appearance.iconClass"
                      />
                    }
                    {{ appearance.label }}
                  </label>
                }
              </div>
            }
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="discard.emit()"
              [disabled]="pendingEditsCount() === 0 || isSaving()"
              class="px-4 py-2 rounded-lg transition-all flex items-center justify-center bg-surface text-primary disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              [ngClass]="{
                'hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:border-red-900/50':
                  pendingEditsCount() > 0 && !isSaving(),
              }"
              [appTooltip]="'Discard Changes'"
              tooltipPosition="top"
            >
              <svg fill="none" width="20" height="20" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>

            <button
              (click)="save.emit(); setMode('None')"
              [disabled]="pendingEditsCount() === 0 || isSaving()"
              class="relative px-4 py-2 rounded-lg transition-all flex items-center justify-center bg-surface text-primary disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
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
                <svg fill="none" width="20" height="20" stroke="currentColor" viewBox="0 0 24 24">
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
          <span class="font-medium leading-relaxed">{{ modeDescription() }}</span>
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
                  [src]="ball.id + '.webp' | cdnUrl: 'pokeballs'"
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
export class ToolbarComponent {
  private readonly firestoreService = inject(FirestoreService);
  private readonly authService = inject(AuthService);
  private readonly datasetService = inject(DatasetService);
  private readonly elRef = inject(ElementRef);

  readonly pendingEditsCount = input<number>(0);
  readonly isSaving = input<boolean>(false);

  readonly modeChanged = output<QuickEditState>();
  readonly save = output<void>();
  readonly discard = output<void>();

  readonly currentMode = signal<QuickEditMode>('None');
  readonly trainers = signal<Trainer[]>([]);
  readonly allPokeballs = signal<PokeballData[]>([]);

  readonly selectedTrainerId = signal<string>('');
  readonly selectedTrainerName = signal<string>('');
  readonly selectedTrainerTid = signal<string>('');
  readonly selectedTrainerGame = signal<string>('');
  readonly selectedBall = signal<string>('');

  readonly isToolsDropdownOpen = signal(false);
  readonly isAppearanceDropdownOpen = signal(false);

  readonly appearanceState = signal<AppearanceState>({
    showShiny: false,
    showGmax: false,
    showAlpha: false,
    showPokeball: false,
  });

  readonly availableModes: {
    value: QuickEditMode;
    label: string;
    icon?: string;
    cdnFolder?: string;
    svgString?: string;
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
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
	<path d="M0 0h24v24H0z" fill="none" />
	<path fill="currentColor" d="M12 4c4.08 0 7.45 3.05 7.94 7h-4.06c-.45-1.73-2.02-3-3.88-3s-3.43 1.27-3.87 3H4.06C4.55 7.05 7.92 4 12 4" opacity=".3" />
	<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 2c4.08 0 7.45 3.05 7.94 7h-4.06c-.45-1.73-2.02-3-3.88-3s-3.43 1.27-3.87 3H4.06C4.55 7.05 7.92 4 12 4m2 8c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2m-2 8c-4.08 0-7.45-3.05-7.94-7h4.06c.44 1.73 2.01 3 3.87 3s3.43-1.27 3.87-3h4.06c-.47 3.95-3.84 7-7.92 7" />
</svg>
`,
    },
    {
      value: 'Pokeball',
      label: 'Pokéball',
    },
    {
      value: 'Shiny',
      label: 'Shiny',
      icon: 'shiny.png',
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
      cdnFolder: 'icons',
    },
  ];

  readonly availableAppearances = AVAILABLE_APPEARANCES;

  readonly trainerDropdownOptions = computed<CustomDropdownOption[]>(() => {
    return this.trainers().map((tr) => ({
      id: tr.id,
      name: tr.name,
      description: `(${tr.game})`,
    }));
  });

  readonly pokeballDropdownOptions = computed<CustomDropdownOption[]>(() => {
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
      iconPath: AVAILABLE_SPRITES.pokeballs.has(ball.id) ? `${ball.id}.webp` : undefined,
      cdnFolder: 'pokeballs',
    }));
  });

  readonly activeMode = computed(() => {
    return this.availableModes.find((mode) => mode.value === this.currentMode());
  });

  readonly modeDescription = computed<string>(() => {
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
      return `Click on any Pokémon to assign the Trainer "${trainerName}" to it.`;
    }

    return '';
  });

  constructor() {
    this.initAppearanceState();
    this.loadTrainers();
    this.loadPokeballs();
    this.emitState();
  }

  onDocumentClick(event: Event) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isToolsDropdownOpen.set(false);
      this.isAppearanceDropdownOpen.set(false);
    }
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
    const newState = { ...currentState, [key]: !currentState[key] };
    this.appearanceState.set(newState);
    localStorage.setItem('appearanceState', JSON.stringify(newState));
    this.emitState();
  }

  setMode(mode: QuickEditMode) {
    if (this.currentMode() === mode) {
      this.currentMode.set('None');
    } else {
      this.currentMode.set(mode);
    }
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

  onTrainerSelected(trainerId: string) {
    this.selectedTrainerId.set(trainerId);
    if (!trainerId) {
      this.selectedTrainerName.set('');
      this.selectedTrainerTid.set('');
      this.selectedTrainerGame.set('');
    } else {
      const tr = this.trainers().find((t) => t.id === trainerId);
      this.selectedTrainerName.set(tr ? tr.name : '');
      this.selectedTrainerTid.set(tr ? tr.trainerId : '');
      this.selectedTrainerGame.set(tr?.game ? tr.game : '');
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

  private initAppearanceState() {
    const savedAppearance = localStorage.getItem('appearanceState');
    if (savedAppearance) {
      try {
        const parsed = JSON.parse(savedAppearance);
        this.appearanceState.set({ ...this.appearanceState(), ...parsed });
      } catch (e) {
        console.error('Error parsing appearance state', e);
      }
    }
  }

  private loadTrainers() {
    const user = this.authService.user();
    if (user) {
      this.firestoreService
        .getUserTrainers()
        .pipe(takeUntilDestroyed())
        .subscribe((data) => {
          this.trainers.set(data);
        });
    }
  }

  private loadPokeballs() {
    this.datasetService
      .loadPokeballs()
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.allPokeballs.set(data);
      });
  }

  private getChosenBallName(): string {
    const ball = this.allPokeballs().find((b) => b.id === this.selectedBall());
    if (!ball) return '';
    return ball.name.replace(/\s*[Bb]all$/, '');
  }

  private emitState() {
    this.modeChanged.emit({
      active: this.currentMode() !== 'None',
      mode: this.currentMode(),
      trainerId: this.selectedTrainerTid() || undefined,
      originalTrainer: this.selectedTrainerName() || undefined,
      originGame: this.selectedTrainerGame() || undefined,
      ball: this.selectedBall() || undefined,
      appearance: this.appearanceState(),
    });
  }
}
