import {
  Component,
  input,
  output,
  signal,
  inject,
  HostListener,
  computed,
  Renderer2,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { BoxSlot } from '../../../shared/models/dex.model';
import { ThemeService } from '../../../core/services/theme.service';
import { NatureData, RibbonData, MarkData, MoveData } from '../../../shared/models/dataset.model';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { DatasetPokemon } from '../../../shared/models/dataset.model';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { PokemonViewGeneralComponent } from './components/pokemon-view-general.component';
import { PokemonViewMovesComponent } from './components/pokemon-view-moves.component';
import { PokemonViewRibbonsComponent } from './components/pokemon-view-ribbons.component';
import { PokemonViewStatsComponent } from './components/pokemon-view-stats.component';
import { PokemonViewOriginComponent } from './components/pokemon-view-origin.component';
import { PokemonViewHeaderComponent } from './components/pokemon-view-header.component';
import { GameDataService } from '../../../core/services/game-data.service';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';
import { DOCUMENT } from '@angular/common';
import { DialogSidebarComponent } from '../../../shared/components/dialog-sidebar/dialog-sidebar.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-pokemon-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TooltipDirective,
    PokemonViewHeaderComponent,
    PokemonViewGeneralComponent,
    PokemonViewMovesComponent,
    PokemonViewRibbonsComponent,
    PokemonViewStatsComponent,
    PokemonViewOriginComponent,
    DialogSidebarComponent,
    IconComponent,
  ],
  templateUrl: './pokemon-view-dialog.component.html',
  styles: [],
})
export class PokemonViewDialogComponent implements OnInit, OnDestroy {
  datasetService = inject(DatasetService);
  themeService = inject(ThemeService);
  langService = inject(PokemonLanguageService);
  gameDataService = inject(GameDataService);
  renderer = inject(Renderer2);
  document = inject(DOCUMENT);

  pokemon = input.required<BoxSlot>();
  dexId = input.required<string>();
  boxNumber = input.required<number>();
  initialTab = input<number>(0);

  closed = output<void>();
  previous = output<void>();
  next = output<void>();
  edit = output<number>();

  pokemonData = signal<DatasetPokemon | null>(null);
  allNatures = signal<NatureData[]>([]);
  allRibbons = signal<RibbonData[]>([]);
  allMarks = signal<MarkData[]>([]);
  allMoves = signal<MoveData[]>([]);
  activeTabIndex = signal<number>(0);

  constructor() {
    toObservable(this.pokemon)
      .pipe(
        switchMap((pkmn) => {
          if (pkmn.pokemonSlug) {
            return this.datasetService.loadPokemonBySlug(pkmn.pokemonSlug);
          }
          return of(null);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((data) => {
        this.pokemonData.set(data);
      });

    this.datasetService.loadNatures().subscribe((natures) => this.allNatures.set(natures));
    this.datasetService.loadRibbons().subscribe((ribbons) => this.allRibbons.set(ribbons));
    this.datasetService.loadMarks().subscribe((marks) => this.allMarks.set(marks));
    this.datasetService.loadMoves().subscribe((moves) => this.allMoves.set(moves));
  }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'overflow-hidden');
    this.activeTabIndex.set(this.initialTab());
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'overflow-hidden');
  }

  equippedRibbons = computed(() => {
    const pkmn = this.pokemon();
    const ids =
      pkmn.ribbons && pkmn.ribbons.length > 0 ? pkmn.ribbons : pkmn.ribbon ? [pkmn.ribbon] : [];
    return ids.map((id) => {
      const found = this.allRibbons().find((r) => r.id === id);
      return {
        id,
        name: found ? found.name : id,
        spriteUrl: found ? `${found.id}.png` : '',
      };
    });
  });

  equippedMarks = computed(() => {
    const pkmn = this.pokemon();
    const ids = pkmn.marks && pkmn.marks.length > 0 ? pkmn.marks : pkmn.mark ? [pkmn.mark] : [];
    return ids.map((id) => {
      const found = this.allMarks().find((m) => m.id === id);
      return {
        id,
        name: found ? found.name : id,
        spriteUrl: found ? `${found.id}.png` : '',
      };
    });
  });

  localizedName = computed(() => {
    const data = this.pokemonData();
    return data ? this.langService.getName(data) : '';
  });

  localizedGenus = computed(() => {
    const data = this.pokemonData();
    if (!data) return 'Pokémon';
    const lang = this.langService.currentLang();
    return data.genus?.[lang] || data.genus?.['eng'] || 'Pokémon';
  });

  natureName = computed(() => {
    const natureId = this.pokemon().nature;
    if (!natureId) return '—';
    const nature = this.allNatures().find((n) => n.id === natureId);
    return nature ? this.capitalize(nature.name) : this.capitalize(natureId);
  });

  size = computed(() => {
    const sizeId = this.pokemon().size;
    if (!sizeId) return '—';

    return this.capitalize(sizeId);
  });

  originGameName = computed(() => {
    const gameCode = this.pokemon().originGame;
    return gameCode ? this.gameDataService.getFullGameName(gameCode) : '—';
  });

  originGameIcon = computed(() => {
    const gameCode = this.pokemon().originGame;
    return gameCode ? this.gameDataService.getGameIconPath(gameCode) : '';
  });

  storedInGameName = computed(() => {
    const gameCode = this.pokemon().storedIn;
    return gameCode ? this.gameDataService.getFullGameName(gameCode) : '—';
  });

  storedInGameIcon = computed(() => {
    const gameCode = this.pokemon().storedIn;
    return gameCode ? this.gameDataService.getGameIconPath(gameCode) : '';
  });

  originMark = computed(() => {
    const gameCode = this.pokemon().originGame;
    return gameCode ? this.gameDataService.getGameOriginMark(gameCode) : null;
  });

  spriteUrl = computed(() => {
    const data = this.pokemonData();
    const isShiny = this.pokemon().isShiny;

    if (!data) return '';
    return this.datasetService.getSpriteUrl(data, isShiny);
  });

  formattedMoves = computed(() => {
    const pkmn = this.pokemon();
    const moves = (pkmn as any).moves || [];
    const padded = [...moves];
    while (padded.length < 4) {
      padded.push('');
    }
    return padded.slice(0, 4);
  });

  hasAnyMove(pkmn: BoxSlot): boolean {
    const moves = (pkmn as any).moves;
    if (!moves || !Array.isArray(moves)) return false;
    return moves.some((move) => move && move.trim() !== '');
  }

  formatMoveName(move: string | undefined | null): string {
    if (!move) return '—';
    return move
      .split('-')
      .map((word) => this.capitalize(word))
      .join(' ');
  }

  capitalize(str: string | undefined | null): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
