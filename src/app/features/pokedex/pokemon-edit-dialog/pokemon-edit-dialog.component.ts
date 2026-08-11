import {
  Component,
  input,
  output,
  signal,
  computed,
  OnInit,
  OnDestroy,
  inject,
  HostListener,
  effect,
  Renderer2,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { GameDefinition } from '../../../shared/models/game-definitions.model';
import { BoxSlot, StatsMap } from '../../../shared/models/dex.model';
import { Trainer } from '../../../shared/models/trainer.model';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { DatasetPokemon, SimplePokemon } from '../../../shared/models/dataset.model';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import {
  AbilityData,
  ItemData,
  PokeballData,
  NatureData,
  MarkData,
  RibbonData,
  MoveData,
} from '../../../shared/models/dataset.model';
import { CustomDropdownOption } from '../../../shared/components/custom-dropdown/custom-dropdown.component';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { ToastService } from '../../../core/services/toast.service';
import { GameDataService } from '../../../core/services/game-data.service';
import { DropdownOptionService } from '../../../core/services/dropdown-option.service';
import { PokemonEditHeaderComponent } from './components/pokemon-edit-header.component';
import { PokemonEditStatsComponent } from './components/pokemon-edit-stats.component';
import { PokemonEditAttributesComponent } from './components/pokemon-edit-general.component';
import { PokemonEditMovesComponent } from './components/pokemon-edit-moves.component';
import { PokemonEditRibbonsComponent } from './components/pokemon-edit-ribbons.component';
import { PokemonEditOriginComponent } from './components/pokemon-edit-origin.component';
import { CustomDropdownComponent } from '../../../shared/components/custom-dropdown/custom-dropdown.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-pokemon-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PokemonEditHeaderComponent,
    PokemonEditStatsComponent,
    PokemonEditAttributesComponent,
    PokemonEditMovesComponent,
    PokemonEditRibbonsComponent,
    PokemonEditOriginComponent,
    CustomDropdownComponent,
    IconComponent,
    TooltipDirective,
  ],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      (click)="close()"
    >
      <div
        class="bg-surface border border-theme rounded-2xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        @if (pokemon(); as pkmn) {
          <div class="p-6 pb-4 relative flex-none border-b border-theme bg-surface z-20">
            <div class="flex items-start justify-between">
              <app-pokemon-edit-header
                [pokemonData]="pokemonData()"
                [currentSpriteUrl]="currentSpriteUrl()"
                [localPokemonSlug]="localPokemonSlug()"
                [ball]="form.get('ball')?.value || ''"
                [pokemonSearchOptions]="pokemonSearchOptions()"
                [localizedName]="localizedName()"
                [pokemonGenus]="pokemonGenus()"
                (pokemonChanged)="onPokemonChange($event)"
                (shinyToggled)="toggleShinyPreview()"
              ></app-pokemon-edit-header>

              <button
                (click)="close()"
                class="text-secondary hover:text-primary transition-colors text-2xl leading-none block"
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
          </div>

          <div class="flex flex-1 overflow-hidden bg-secondary/10">
            <div
              class="w-20 sm:w-24 flex-none border-r border-theme bg-surface z-10 flex flex-col items-center justify-center py-4 gap-4 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)]"
            >
              <button
                (click)="activeTabIndex.set(0)"
                class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all"
                [ngClass]="
                  activeTabIndex() === 0
                    ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
                "
                [appTooltip]="'General'"
                tooltipPosition="right"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-info size-5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </button>
              <button
                (click)="activeTabIndex.set(1)"
                class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all"
                [ngClass]="
                  activeTabIndex() === 1
                    ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
                "
                [appTooltip]="'Moves'"
                tooltipPosition="right"
              >
                <app-icon name="moves" size="1.25em"></app-icon>
              </button>
              <button
                (click)="activeTabIndex.set(2)"
                class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all"
                [ngClass]="
                  activeTabIndex() === 2
                    ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
                "
                [appTooltip]="'Stats'"
                tooltipPosition="right"
              >
                <app-icon name="stat-chart" size="1.25em"></app-icon>
              </button>
              <button
                (click)="activeTabIndex.set(3)"
                class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all"
                [ngClass]="
                  activeTabIndex() === 3
                    ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
                "
                [appTooltip]="'Origin'"
                tooltipPosition="right"
              >
                <app-icon name="user" size="1.25em"></app-icon>
              </button>
              <button
                (click)="activeTabIndex.set(4)"
                class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all"
                [ngClass]="
                  activeTabIndex() === 4
                    ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
                "
                [appTooltip]="'Ribbons & Marks'"
                tooltipPosition="right"
              >
                <app-icon name="ribbon"></app-icon>
              </button>
            </div>

            <div class="flex-1 relative overflow-hidden bg-secondary/5">
              <div
                class="flex transition-transform duration-300 ease-in-out h-full w-full"
                [style.transform]="'translateX(-' + activeTabIndex() * 100 + '%)'"
              >
                <div class="w-full shrink-0 overflow-y-auto custom-scrollbar p-6 h-full">
                  <div class="flex flex-col gap-6">
                    <app-pokemon-edit-general
                      [pokemonData]="pokemonData()"
                      [genderState]="genderState()"
                      [pokeballOptions]="pokeballOptions()"
                      [itemOptions]="itemOptions()"
                      [form]="form"
                    ></app-pokemon-edit-general>
                  </div>
                </div>

                <div class="w-full shrink-0 overflow-y-auto custom-scrollbar p-6 h-full">
                  <app-pokemon-edit-moves
                    [form]="form"
                    [moveOptions]="moveOptions()"
                  ></app-pokemon-edit-moves>
                </div>

                <div class="w-full shrink-0 overflow-y-auto custom-scrollbar p-6 h-full">
                  <div class="flex flex-col gap-[18px]">
                    <div class="grid grid-cols-2 gap-4">
                      <app-custom-dropdown
                        [label]="'Nature'"
                        [options]="natureOptions()"
                        [selectedId]="form.get('nature')?.value || ''"
                        [placeholder]="'Select Nature'"
                        (valueChanged)="
                          form.get('nature')?.setValue($event); form.get('nature')?.markAsDirty()
                        "
                      />
                      <app-custom-dropdown
                        [label]="'Mint'"
                        [options]="natureOptions()"
                        [selectedId]="form.get('mint')?.value || ''"
                        [placeholder]="'Select Mint'"
                        (valueChanged)="
                          form.get('mint')?.setValue($event); form.get('mint')?.markAsDirty()
                        "
                      />
                      <app-custom-dropdown
                        [label]="'Ability'"
                        [options]="abilityOptions()"
                        [selectedId]="form.get('ability')?.value || ''"
                        [placeholder]="'Select Ability'"
                        [searchable]="false"
                        (valueChanged)="
                          form.get('ability')?.setValue($event); form.get('ability')?.markAsDirty()
                        "
                      />
                      <app-custom-dropdown
                        [label]="'Tera Type'"
                        [options]="teraTypeOptions()"
                        [selectedId]="form.get('teraType')?.value || ''"
                        [placeholder]="'Select Tera Type'"
                        [searchable]="false"
                        (valueChanged)="
                          form.get('teraType')?.setValue($event);
                          form.get('teraType')?.markAsDirty()
                        "
                      />
                    </div>

                    <app-pokemon-edit-stats
                      [ivs]="form.get('ivs')?.value!"
                      [evs]="form.get('evs')?.value!"
                      [hyperTrained]="form.get('hyperTrained')?.value!"
                      [raisedStat]="activeNature?.raises || null"
                      [loweredStat]="activeNature?.lowers || null"
                      [baseStats]="baseStats"
                      [level]="form.get('level')?.value || 100"
                      (ivsChanged)="
                        form.get('ivs')?.setValue($event); form.get('ivs')?.markAsDirty()
                      "
                      (evsChanged)="
                        form.get('evs')?.setValue($event); form.get('evs')?.markAsDirty()
                      "
                      (hyperTrainedChanged)="
                        form.get('hyperTrained')?.setValue($event);
                        form.get('hyperTrained')?.markAsDirty()
                      "
                    ></app-pokemon-edit-stats>
                  </div>
                </div>

                <div class="w-full shrink-0 overflow-y-auto custom-scrollbar p-6 h-full">
                  <app-pokemon-edit-origin
                    [form]="form"
                    [languageOptions]="languageOptions()"
                    [trainerOptions]="trainerOptions()"
                    [originGameOptions]="originGameOptions()"
                    [storedInOptions]="storedInOptions()"
                    (trainerSelected)="onTrainerSelect($event)"
                  ></app-pokemon-edit-origin>
                </div>

                <div class="w-full shrink-0 overflow-y-auto custom-scrollbar p-6 h-full">
                  <app-pokemon-edit-ribbons
                    [ribbonOptions]="ribbonOptions()"
                    [markOptions]="markOptions()"
                    [selectedRibbons]="selectedRibbons()"
                    [selectedMarks]="selectedMarks()"
                    (ribbonsChanged)="onRibbonsChanged($event)"
                    (marksChanged)="onMarksChanged($event)"
                  ></app-pokemon-edit-ribbons>
                </div>
              </div>
            </div>
          </div>

          <div
            class="p-4 border-t border-theme bg-surface flex justify-between items-center z-20 flex-none"
          >
            <div class="flex items-center gap-4">
              <div class="flex gap-2">
                <button
                  class="px-3 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold hover:bg-theme"
                  (click)="previous.emit()"
                  [appTooltip]="'Previous Pokémon'"
                  tooltipPosition="top"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </button>
                <button
                  class="px-3 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold hover:bg-theme"
                  (click)="next.emit()"
                  [appTooltip]="'Next Pokémon'"
                  tooltipPosition="top"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              </div>
              <div class="text-xs text-secondary hidden sm:block">
                Last updated:
                @if (justSaved()) {
                  Just now
                } @else if (lastSavedAt()) {
                  {{ lastSavedAt() | date: 'short' }}
                } @else {
                  Never
                }
              </div>
            </div>
            <div class="flex gap-3">
              <button
                class="px-5 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold hover:bg-theme whitespace-nowrap"
                (click)="backToView.emit(activeTabIndex())"
              >
                Back to view
              </button>
              <button
                class="px-5 py-1.5 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold hover:bg-theme"
                (click)="close()"
              >
                Close
              </button>
              <button
                (click)="save()"
                [disabled]="saving() || form.pristine"
                class="px-6 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
              >
                {{ saving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    @if (showTrainerPromptDialog()) {
      <div
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        role="dialog"
      >
        <div
          class="bg-surface border border-theme rounded-xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4"
        >
          <h3 class="text-xl font-bold text-primary">Unknown Trainer</h3>
          <p class="text-secondary text-sm">
            The trainer "<span class="font-bold">{{ form.get('originalTrainer')?.value }}</span
            >" is not yet saved. Would you like to save this trainer for the quick selection?
          </p>
          <div class="flex justify-end gap-3 mt-2">
            <button
              (click)="declineTrainerSave()"
              class="px-4 py-2 rounded-lg font-medium text-secondary hover:bg-secondary/50 transition-colors"
            >
              Nein
            </button>
            <button
              (click)="acceptTrainerSave()"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all"
            >
              Ja, Speichern
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [],
})
export class PokemonEditDialogComponent implements OnInit, OnDestroy {
  pokemon = input.required<BoxSlot>();
  dexId = input.required<string>();
  boxNumber = input.required<number>();
  initialTab = input<number>(0);

  closed = output<void>();
  saved = output<void>();
  previous = output<void>();
  next = output<void>();
  backToView = output<number>();

  localPokemonSlug = signal<string | null>(null);
  showTrainerPromptDialog = signal(false);
  activeTabIndex = signal<number>(0);

  private datasetService = inject(DatasetService);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);
  private langService = inject(PokemonLanguageService);
  private gameDataService = inject(GameDataService);
  private dropdownOptionService = inject(DropdownOptionService);
  private fb = inject(FormBuilder);
  renderer = inject(Renderer2);
  document = inject(DOCUMENT);

  private initialized = false;

  constructor() {
    effect(() => {
      const state = this.genderState();
      setTimeout(() => {
        const currentGender = this.form.get('gender')?.value;
        if (!state.canMale && !state.canFemale) {
          if (currentGender !== '') this.form.patchValue({ gender: '' });
        } else if (state.canMale && !state.canFemale) {
          if (currentGender !== 'male') this.form.patchValue({ gender: 'male' });
        } else if (!state.canMale && state.canFemale) {
          if (currentGender !== 'female') this.form.patchValue({ gender: 'female' });
        }
      });
    });

    effect(() => {
      const pkmn = this.pokemon();
      if (!this.initialized) return;
      this.initializePokemon(pkmn);
    });
  }

  private destroyRef = inject(DestroyRef);

  form = this.fb.group({
    isOwned: [false],
    isEvent: [false],
    isShiny: [false],
    isGmax: [false],
    isAlpha: [false],
    level: [null as number | null],
    ball: [''],
    item: [''],
    originGame: [''],
    storedIn: ['home'],
    nickname: [''],
    originLanguage: [''],
    originalTrainer: [''],
    trainerId: [''],
    customName: [''],
    notes: [''],
    ability: [''],
    nature: [''],
    mint: [''],
    teraType: [''],
    mark: [''],
    ribbon: [''],
    ribbons: [[] as string[]],
    marks: [[] as string[]],
    size: [''],
    gender: [''],
    move1: [''],
    move2: [''],
    move3: [''],
    move4: [''],
    ivs: [{ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }],
    evs: [{ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }],
    hyperTrained: [[] as string[]],
  });

  pokemonData = signal<DatasetPokemon | null>(null);
  trainers = signal<Trainer[]>([]);
  allAbilities = signal<AbilityData[]>([]);
  allPokeballs = signal<PokeballData[]>([]);
  allItems = signal<ItemData[]>([]);
  allNatures = signal<NatureData[]>([]);
  allMarks = signal<MarkData[]>([]);
  allRibbons = signal<RibbonData[]>([]);
  allPokemon = signal<SimplePokemon[]>([]);
  allMoves = signal<MoveData[]>([]);
  allowedMoveIds = signal<Set<string> | null>(null);

  genderState = computed(() => {
    const data = this.pokemonData();
    if (!data) return { canMale: true, canFemale: true };

    const mRate = data.maleRate ?? -1;
    const fRate = data.femaleRate ?? -1;

    if (mRate === 0 && fRate === 0) return { canMale: false, canFemale: false };
    if (mRate === 100 && fRate === 0) return { canMale: true, canFemale: false };
    if (fRate === 100 && mRate === 0) return { canMale: false, canFemale: true };
    return { canMale: true, canFemale: true };
  });

  ribbonOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.mapRibbons(this.allRibbons()),
  );
  markOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.mapMarks(this.allMarks()),
  );

  selectedRibbons = signal<string[]>([]);
  selectedMarks = signal<string[]>([]);
  lastSavedAt = signal<Date | null>(null);
  justSaved = signal<boolean>(false);
  pokemonSearchOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.mapPokemonSearchOptions(this.allPokemon()),
  );

  abilityOptions = computed<CustomDropdownOption[]>(() => {
    return this.availableAbilities().map((abil) => {
      const match = this.allAbilities().find((a) => a.id === abil.id);
      return {
        id: abil.id,
        name: abil.isHidden ? `${abil.name} (hidden)` : abil.name,
        description: match ? match.shortDesc : '',
      };
    });
  });

  natureOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.mapNatures(this.allNatures()),
  );

  teraTypeOptions = signal<CustomDropdownOption[]>(
    [
      'normal',
      'fire',
      'water',
      'electric',
      'grass',
      'ice',
      'fighting',
      'poison',
      'ground',
      'flying',
      'psychic',
      'bug',
      'rock',
      'ghost',
      'dragon',
      'dark',
      'steel',
      'fairy',
      'stellar',
    ].map((type) => ({
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      iconPath: `${type}.png`,
      cdnFolder: 'types',
    })),
  );

  get activeNature() {
    const mint = this.form.get('mint')?.value;
    const natureId = mint || this.form.get('nature')?.value;
    return this.allNatures().find((n) => n.id === natureId) || null;
  }

  languageOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.getLanguageOptions(),
  );

  trainerOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.mapTrainers(this.trainers(), (t) => this.isTrainerCompatible(t)),
  );

  pokeballOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.mapPokeballs(this.allPokeballs()),
  );
  itemOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.mapItems(this.allItems()),
  );
  moveOptions = computed<CustomDropdownOption[]>(() => {
    const all = this.allMoves();
    const allowed = this.allowedMoveIds();

    let filteredMoves = all;
    if (allowed !== null) {
      if (allowed.size > 0) {
        filteredMoves = all.filter((m) => allowed.has(m.id) || allowed.has(m.id.replace(/-/g, '')));
      } else {
        filteredMoves = all;
      }
    } else {
      return [];
    }

    return this.dropdownOptionService.mapMoves(filteredMoves);
  });

  pokemonGenus = computed(() => {
    const data = this.pokemonData();
    if (!data) return 'Pokémon';
    const lang = this.langService.currentLang();
    return data.genus?.[lang] || data.genus?.['eng'] || 'Pokémon';
  });

  get baseStats(): StatsMap | undefined {
    const data = this.pokemonData();
    if (!data) return undefined;
    return {
      hp: data.baseHp,
      atk: data.baseAtk,
      def: data.baseDef,
      spa: data.baseSpAtk,
      spd: data.baseSpDef,
      spe: data.baseSpeed,
    };
  }

  localizedName = computed(() => {
    const data = this.pokemonData();
    return data ? this.langService.getName(data) : '';
  });

  availableAbilities = computed(() => {
    const pkmn = this.pokemonData();
    if (!pkmn) return [];

    const abs = [];
    if (pkmn.ability1)
      abs.push({ name: this.findAbilityName(pkmn.ability1), id: pkmn.ability1, isHidden: false });
    if (pkmn.ability2)
      abs.push({ name: this.findAbilityName(pkmn.ability2), id: pkmn.ability2, isHidden: false });
    if (pkmn.abilityHidden)
      abs.push({
        name: this.findAbilityName(pkmn.abilityHidden),
        id: pkmn.abilityHidden,
        isHidden: true,
      });

    return abs;
  });

  saving = signal(false);
  currentSpriteUrl = signal('');

  availableGames = computed(() => {
    const pokemon = this.pokemonData();
    if (!pokemon) return [];

    const validGames = new Set<string>([
      ...(pokemon.obtainableIn || []),
      ...(pokemon.eventOnlyIn || []),
    ]);

    const cannotBreed =
      pokemon.isLegendary || pokemon.isMythical || pokemon.isUltraBeast || pokemon.isParadox;
    if (!cannotBreed && pokemon.storableIn) {
      pokemon.storableIn.forEach((game) => validGames.add(game));
    }
    return this.gameDataService.getAvailableGamesForPokemon(Array.from(validGames));
  });

  availableGamesByGen = computed(() => {
    const games = this.availableGames();
    const grouped = new Map<number, GameDefinition[]>();

    games.forEach((game) => {
      if (!grouped.has(game.gen)) grouped.set(game.gen, []);
      grouped.get(game.gen)!.push(game);
    });

    return Array.from(grouped.entries())
      .sort((gameA, gameB) => (gameA[0] === 0 ? 1 : gameB[0] === 0 ? -1 : gameB[0] - gameA[0]))
      .map(([gen, games]) => ({
        gen,
        label: gen === 0 ? 'Special' : `Generation ${gen}`,
        games,
      }));
  });

  originGameOptions = computed<CustomDropdownOption[]>(() =>
    this.gameDataService.getOriginGameOptions(this.availableGamesByGen()),
  );

  storedInOptions = computed<CustomDropdownOption[]>(() =>
    this.gameDataService.getStoredInOptions(),
  );

  isObtainableIn(gameCode: string): boolean {
    const pokemon = this.pokemonData();
    return pokemon?.obtainableIn?.includes(gameCode) || false;
  }

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'overflow-hidden');

    this.form
      .get('isOwned')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onCaughtChange());
    this.form
      .get('isShiny')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateSpritePreview());

    this.initializePokemon(this.pokemon());
    this.loadReferenceData();
    this.initialized = true;
  }

  private initializePokemon(pkmn: BoxSlot): void {
    this.localPokemonSlug.set(pkmn.pokemonSlug);
    this.activeTabIndex.set(this.initialTab());
    this.justSaved.set(false);

    if (pkmn.updatedAt) {
      this.lastSavedAt.set(new Date(pkmn.updatedAt));
    } else {
      this.lastSavedAt.set(null);
    }

    this.form.patchValue({
      isOwned: pkmn.isOwned,
      isEvent: pkmn.isEvent || false,
      isShiny: pkmn.isShiny,
      isGmax: pkmn.isGmax || false,
      isAlpha: pkmn.isAlpha || false,
      customName: pkmn.customName || '',
      notes: pkmn.notes || '',
      level: pkmn.level,
      ball: pkmn.ball || '',
      originGame: pkmn.originGame || '',
      storedIn: pkmn.storedIn || 'home',
      nickname: pkmn.nickname || '',
      originLanguage: pkmn.originLanguage || '',
      originalTrainer: pkmn.originalTrainer || '',
      trainerId: pkmn.trainerId || '',
      item: pkmn.item || '',
      ability: pkmn.ability || '',
      nature: pkmn.nature || '',
      mint: pkmn.mint || '',
      teraType: pkmn.teraType || '',
      mark: pkmn.mark || '',
      ribbon: pkmn.ribbon || '',
      ribbons: pkmn.ribbons || (pkmn.ribbon ? [pkmn.ribbon] : []),
      marks: pkmn.marks || (pkmn.mark ? [pkmn.mark] : []),
      size: pkmn.size || '',
      gender: pkmn.gender || '',
      move1: pkmn.moves?.[0] || '',
      move2: pkmn.moves?.[1] || '',
      move3: pkmn.moves?.[2] || '',
      move4: pkmn.moves?.[3] || '',
      ivs: pkmn.ivs ? { ...pkmn.ivs } : { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: pkmn.evs ? { ...pkmn.evs } : { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      hyperTrained: pkmn.hyperTrained ? [...pkmn.hyperTrained] : [],
    });
    this.form.markAsPristine();

    this.selectedRibbons.set(pkmn.ribbons || (pkmn.ribbon ? [pkmn.ribbon] : []));
    this.selectedMarks.set(pkmn.marks || (pkmn.mark ? [pkmn.mark] : []));

    if (pkmn.pokemonSlug) {
      this.datasetService.loadPokemonBySlug(pkmn.pokemonSlug).subscribe((data) => {
        this.pokemonData.set(data);
        this.updateSpritePreview();
        this.loadAllowedMovesFromPokeApi(data);
      });
    }
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'overflow-hidden');
  }

  private loadReferenceData(): void {
    this.firestoreService.getUserTrainers().subscribe((trainers) => this.trainers.set(trainers));
    this.datasetService.loadAbilities().subscribe((abilities) => this.allAbilities.set(abilities));
    this.datasetService.loadPokeballs().subscribe((pokeballs) => this.allPokeballs.set(pokeballs));
    this.datasetService.loadItems().subscribe((items) => this.allItems.set(items));
    this.datasetService.loadNatures().subscribe((natures) => this.allNatures.set(natures));
    this.datasetService.loadMarks().subscribe((marks) => this.allMarks.set(marks));
    this.datasetService.loadRibbons().subscribe((ribbons) => this.allRibbons.set(ribbons));
    this.datasetService.loadMoves().subscribe((moves) => this.allMoves.set(moves));
    this.datasetService.getSimplePokemonList().subscribe((pokemonList) => {
      this.allPokemon.set(pokemonList);
    });
  }

  loadAllowedMovesFromPokeApi(data: DatasetPokemon) {
    const slug = data.refs?.pkApiFormSlug || data.refs?.pkApiId || data.id;
    this.datasetService.loadPokemonMovesFromPokeApi(slug).subscribe((moveIds) => {
      this.allowedMoveIds.set(moveIds);
    });
  }

  updateSpritePreview() {
    const data = this.pokemonData();
    if (!data) return;
    this.currentSpriteUrl.set(
      this.datasetService.getSpriteUrl(data, this.form.get('isShiny')?.value || false),
    );
  }

  toggleShinyPreview() {
    const v = this.form.get('isShiny')?.value;
    this.form.patchValue({ isShiny: !v });
    this.updateSpritePreview();
  }

  onCaughtChange() {
    const caught = this.form.get('isOwned')?.value;
    if (caught && !this.form.get('storedIn')?.value) {
      this.form.patchValue({ storedIn: 'home' });
    }
    if (caught && !this.form.get('ability')?.value) {
      const data = this.pokemonData();
      if (data?.ability1) {
        this.form.patchValue({ ability: this.findAbilityName(data.ability1) });
      }
    }
    if (caught && !this.form.get('originLanguage')?.value) {
      const browserLang = navigator.language.toLowerCase();
      let lang = 'ENG';
      if (browserLang.startsWith('de')) lang = 'DEU';
      else if (browserLang.startsWith('ja')) lang = 'JPN';
      else if (browserLang.startsWith('fr')) lang = 'FRA';
      else if (browserLang.startsWith('es')) lang = 'ESP';
      else if (browserLang.startsWith('it')) lang = 'ITA';
      this.form.patchValue({ originLanguage: lang });
    }
  }

  findAbilityName(slug: string): string {
    const match = this.allAbilities().find((a) => a.id === slug);
    return match ? match.name : slug;
  }

  isTrainerCompatible(trainer: Trainer): boolean {
    if (!trainer.game) return true;
    return this.availableGames().some((game) => game.id === trainer.game);
  }

  onTrainerSelect(trainerId: string) {
    if (!trainerId) return;
    const trainer = this.trainers().find((t) => t.id === trainerId);
    if (trainer) {
      if (!this.isTrainerCompatible(trainer)) return;

      this.form.patchValue({
        originalTrainer: trainer.name,
        trainerId: trainer.trainerId,
      });

      if (trainer.game && this.isObtainableIn(trainer.game)) {
        this.form.patchValue({ originGame: trainer.game });
      }
    }
  }

  onRibbonsChanged(ribbons: string[]) {
    this.selectedRibbons.set(ribbons);
    const control = this.form.get('ribbons');
    if (control) {
      control.setValue(ribbons);
      control.markAsDirty();
    }
  }

  onMarksChanged(marks: string[]) {
    this.selectedMarks.set(marks);
    const control = this.form.get('marks');
    if (control) {
      control.setValue(marks);
      control.markAsDirty();
    }
  }

  async save() {
    if (this.saving()) return;
    this.saving.set(true);

    const fv = this.form.value;

    if (fv.originalTrainer?.trim()) {
      let matchingTrainer = this.trainers().find(
        (t) => t.name.toLowerCase() === fv.originalTrainer!.trim().toLowerCase(),
      );

      if (fv.trainerId?.trim()) {
        matchingTrainer = this.trainers().find(
          (t) =>
            t.name.toLowerCase() === fv.originalTrainer!.trim().toLowerCase() &&
            t.trainerId === fv.trainerId!.trim(),
        );
      }

      if (!matchingTrainer && fv.originGame) {
        this.saving.set(false);
        this.showTrainerPromptDialog.set(true);
        return;
      }
    }

    await this.executeSave();
  }

  async acceptTrainerSave() {
    this.showTrainerPromptDialog.set(false);
    this.saving.set(true);
    try {
      const fv = this.form.value;
      await this.firestoreService.createTrainer({
        name: fv.originalTrainer!.trim(),
        trainerId: fv.trainerId?.trim() || '',
        game: fv.originGame || '',
      });
      this.toastService.success('Trainer saved successfully!');
    } catch (e) {
      console.error(e);
      this.toastService.error('Error saving trainer.');
    }
    await this.executeSave();
  }

  async declineTrainerSave() {
    this.showTrainerPromptDialog.set(false);
    this.toastService.info('Note: You can disable this prompt in the profile settings.');
    this.saving.set(true);
    await this.executeSave();
  }

  async executeSave() {
    try {
      const fv = this.form.value;
      const updates: any = {
        pokemonSlug: this.localPokemonSlug() || null,
        isOwned: fv.isOwned,
        isEvent: fv.isEvent,
        isShiny: fv.isShiny,
        isGmax: fv.isGmax,
        isAlpha: fv.isAlpha,
        level: fv.level || null,
        ball: fv.ball || null,
        item: fv.item || null,
        originGame: fv.originGame || null,
        storedIn: fv.storedIn || null,
        nickname: fv.nickname || null,
        originLanguage: fv.originLanguage || null,
        originalTrainer: fv.originalTrainer || null,
        trainerId: fv.trainerId || null,
        customName: fv.customName || null,
        notes: fv.notes || null,
        ability: fv.ability || null,
        nature: fv.nature || null,
        mint: fv.mint || null,
        teraType: fv.teraType || null,
        hyperTrained: fv.hyperTrained?.length ? fv.hyperTrained : null,
        mark: fv.marks?.length ? fv.marks[0] : fv.mark || null,
        ribbon: fv.ribbons?.length ? fv.ribbons[0] : fv.ribbon || null,
        ribbons: fv.ribbons?.length ? fv.ribbons : null,
        marks: fv.marks?.length ? fv.marks : null,
        size: fv.size || null,
        gender: fv.gender || null,
        moves: [fv.move1 || '', fv.move2 || '', fv.move3 || '', fv.move4 || ''],
        ivs: { ...fv.ivs },
        evs: { ...fv.evs },
        updatedAt: new Date().toISOString(),
      };
      Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

      await this.firestoreService.updateSlot(
        this.dexId(),
        this.boxNumber(),
        this.pokemon().position,
        updates,
      );

      this.saved.emit();
      this.lastSavedAt.set(new Date());
      this.justSaved.set(true);
      this.form.markAsPristine();
      this.toastService.success('Pokemon saved successfully');
    } catch (e) {
      this.toastService.error(`Error ${e} saving Pokemon`);
    } finally {
      this.saving.set(false);
    }
  }

  onPokemonChange(newPokemonSlug: string | null) {
    if (!newPokemonSlug) {
      this.pokemonData.set(null);
      this.currentSpriteUrl.set('');
      this.localPokemonSlug.set(null);
      return;
    }
    this.localPokemonSlug.set(newPokemonSlug);
    this.datasetService.loadPokemonBySlug(newPokemonSlug).subscribe((data) => {
      this.pokemonData.set(data);
      this.updateSpritePreview();
    });
  }

  onGenderChange(newGender: string) {
    this.form.patchValue({ gender: newGender });

    const currentSlug = this.localPokemonSlug();
    if (!currentSlug) return;

    const baseSlug = currentSlug.replace(/-(f|m)$/, '');

    if (newGender === 'female') {
      const femaleSlug = `${baseSlug}-f`;
      const femaleExists = this.allPokemon().some((p) => p.slug === femaleSlug);
      if (femaleExists && currentSlug !== femaleSlug) {
        this.onPokemonChange(femaleSlug);
      }
    } else {
      // For male or genderless, switch back to base slug if we were on a female form
      if (currentSlug !== baseSlug) {
        const baseExists = this.allPokemon().some((p) => p.slug === baseSlug);
        if (baseExists) {
          this.onPokemonChange(baseSlug);
        }
      }
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
