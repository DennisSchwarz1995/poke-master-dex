import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DexPokemonMapping } from '../../../shared/models/dataset.model';
import {
  BoxPreset,
  BoxSlot,
  MAX_BOX_SIZE,
  MAX_LIVING_DEX_BOXES,
} from '../../../shared/models/dataset.model';

export interface DexMappingStrategy {
  getBoxNames(): Observable<string[] | undefined>;
  createMapping(): Observable<(DexPokemonMapping | null)[]>;
}

export interface DexOptions {
  isShiny?: boolean;
  isOrigin?: boolean;
}

export abstract class BaseDexStrategy implements DexMappingStrategy {
  protected isShiny: boolean = false;
  protected isOrigin: boolean = false;
  constructor(
    protected http: HttpClient,
    protected basePath: string,
    options?: DexOptions,
  ) {
    this.isShiny = options?.isShiny ?? false;
    this.isOrigin = options?.isOrigin ?? false;
  }

  abstract getBoxNames(): Observable<string[] | undefined>;
  abstract createMapping(): Observable<(DexPokemonMapping | null)[]>;

  protected extractSlug(rawSlot: BoxSlot): string | null {
    if (typeof rawSlot === 'string') {
      return rawSlot;
    } else if (rawSlot && typeof rawSlot === 'object' && 'pokemon' in rawSlot) {
      return rawSlot.pokemon;
    }
    return null;
  }
}

export class FormDexStrategy extends BaseDexStrategy {
  getBoxNames(): Observable<string[] | undefined> {
    return this.http
      .get<BoxPreset>(`${this.basePath}/boxpresets/modern/home/grouped-region.json`)
      .pipe(
        map((preset) => preset.boxes.map((b) => b.name)),
        catchError((err) => {
          console.error('Failed to load form dex box names.', err);
          return of(undefined);
        }),
      );
  }

  createMapping(): Observable<(DexPokemonMapping | null)[]> {
    return this.http
      .get<BoxPreset>(`${this.basePath}/boxpresets/modern/home/grouped-region.json`)
      .pipe(
        map((preset) => {
          const mapping: (DexPokemonMapping | null)[] = [];
          preset.boxes.forEach((box, boxIndex) => {
            for (let i = 0; i < MAX_BOX_SIZE; i++) {
              const slug = this.extractSlug(box.slots[i]);
              if (slug) {
                mapping.push({ slug, dexNum: 0, position: boxIndex * MAX_BOX_SIZE + i + 1 });
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
}

export class StandardDexStrategy extends BaseDexStrategy {
  getBoxNames(): Observable<string[] | undefined> {
    return this.http.get<string[]>(`${this.basePath}/indices/personal-dex-boxes.json`).pipe(
      catchError((err) => {
        console.error('Failed to load personal dex box names.', err);
        return of(undefined);
      }),
    );
  }

  createMapping(): Observable<(DexPokemonMapping | null)[]> {
    return this.getBoxNames().pipe(
      map((boxNames) => {
        const totalBoxes = boxNames ? boxNames.length : 40;
        return new Array(totalBoxes * MAX_BOX_SIZE).fill(null);
      }),
    );
  }
}

export class LivingDexStrategy extends BaseDexStrategy {
  constructor(http: HttpClient, basePath: string, options?: DexOptions) {
    super(http, basePath, options);
  }

  getBoxNames(): Observable<string[] | undefined> {
    return this.http.get<string[]>(`${this.basePath}/indices/standard-dex-boxes.json`).pipe(
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

  createMapping(): Observable<(DexPokemonMapping | null)[]> {
    return this.http
      .get<BoxPreset>(`${this.basePath}/boxpresets/modern/home/sorted-species-minimal.json`)
      .pipe(
        map((preset) => {
          const mapping: (DexPokemonMapping | null)[] = [];
          preset.boxes.slice(0, MAX_LIVING_DEX_BOXES).forEach((box, boxIndex) => {
            for (let i = 0; i < MAX_BOX_SIZE; i++) {
              const slug = this.extractSlug(box.slots[i]);
              if (slug) {
                mapping.push({
                  slug,
                  dexNum: 0,
                  position: boxIndex * MAX_BOX_SIZE + i + 1,
                  isShiny: this.isShiny,
                });
              } else {
                mapping.push(null);
              }
            }
          });
          return mapping;
        }),
        catchError((err) => {
          console.error('Failed to load standard/shiny living dex mapping.', err);
          return of([]);
        }),
      );
  }
}

export class CombinedShinyLivingDexStrategy extends BaseDexStrategy {
  getBoxNames(): Observable<string[] | undefined> {
    return this.http.get<string[]>(`${this.basePath}/indices/standard-dex-boxes.json`).pipe(
      map((names) => {
        const allNames = [...names, 'Paldea 1', 'Paldea 2', 'Paldea 3', 'Paldea 4'];
        const doubledNames: string[] = [];
        allNames.slice(0, MAX_LIVING_DEX_BOXES).forEach((name) => {
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

  createMapping(): Observable<(DexPokemonMapping | null)[]> {
    return this.http
      .get<BoxPreset>(`${this.basePath}/boxpresets/modern/home/sorted-species-minimal.json`)
      .pipe(
        map((preset) => {
          const mapping: (DexPokemonMapping | null)[] = [];
          let currentBoxIndex = 0;

          preset.boxes.slice(0, MAX_LIVING_DEX_BOXES).forEach((box) => {
            const combinedItems: { slug: string | null; isShiny: boolean }[] = [];

            for (let i = 0; i < MAX_BOX_SIZE; i++) {
              const slug = this.extractSlug(box.slots[i]);
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
}

export class IndexBasedDexStrategy extends BaseDexStrategy {
  constructor(http: HttpClient, basePath: string, options?: DexOptions) {
    super(http, basePath, options);
  }

  getBoxNames(): Observable<string[] | undefined> {
    return of(undefined);
  }

  createMapping(): Observable<(DexPokemonMapping | null)[]> {
    return this.http.get<string[]>(`${this.basePath}/indices/pokemon.json`).pipe(
      map((allSlugs) => {
        const filteredSlugs = this.isOrigin ? [] : allSlugs;
        return filteredSlugs.map((slug, index) => ({
          slug,
          dexNum: index + 1,
          position: index + 1,
        }));
      }),
      catchError((err) => {
        console.error('Failed to load generic index mapping.', err);
        return of([]);
      }),
    );
  }
}
