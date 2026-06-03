import {
  Component,
  input,
  output,
  signal,
  computed,
  OnInit,
  inject,
  HostListener,
  effect,
} from '@angular/core';
import { AVAILABLE_SPRITES } from '../../../core/constants/available-sprites.constants';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  getAvailableGamesForPokemon,
  GameDefinition,
  GAME_CODES,
} from '../../../shared/models/game-definitions';
import { BoxSlot, StatsMap } from '../../../shared/models/dex.model';
import { Trainer } from '../../../shared/models/trainer.model';
import {
  DatasetService,
  DatasetPokemon,
  SimplePokemon,
} from '../../../core/api/services/dataset.service';
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
import { getGameIconPath } from '../../../core/constants/game-data.constants';
import { PokemonEditHeaderComponent } from './components/pokemon-edit-header.component';
import { PokemonEditStatsComponent } from './components/pokemon-edit-stats.component';
import { PokemonEditAttributesComponent } from './components/pokemon-edit-attributes.component';
import { CustomDropdownComponent } from '../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-pokemon-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PokemonEditHeaderComponent,
    PokemonEditStatsComponent,
    PokemonEditAttributesComponent,
    CustomDropdownComponent,
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
        class="bg-surface border border-theme rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        @if (pokemon(); as pkmn) {
          <div class="p-6 pb-4 relative flex-none border-b border-theme bg-surface z-20">
            <div class="flex items-start justify-between">
              <app-pokemon-edit-header
                [pokemonData]="pokemonData()"
                [currentSpriteUrl]="currentSpriteUrl()"
                [localPokemonSlug]="localPokemonSlug()"
                [ball]="ball"
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

          <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="flex flex-col gap-[18px]">
                <app-pokemon-edit-attributes
                  [pokemonData]="pokemonData()"
                  [genderState]="genderState()"
                  [languageOptions]="languageOptions()"
                  [pokeballOptions]="pokeballOptions()"
                  [itemOptions]="itemOptions()"
                  [ribbonOptions]="ribbonOptions()"
                  [markOptions]="markOptions()"
                  [trainerOptions]="trainerOptions()"
                  [originGameOptions]="originGameOptions()"
                  [(isEvent)]="isEvent"
                  [(isGmax)]="isGmax"
                  [(isAlpha)]="isAlpha"
                  [(level)]="level"
                  [(originLanguage)]="originLanguage"
                  [(gender)]="gender"
                  [(ball)]="ball"
                  [(item)]="item"
                  [(ribbon)]="ribbon"
                  [(mark)]="mark"
                  [(originalTrainer)]="originalTrainer"
                  [(trainerId)]="trainerId"
                  [(originGame)]="originGame"
                  [storedInOptions]="storedInOptions()"
                  [(storedIn)]="storedIn"
                  [(nickname)]="nickname"
                  [(notes)]="notes"
                  [(isOwned)]="isOwned"
                  (isOwnedChange)="onCaughtChange()"
                  [(isShiny)]="isShiny"
                  (isShinyChange)="updateSpritePreview()"
                  (trainerSelected)="onTrainerSelect($event)"
                ></app-pokemon-edit-attributes>
              </div>
              <div class="flex flex-col gap-[18px]">
                <div class="grid grid-cols-2 gap-4">
                  <app-custom-dropdown
                    [label]="'Nature'"
                    [options]="natureOptions()"
                    [selectedId]="nature"
                    [placeholder]="'Select Nature'"
                    (valueChanged)="nature = $event"
                  />
                  <app-custom-dropdown
                    [label]="'Ability'"
                    [options]="abilityOptions()"
                    [selectedId]="ability"
                    [placeholder]="'Select Ability'"
                    [searchable]="false"
                    (valueChanged)="onAbilityChange($event)"
                  />
                </div>

                <app-pokemon-edit-stats
                  [ivs]="ivs"
                  [evs]="evs"
                  (ivsChanged)="ivs = $event"
                  (evsChanged)="evs = $event"
                ></app-pokemon-edit-stats>

                <div class="grid grid-cols-2 gap-4">
                  <app-custom-dropdown
                    [label]="'Move 1'"
                    [options]="moveOptions()"
                    [selectedId]="move1"
                    [placeholder]="'Select Move 1'"
                    [searchable]="true"
                    (valueChanged)="move1 = $event"
                  />
                  <app-custom-dropdown
                    [label]="'Move 2'"
                    [options]="moveOptions()"
                    [selectedId]="move2"
                    [placeholder]="'Select Move 2'"
                    [searchable]="true"
                    (valueChanged)="move2 = $event"
                  />
                  <app-custom-dropdown
                    [label]="'Move 3'"
                    [options]="moveOptions()"
                    [selectedId]="move3"
                    [placeholder]="'Select Move 3'"
                    [searchable]="true"
                    (valueChanged)="move3 = $event"
                  />
                  <app-custom-dropdown
                    [label]="'Move 4'"
                    [options]="moveOptions()"
                    [selectedId]="move4"
                    [placeholder]="'Select Move 4'"
                    [searchable]="true"
                    (valueChanged)="move4 = $event"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 pt-4 border-t border-theme flex-none bg-surface z-10">
            <div class="flex justify-between items-center">
              <div class="text-xs text-secondary">Last updated: {{ 'Just now' }}</div>
              <div class="flex gap-3">
                <button
                  (click)="close()"
                  class="px-5 py-2 rounded-lg font-medium text-secondary hover:bg-secondary/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  (click)="save()"
                  [disabled]="saving()"
                  class="px-6 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {{ saving() ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
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
            The trainer "<span class="font-bold">{{ originalTrainer }}</span
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
export class PokemonEditDialogComponent implements OnInit {
  pokemon = input.required<BoxSlot>();
  dexId = input.required<string>();
  boxNumber = input.required<number>();

  closed = output<void>();
  saved = output<void>();

  localPokemonSlug = signal<string | null>(null);
  showTrainerPromptDialog = signal(false);

  private datasetService = inject(DatasetService);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);
  private langService = inject(PokemonLanguageService);

  constructor() {
    effect(() => {
      const state = this.genderState();
      setTimeout(() => {
        if (!state.canMale && !state.canFemale) {
          if (this.gender !== '') this.gender = '';
        } else if (state.canMale && !state.canFemale) {
          if (this.gender !== 'male') this.gender = 'male';
        } else if (!state.canMale && state.canFemale) {
          if (this.gender !== 'female') this.gender = 'female';
        }
      });
    });
  }

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

  ribbonOptions = computed<CustomDropdownOption[]>(() => {
    return this.allRibbons()
      .map((ribbon) => ({
        id: ribbon.id,
        name: ribbon.name,
        description: ribbon.shortDesc,
        category: `Gen ${ribbon.gen}`,
        iconPath: AVAILABLE_SPRITES.ribbons.has(ribbon.id) ? `${ribbon.id}.png` : undefined,
        cdnFolder: 'ribbons',
      }))
      .sort((a, b) => {
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA;
        return a.name.localeCompare(b.name);
      });
  });

  markOptions = computed<CustomDropdownOption[]>(() => {
    return this.allMarks()
      .map((mark) => ({
        id: mark.id,
        name: mark.name,
        description: mark.shortDesc,
        category: `Gen ${mark.gen}`,
        iconPath: AVAILABLE_SPRITES.marks.has(mark.id) ? `${mark.id}.png` : undefined,
        cdnFolder: 'marks',
      }))
      .sort((a, b) => {
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA;
        return a.name.localeCompare(b.name);
      });
  });

  pokemonSearchOptions = computed<CustomDropdownOption[]>(() => {
    return this.allPokemon().map((p) => ({
      id: p.slug,
      name: p.name,
      description: p.nameGerman && p.nameGerman !== p.name ? p.nameGerman : '',
      searchTerms: p.allNames ? Object.values(p.allNames).filter((n) => n) : [],
    }));
  });

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

  natureOptions = computed<CustomDropdownOption[]>(() => {
    return this.allNatures().map((nat) => {
      let desc = '';
      let descHtml = '';
      if (nat.raises && nat.lowers) {
        desc = `(+${this.getNatureStatLabel(nat.raises)} -${this.getNatureStatLabel(nat.lowers)})`;
        descHtml = `(<span class="text-[#e46787] font-bold">+${this.getNatureStatLabel(nat.raises)}</span> <span class="text-[#3babdf] font-bold">-${this.getNatureStatLabel(nat.lowers)}</span>)`;
      }
      return {
        id: nat.id,
        name: nat.name,
        description: desc,
        descriptionHtml: descHtml,
      };
    });
  });

  languageOptions = computed<CustomDropdownOption[]>(() => {
    return [
      { id: '', name: 'None' },
      { id: 'ENG', name: 'ENG', description: 'English' },
      { id: 'DEU', name: 'DEU', description: 'German' },
      { id: 'JPN', name: 'JPN', description: 'Japanese' },
      { id: 'FRA', name: 'FRA', description: 'French' },
      { id: 'ITA', name: 'ITA', description: 'Italian' },
      { id: 'ESP', name: 'ESP', description: 'Spanish' },
      { id: 'KOR', name: 'KOR', description: 'Korean' },
      { id: 'CHS', name: 'CHS', description: 'Chinese (Simp)' },
      { id: 'CHT', name: 'CHT', description: 'Chinese (Trad)' },
    ];
  });

  trainerOptions = computed<CustomDropdownOption[]>(() => {
    return this.trainers().map((trainer) => ({
      id: trainer.id,
      name: trainer.name,
      description: `(${trainer.game})${!this.isTrainerCompatible(trainer) ? ' — incompatible' : ''}`,
      category: !this.isTrainerCompatible(trainer) ? 'Incompatible' : 'Compatible',
    }));
  });

  pokeballOptions = computed<CustomDropdownOption[]>(() => {
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

  itemOptions = computed<CustomDropdownOption[]>(() => {
    const categoryLabels: Record<string, string> = {
      ball: 'Poké Ball',
      berry: 'Berry',
      other: 'Item',
    };

    return this.allItems().map((item) => ({
      id: item.id,
      name: item.name,
      description: item.shortDesc,
      category: categoryLabels[item.category] ?? item.category,
      iconPath: AVAILABLE_SPRITES.items.has(item.id) ? `${item.id}.png` : undefined,
      cdnFolder: 'items',
    }));
  });

  moveOptions = computed<CustomDropdownOption[]>(() => {
    return [
      { id: '', name: 'None', description: 'Empty move slot' },
      ...this.allMoves().map((m) => ({
        id: m.id,
        name: m.name,
        description: `${m.type.charAt(0).toUpperCase() + m.type.slice(1)} | Power: ${m.power || '—'} | PP: ${m.pp}`,
        category: `Generation ${m.gen}`,
      })),
    ];
  });

  pokemonGenus = computed(() => {
    const data = this.pokemonData();
    if (!data) return 'Pokémon';
    const lang = this.langService.currentLang();
    return data.genus?.[lang] || data.genus?.['eng'] || 'Pokémon';
  });

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

  onAbilityChange(newAbility: string) {
    this.ability = newAbility;
  }

  isOwned = false;
  isEvent = false;
  isShiny = false;
  isGmax = false;
  isAlpha = false;
  level?: number;
  ball = '';
  item = '';
  originGame = '';
  storedIn = '';
  nickname = '';
  originLanguage = '';
  originalTrainer = '';
  trainerId = '';
  customName = '';
  notes = '';
  ability = '';
  nature = '';
  mark = '';
  ribbon = '';
  gender = '';
  move1 = '';
  move2 = '';
  move3 = '';
  move4 = '';

  ivs: StatsMap = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  evs: StatsMap = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

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
    return getAvailableGamesForPokemon(Array.from(validGames));
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

  originGameOptions = computed<CustomDropdownOption[]>(() => {
    const options: CustomDropdownOption[] = [
      { id: '', name: 'None', description: 'No Origin Game selected', category: 'Options' },
    ];

    this.availableGamesByGen().forEach((group) => {
      group.games.forEach((game) => {
        options.push({
          id: game.code,
          name: game.fullName,
          category: group.label,

          iconPath: getGameIconPath(game.code) || undefined,
        });
      });
    });

    return options;
  });

  storedInOptions = computed<CustomDropdownOption[]>(() => {
    const options: CustomDropdownOption[] = [
      { id: '', name: 'None', description: 'Not Stored / Unknown', category: 'Options' },
    ];

    const allowedCodes = [
      'home',
      'sv-s',
      'sv-v',
      'swsh-sw',
      'swsh-sh',
      'bdsp-bd',
      'bdsp-sp',
      'la',
      'lgpe-lgp',
      'lgpe-lge',
    ];

    allowedCodes.forEach((code) => {
      const game = GAME_CODES[code];
      if (game) {
        options.push({
          id: game.code,
          name: game.fullName,
          category: game.gen === 0 ? 'Special' : `Generation ${game.gen}`,
          iconPath: getGameIconPath(game.code) || undefined,
        });
      }
    });

    return options;
  });

  onOriginGameChange(gameCode: string) {
    this.originGame = gameCode;
  }

  isObtainableIn(gameCode: string): boolean {
    const pokemon = this.pokemonData();
    return pokemon?.obtainableIn?.includes(gameCode) || false;
  }

  ngOnInit() {
    const pkmn = this.pokemon();
    this.localPokemonSlug.set(pkmn.pokemonSlug);
    this.isOwned = pkmn.isOwned;
    this.isEvent = pkmn.isEvent || false;
    this.isShiny = pkmn.isShiny;
    this.isGmax = pkmn.isGmax || false;
    this.isAlpha = pkmn.isAlpha || false;
    this.customName = pkmn.customName || '';
    this.notes = pkmn.notes || '';
    this.level = pkmn.level;
    this.ball = pkmn.ball || '';
    this.originGame = pkmn.originGame || '';
    this.storedIn = pkmn.storedIn || 'home';
    this.nickname = pkmn.nickname || '';
    this.originLanguage = pkmn.originLanguage || '';
    this.originalTrainer = pkmn.originalTrainer || '';
    this.trainerId = pkmn.trainerId || '';
    this.item = pkmn.item || '';
    this.ability = pkmn.ability || '';
    this.nature = pkmn.nature || '';
    this.mark = pkmn.mark || '';
    this.ribbon = pkmn.ribbon || '';
    this.gender = pkmn.gender || '';
    this.move1 = pkmn.moves?.[0] || '';
    this.move2 = pkmn.moves?.[1] || '';
    this.move3 = pkmn.moves?.[2] || '';
    this.move4 = pkmn.moves?.[3] || '';
    if (pkmn.ivs) this.ivs = { ...pkmn.ivs };
    if (pkmn.evs) this.evs = { ...pkmn.evs };

    this.loadData();
  }

  loadData() {
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

    if (this.localPokemonSlug()) {
      this.datasetService.loadPokemonBySlug(this.localPokemonSlug()!).subscribe((data) => {
        this.pokemonData.set(data);
        this.updateSpritePreview();
      });
    }
  }

  updateSpritePreview() {
    const data = this.pokemonData();
    if (!data) return;
    this.currentSpriteUrl.set(this.datasetService.getSpriteUrl(data, this.isShiny));
  }

  toggleShinyPreview() {
    this.isShiny = !this.isShiny;
    this.updateSpritePreview();
  }

  onCaughtChange() {
    if (this.isOwned) {
      if (!this.storedIn) {
        this.storedIn = 'home';
      }
      this.onAbilityChange(this.ability);
      if (!this.originLanguage) {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('de')) {
          this.originLanguage = 'DEU';
        } else if (browserLang.startsWith('ja')) {
          this.originLanguage = 'JPN';
        } else if (browserLang.startsWith('fr')) {
          this.originLanguage = 'FRA';
        } else if (browserLang.startsWith('es')) {
          this.originLanguage = 'ESP';
        } else if (browserLang.startsWith('it')) {
          this.originLanguage = 'ITA';
        } else {
          this.originLanguage = 'ENG'; // Default to English
        }
      }
      if (!this.ability && this.pokemonData()) {
        const pokemon = this.pokemonData();
        if (pokemon?.ability1) {
          this.ability = this.findAbilityName(pokemon.ability1);
        }
        if (pokemon?.isGmax) {
          this.isGmax = true;
        }
      }
    }
  }

  findAbilityName(slug: string): string {
    const match = this.allAbilities().find((a) => a.id === slug);
    return match ? match.name : slug;
  }

  getNatureStatLabel(stat: string): string {
    const labels: Record<string, string> = {
      atk: 'Atk',
      def: 'Def',
      spa: 'SpA',
      spd: 'SpD',
      spe: 'Spe',
    };
    return labels[stat] || stat;
  }

  isTrainerCompatible(trainer: Trainer): boolean {
    if (!trainer.game) return true;
    return this.availableGames().some((game) => game.code === trainer.game);
  }

  onTrainerSelect(trainerId: string) {
    if (!trainerId) return;
    const trainer = this.trainers().find((t) => t.id === trainerId);
    if (trainer) {
      if (!this.isTrainerCompatible(trainer)) return;

      this.originalTrainer = trainer.name;
      this.trainerId = trainer.trainerId;
      if (trainer.game && this.isObtainableIn(trainer.game)) {
        this.originGame = trainer.game;
      }
    }
  }

  async save() {
    this.saving.set(true);

    if (this.originalTrainer.trim() !== '') {
      const promptDisabled = localStorage.getItem('disableAutoTrainerPrompt') === 'true';
      if (!promptDisabled) {
        const trainerExists = this.trainers().some(
          (trainer) => trainer.name.toLowerCase() === this.originalTrainer.trim().toLowerCase(),
        );
        if (!trainerExists) {
          this.saving.set(false);
          this.showTrainerPromptDialog.set(true);
          return;
        }
      }
    }

    await this.executeSave();
  }

  async acceptTrainerSave() {
    this.showTrainerPromptDialog.set(false);
    this.saving.set(true);
    try {
      await this.firestoreService.createTrainer({
        name: this.originalTrainer.trim(),
        trainerId: this.trainerId?.trim() || '',
        game: this.originGame || '',
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
      const updates: any = {
        pokemonSlug: this.localPokemonSlug() || null,
        isOwned: this.isOwned,
        isEvent: this.isEvent,
        isShiny: this.isShiny,
        isGmax: this.isGmax,
        isAlpha: this.isAlpha,
        level: this.level || null,
        ball: this.ball || null,
        item: this.item || null,
        originGame: this.originGame || null,
        storedIn: this.storedIn || null,
        nickname: this.nickname || null,
        originLanguage: this.originLanguage || null,
        originalTrainer: this.originalTrainer || null,
        trainerId: this.trainerId || null,
        customName: this.customName || null,
        notes: this.notes || null,
        ability: this.ability || null,
        nature: this.nature || null,
        mark: this.mark || null,
        ribbon: this.ribbon || null,
        gender: this.gender || null,
        moves: [this.move1 || '', this.move2 || '', this.move3 || '', this.move4 || ''],
        ivs: { ...this.ivs },
        evs: { ...this.evs },
      };
      Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

      await this.firestoreService.updateSlot(
        this.dexId(),
        this.boxNumber(),
        this.pokemon().position,
        updates,
      );

      this.saved.emit();
      this.close();
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
