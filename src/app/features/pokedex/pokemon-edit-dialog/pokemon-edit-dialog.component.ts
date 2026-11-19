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
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
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
import {
  PokemonLanguageService,
  POKEMON_LANGUAGES,
} from '../../../core/services/pokemon-language.service';
import { ToastService } from '../../../core/services/toast.service';
import { GameDataService } from '../../../core/services/game-data.service';
import { DropdownOptionService } from '../../../core/services/dropdown-option.service';
import { TypeColorService } from '../../../core/services/type-color.service';
import { PokemonEditHeaderComponent } from './components/pokemon-edit-header.component';
import { PokemonEditStatsComponent } from './components/pokemon-edit-stats.component';
import { PokemonEditAttributesComponent } from './components/pokemon-edit-general.component';
import { PokemonEditMovesComponent } from './components/pokemon-edit-moves.component';
import { PokemonEditRibbonsComponent } from './components/pokemon-edit-ribbons.component';
import { PokemonEditOriginComponent } from './components/pokemon-edit-origin.component';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';
import { DialogSidebarComponent } from '../../../shared/components/dialog-sidebar/dialog-sidebar.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-pokemon-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PokemonEditHeaderComponent,
    PokemonEditStatsComponent,
    PokemonEditAttributesComponent,
    PokemonEditMovesComponent,
    PokemonEditRibbonsComponent,
    PokemonEditOriginComponent,
    TooltipDirective,
    DialogSidebarComponent,
    IconComponent,
  ],
  templateUrl: './pokemon-edit-dialog.component.html',
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
  private typeColorService = inject(TypeColorService);
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

  teraTypeOptions = computed<CustomDropdownOption[]>(() =>
    this.dropdownOptionService.mapTypes(this.typeColorService.getAllTypes()),
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

  baseStats = computed<StatsMap | undefined>(() => {
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
      const code = this.langService.detectFromBrowser();
      const badge = POKEMON_LANGUAGES.find((l) => l.code === code)?.badge || 'ENG';
      this.form.patchValue({ originLanguage: badge });
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

  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
