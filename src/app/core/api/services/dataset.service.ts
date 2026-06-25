import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, shareReplay, switchMap, catchError } from 'rxjs/operators';
import { DexType } from '../../../shared/models/dex.model';
import {
  AbilityData,
  ItemData,
  PokeballData,
  NatureData,
  MarkData,
  RibbonData,
  GameData,
  MoveData,
  DatasetPokemon,
  SimplePokemon,
  PokemonNameIndex,
  DexPokemonMapping,
  BoxPreset,
  MAX_BOX_SIZE,
  MAX_LIVING_DEX_BOXES,
} from '../../../shared/models/dataset.model';

export interface RawPokemonNameIndex {
  id: string;
  names?: { [lang: string]: string };
  dexNum: number;
  type1?: string;
  type2?: string;
  obtainableIn?: string[];
  isDefault?: boolean;
  refs?: { pkApiId?: string };
}

@Injectable({
  providedIn: 'root',
})
export class DatasetService {
  private readonly datasetBasePath = '/dataset/data';
  private pokemonCache = new Map<string, Observable<DatasetPokemon>>();
  private http = inject(HttpClient);

  private pokemonIndexCache: Observable<string[]> | null = null;
  private abilitiesCache: Observable<AbilityData[]> | null = null;
  private itemsCache: Observable<ItemData[]> | null = null;
  private pokeballsCache: Observable<PokeballData[]> | null = null;
  private naturesCache: Observable<NatureData[]> | null = null;
  private marksCache: Observable<MarkData[]> | null = null;
  private ribbonsCache: Observable<RibbonData[]> | null = null;
  private gamesCache: Observable<GameData[]> | null = null;
  private movesCache: Observable<MoveData[]> | null = null;
  private simplePokemonListCache: Observable<SimplePokemon[]> | null = null;

  loadPokemonIndex(): Observable<string[]> {
    if (!this.pokemonIndexCache) {
      this.pokemonIndexCache = this.http
        .get<string[]>(`${this.datasetBasePath}/indices/pokemon.json`)
        .pipe(shareReplay(1));
    }
    return this.pokemonIndexCache;
  }

  loadPokemonBySlug(slug: string): Observable<DatasetPokemon> {
    if (!this.pokemonCache.has(slug)) {
      const pokemon$ = this.http
        .get<DatasetPokemon>(`${this.datasetBasePath}/pokemon/${slug}.json`)
        .pipe(shareReplay(1));
      this.pokemonCache.set(slug, pokemon$);
    }
    return this.pokemonCache.get(slug)!;
  }

  loadPokemonByDexNum(dexNum: number): Observable<DatasetPokemon | null> {
    return this.loadAllPokemon().pipe(
      map((allPokemon) => {
        return allPokemon.find((p) => p.dexNum === dexNum && p.isDefault) || null;
      }),
    );
  }

  loadAllPokemon(): Observable<DatasetPokemon[]> {
    return this.loadPokemonIndex().pipe(
      switchMap((slugs) => {
        const requests = slugs.map((slug) => this.loadPokemonBySlug(slug));
        return forkJoin(requests);
      }),
      shareReplay(1),
    );
  }

  getSimplePokemonList(): Observable<SimplePokemon[]> {
    if (!this.simplePokemonListCache) {
      this.simplePokemonListCache = this.http
        .get<RawPokemonNameIndex[]>(`${this.datasetBasePath}/indices/pokemon-names.json`)
        .pipe(
          map((pokemonList) =>
            pokemonList.map(
              (p) =>
                ({
                  slug: p.id,
                  name: p.names?.['eng'] || p.id,
                  nameGerman: p.names?.['deu'],
                  dexNum: p.dexNum,
                  type1: p.type1 || 'normal',
                  type2: p.type2,
                  obtainableIn: p.obtainableIn || [],
                  isForm: p.isDefault === false,
                  spriteId: p.refs?.pkApiId || '1',
                  allNames: p.names,
                }) as SimplePokemon,
            ),
          ),
          shareReplay(1),
        );
    }
    return this.simplePokemonListCache;
  }

  getDexBoxNames(dexType: DexType): Observable<string[] | undefined> {
    if (dexType === DexType.FORM || dexType === DexType.ORIGIN_FORM) {
      return this.http
        .get<BoxPreset>(`${this.datasetBasePath}/boxpresets/modern/home/grouped-region.json`)
        .pipe(
          map((preset) => preset.boxes.map((box) => box.name)),
          catchError((err) => {
            console.error('Failed to load form dex box names.', err);
            return of(undefined);
          }),
        );
    }

    if (dexType === DexType.STANDARD) {
      return this.http
        .get<string[]>(`${this.datasetBasePath}/indices/personal-dex-boxes.json`)
        .pipe(
          catchError((err) => {
            console.error('Failed to load personal dex box names.', err);
            return of(undefined);
          }),
        );
    }

    if (
      dexType === DexType.LIVING ||
      dexType === DexType.SHINY_LIVING ||
      dexType === DexType.ORIGIN
    ) {
      return this.http
        .get<string[]>(`${this.datasetBasePath}/indices/standard-dex-boxes.json`)
        .pipe(
          map((names) => {
            const allNames = [...names, 'Paldea 1', 'Paldea 2', 'Paldea 3', 'Paldea 4'];
            return allNames.slice(0, MAX_LIVING_DEX_BOXES);
          }),
          catchError((err) => {
            console.error('Failed to load living dex box names.', err);
            return of(undefined);
          }),
        );
    }

    if (dexType === DexType.COMBINED_SHINY_LIVING) {
      return this.http
        .get<string[]>(`${this.datasetBasePath}/indices/standard-dex-boxes.json`)
        .pipe(
          map((names) => {
            const allNames = [...names, 'Paldea 1', 'Paldea 2', 'Paldea 3', 'Paldea 4'];
            const doubledNames: string[] = [];
            allNames.slice(0, MAX_LIVING_DEX_BOXES).forEach((name: string) => {
              doubledNames.push(name, name);
            });
            return doubledNames;
          }),
          catchError((err) => {
            console.error('Failed to load combined shiny living dex box names.', err);
            return of(undefined);
          }),
        );
    }

    return of(undefined);
  }

  createDexMapping(dexType: DexType): Observable<(DexPokemonMapping | null)[]> {
    if (dexType === DexType.FORM || dexType === DexType.ORIGIN_FORM) {
      return this.http
        .get<BoxPreset>(`${this.datasetBasePath}/boxpresets/modern/home/grouped-region.json`)
        .pipe(
          map((preset) => {
            const mapping: (DexPokemonMapping | null)[] = [];
            preset.boxes.forEach((box, boxIndex) => {
              for (let i = 0; i < MAX_BOX_SIZE; i++) {
                const rawSlot = box.slots[i];
                let slug: string | null = null;

                if (typeof rawSlot === 'string') {
                  slug = rawSlot;
                } else if (rawSlot && typeof rawSlot === 'object' && 'pokemon' in rawSlot) {
                  slug = rawSlot.pokemon;
                }

                if (slug) {
                  mapping.push({
                    slug,
                    dexNum: 0,
                    position: boxIndex * MAX_BOX_SIZE + i + 1,
                  });
                } else {
                  mapping.push(null);
                }
              }
            });
            return mapping;
          }),
          catchError((err) => {
            console.error('Failed to load form dex mapping.', err);
            return of([]);
          }),
        );
    }

    if (
      dexType === DexType.LIVING ||
      dexType === DexType.SHINY_LIVING ||
      dexType === DexType.ORIGIN
    ) {
      return this.http
        .get<BoxPreset>(
          `${this.datasetBasePath}/boxpresets/modern/home/sorted-species-minimal.json`,
        )
        .pipe(
          map((preset) => {
            const mapping: (DexPokemonMapping | null)[] = [];
            const isShinyDex = dexType === DexType.SHINY_LIVING;
            preset.boxes.slice(0, MAX_LIVING_DEX_BOXES).forEach((box, boxIndex) => {
              for (let i = 0; i < MAX_BOX_SIZE; i++) {
                const rawSlot = box.slots[i];
                let slug: string | null = null;

                if (typeof rawSlot === 'string') {
                  slug = rawSlot;
                } else if (rawSlot && typeof rawSlot === 'object' && 'pokemon' in rawSlot) {
                  slug = rawSlot.pokemon;
                }

                if (slug) {
                  mapping.push({
                    slug,
                    dexNum: 0,
                    position: boxIndex * MAX_BOX_SIZE + i + 1,
                    isShiny: isShinyDex,
                  });
                } else {
                  mapping.push(null);
                }
              }
            });
            return mapping;
          }),
          catchError((err) => {
            console.error('Failed to load standard dex mapping.', err);
            return of([]);
          }),
        );
    }

    if (dexType === DexType.COMBINED_SHINY_LIVING) {
      return this.http
        .get<BoxPreset>(
          `${this.datasetBasePath}/boxpresets/modern/home/sorted-species-minimal.json`,
        )
        .pipe(
          map((preset) => {
            const mapping: (DexPokemonMapping | null)[] = [];
            let currentBoxIndex = 0;

            preset.boxes.slice(0, MAX_LIVING_DEX_BOXES).forEach((box) => {
              const combinedItems: { slug: string | null; isShiny: boolean }[] = [];

              for (let i = 0; i < MAX_BOX_SIZE; i++) {
                const rawSlot = box.slots[i];
                let slug: string | null = null;

                if (typeof rawSlot === 'string') {
                  slug = rawSlot;
                } else if (rawSlot && typeof rawSlot === 'object' && 'pokemon' in rawSlot) {
                  slug = rawSlot.pokemon;
                }

                if (slug) {
                  combinedItems.push({ slug, isShiny: false });
                  combinedItems.push({ slug, isShiny: true });
                } else {
                  combinedItems.push({ slug: null, isShiny: false });
                  combinedItems.push({ slug: null, isShiny: true });
                }
              }

              for (let i = 0; i < combinedItems.length; i += MAX_BOX_SIZE) {
                const chunk = combinedItems.slice(i, i + MAX_BOX_SIZE);
                chunk.forEach((item, slotIndex) => {
                  if (item.slug) {
                    mapping.push({
                      slug: item.slug,
                      dexNum: 0,
                      position: currentBoxIndex * MAX_BOX_SIZE + slotIndex + 1,
                      isShiny: item.isShiny,
                    });
                  } else {
                    mapping.push(null);
                  }
                });
                currentBoxIndex++;
              }
            });
            return mapping;
          }),
          catchError((err) => {
            console.error('Failed to load combined shiny living dex mapping.', err);
            return of([]);
          }),
        );
    }

    if (dexType === DexType.STANDARD) {
      return this.getDexBoxNames(DexType.STANDARD).pipe(
        map((boxNames) => {
          const totalBoxes = boxNames ? boxNames.length : 40;
          const emptySlots = new Array(totalBoxes * MAX_BOX_SIZE).fill(null);
          return emptySlots;
        }),
      );
    }

    return this.loadPokemonIndex().pipe(
      map((allSlugs) => {
        let filteredSlugs: string[] = [];

        return filteredSlugs.map((slug, index) => ({
          slug,
          dexNum: index + 1,
          position: index + 1,
        }));
      }),
    );
  }

  searchPokemon(query: string): Observable<SimplePokemon[]> {
    const lowerQuery = query.trim().toLowerCase();

    if (!lowerQuery) return of([]);

    return this.getSimplePokemonList().pipe(
      map((pokemonList) => {
        return pokemonList.filter(
          (pokemon) =>
            pokemon.name.toLowerCase().includes(lowerQuery) ||
            pokemon.slug.includes(lowerQuery) ||
            (pokemon.nameGerman && pokemon.nameGerman.toLowerCase().includes(lowerQuery)),
        );
      }),
    );
  }

  getSpriteUrl(pokemon: DatasetPokemon, shiny: boolean = false): string {
    let spriteId = pokemon.refs.pkApiId;
    if (pokemon.id?.startsWith('unown-') && pokemon.id !== 'unown') {
      spriteId = `201-${pokemon.id.replace('unown-', '')}`;
    }
    const shinyPath = shiny ? 'shiny/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shinyPath}${spriteId}.png`;
  }

  getOfficialArtworkUrl(pokemon: DatasetPokemon, shiny: boolean = false): string {
    const spriteId = pokemon.refs.pkApiId;
    const shinyPath = shiny ? 'shiny/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shinyPath}${spriteId}.png`;
  }

  loadAbilities(): Observable<AbilityData[]> {
    if (!this.abilitiesCache) {
      this.abilitiesCache = this.http
        .get<AbilityData[]>(`${this.datasetBasePath}/abilities.json`)
        .pipe(shareReplay(1));
    }
    return this.abilitiesCache;
  }

  loadItems(): Observable<ItemData[]> {
    if (!this.itemsCache) {
      this.itemsCache = this.http
        .get<ItemData[]>(`${this.datasetBasePath}/items.json`)
        .pipe(shareReplay(1));
    }
    return this.itemsCache;
  }

  loadPokeballs(): Observable<PokeballData[]> {
    if (!this.pokeballsCache) {
      this.pokeballsCache = this.http
        .get<PokeballData[]>(`${this.datasetBasePath}/pokeballs.json`)
        .pipe(shareReplay(1));
    }
    return this.pokeballsCache;
  }

  loadNatures(): Observable<NatureData[]> {
    if (!this.naturesCache) {
      this.naturesCache = this.http
        .get<NatureData[]>(`${this.datasetBasePath}/natures.json`)
        .pipe(shareReplay(1));
    }
    return this.naturesCache;
  }

  loadMarks(): Observable<MarkData[]> {
    if (!this.marksCache) {
      this.marksCache = this.http
        .get<MarkData[]>(`${this.datasetBasePath}/marks.json`)
        .pipe(shareReplay(1));
    }
    return this.marksCache;
  }

  loadRibbons(): Observable<RibbonData[]> {
    if (!this.ribbonsCache) {
      this.ribbonsCache = this.http
        .get<RibbonData[]>(`${this.datasetBasePath}/ribbons.json`)
        .pipe(shareReplay(1));
    }
    return this.ribbonsCache;
  }

  loadGames(): Observable<GameData[]> {
    if (!this.gamesCache) {
      this.gamesCache = this.http
        .get<GameData[]>(`${this.datasetBasePath}/games/games.json`)
        .pipe(shareReplay(1));
    }
    return this.gamesCache;
  }

  loadMoves(): Observable<MoveData[]> {
    if (!this.movesCache) {
      this.movesCache = this.http
        .get<MoveData[]>(`${this.datasetBasePath}/moves.json`)
        .pipe(shareReplay(1));
    }
    return this.movesCache;
  }

  getPokedexesStats(dexNames: string[]): Observable<{ species: number; forms: number }> {
    if (!dexNames || dexNames.length === 0) return of({ species: 0, forms: 0 });

    const requests = dexNames.map((name) =>
      this.http.get<{ entries: { pid: string; isForm: boolean }[] }>(
        `${this.datasetBasePath}/pokedexes/${name}.json`,
      ),
    );

    return forkJoin(requests).pipe(
      map((allDexes) => {
        const uniqueBases = new Set<string>();
        const uniqueForms = new Set<string>();

        for (const dex of allDexes) {
          if (dex && dex.entries) {
            for (const entry of dex.entries) {
              if (entry.isForm) {
                uniqueForms.add(entry.pid);
              } else {
                uniqueBases.add(entry.pid);
              }
            }
          }
        }
        return { species: uniqueBases.size, forms: uniqueForms.size };
      }),
      catchError(() => of({ species: 0, forms: 0 })),
    );
  }
}
