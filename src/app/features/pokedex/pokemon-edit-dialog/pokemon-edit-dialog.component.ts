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
import { BoxSlot } from '../../../shared/models/dex.model';
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
import { PokemonEditAttributesComponent } from './components/pokemon-edit-attributes.component';
import { CustomDropdownComponent } from '../../../shared/components/custom-dropdown/custom-dropdown.component';

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
                  [form]="form"
                  (trainerSelected)="onTrainerSelect($event)"
                ></app-pokemon-edit-attributes>
              </div>
              <div class="flex flex-col gap-[18px]">
                <div class="grid grid-cols-2 gap-4">
                  <app-custom-dropdown
                    [label]="'Nature'"
                    [options]="natureOptions()"
                    [selectedId]="form.get('nature')?.value || ''"
                    [placeholder]="'Select Nature'"
                    (valueChanged)="form.get('nature')?.setValue($event)"
                  />
                  <app-custom-dropdown
                    [label]="'Ability'"
                    [options]="abilityOptions()"
                    [selectedId]="form.get('ability')?.value || ''"
                    [placeholder]="'Select Ability'"
                    [searchable]="false"
                    (valueChanged)="form.get('ability')?.setValue($event)"
                  />
                </div>

                <app-pokemon-edit-stats
                  [ivs]="form.get('ivs')?.value!"
                  [evs]="form.get('evs')?.value!"
                  [raisedStat]="selectedNature?.raises || null"
                  [loweredStat]="selectedNature?.lowers || null"
                  (ivsChanged)="form.get('ivs')?.setValue($event)"
                  (evsChanged)="form.get('evs')?.setValue($event)"
                ></app-pokemon-edit-stats>

                <div class="grid grid-cols-2 gap-4">
                  <app-custom-dropdown
                    [label]="'Move 1'"
                    [options]="moveOptions()"
                    [selectedId]="form.get('move1')?.value || ''"
                    [placeholder]="'Select Move'"
                    [searchable]="true"
                    (valueChanged)="form.get('move1')?.setValue($event)"
                  />
                  <app-custom-dropdown
                    [label]="'Move 2'"
                    [options]="moveOptions()"
                    [selectedId]="form.get('move2')?.value || ''"
                    [placeholder]="'Select Move'"
                    [searchable]="true"
                    (valueChanged)="form.get('move2')?.setValue($event)"
                  />
                  <app-custom-dropdown
                    [label]="'Move 3'"
                    [options]="moveOptions()"
                    [selectedId]="form.get('move3')?.value || ''"
                    [placeholder]="'Select Move'"
                    [searchable]="true"
                    (valueChanged)="form.get('move3')?.setValue($event)"
                  />
                  <app-custom-dropdown
                    [label]="'Move 4'"
                    [options]="moveOptions()"
                    [selectedId]="form.get('move4')?.value || ''"
                    [placeholder]="'Select Move'"
                    [searchable]="true"
                    (valueChanged)="form.get('move4')?.setValue($event)"
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

  closed = output<void>();
  saved = output<void>();

  localPokemonSlug = signal<string | null>(null);
  showTrainerPromptDialog = signal(false);

  private datasetService = inject(DatasetService);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);
  private langService = inject(PokemonLanguageService);
  private gameDataService = inject(GameDataService);
  private dropdownOptionService = inject(DropdownOptionService);
  private fb = inject(FormBuilder);
  renderer = inject(Renderer2);
  document = inject(DOCUMENT);

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
    mark: [''],
    ribbon: [''],
    gender: [''],
    move1: [''],
    move2: [''],
    move3: [''],
    move4: [''],
    ivs: [{ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }],
    evs: [{ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }],
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

  get selectedNature() {
    return this.allNatures().find((n) => n.id === this.form.get('nature')?.value) || null;
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
  moveOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.mapMoves(this.allMoves()),
  );

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
    const pkmn = this.pokemon();
    this.localPokemonSlug.set(pkmn.pokemonSlug);

    this.form
      .get('isOwned')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onCaughtChange());
    this.form
      .get('isShiny')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateSpritePreview());

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
      mark: pkmn.mark || '',
      ribbon: pkmn.ribbon || '',
      gender: pkmn.gender || '',
      move1: pkmn.moves?.[0] || '',
      move2: pkmn.moves?.[1] || '',
      move3: pkmn.moves?.[2] || '',
      move4: pkmn.moves?.[3] || '',
      ivs: pkmn.ivs ? { ...pkmn.ivs } : { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: pkmn.evs ? { ...pkmn.evs } : { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    });

    this.loadData();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'overflow-hidden');
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
        mark: fv.mark || null,
        ribbon: fv.ribbon || null,
        gender: fv.gender || null,
        moves: [fv.move1 || '', fv.move2 || '', fv.move3 || '', fv.move4 || ''],
        ivs: { ...fv.ivs },
        evs: { ...fv.evs },
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
