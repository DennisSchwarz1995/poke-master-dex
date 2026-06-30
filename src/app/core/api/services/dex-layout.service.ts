import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DexType } from '../../../shared/models/dex.model';
import {
  BoxPreset,
  DexPokemonMapping,
  MAX_BOX_SIZE,
  MAX_LIVING_DEX_BOXES,
} from '../../../shared/models/dataset.model';
import { parseBoxSlotSlug } from '../utils/box-slot.util';

@Injectable({
  providedIn: 'root',
})
export class DexLayoutService {
  private readonly datasetBasePath = '/dataset/data';
  private readonly http = inject(HttpClient);

  getDexBoxNames(
    dexType: DexType,
    layoutOption: string = 'grouped',
  ): Observable<string[] | undefined> {
    if (dexType === DexType.FORM || dexType === DexType.ORIGIN_FORM) {
      return this.getFormDexBoxNames();
    }

    if (dexType === DexType.STANDARD) {
      return this.getPersonalDexBoxNames();
    }

    if (
      dexType === DexType.LIVING ||
      dexType === DexType.SHINY_LIVING ||
      dexType === DexType.ORIGIN
    ) {
      return this.getLivingDexBoxNames();
    }

    if (dexType === DexType.COMBINED_SHINY_LIVING) {
      return this.getCombinedShinyBoxNames(layoutOption);
    }

    return of(undefined);
  }

  createDexMapping(
    dexType: DexType,
    layoutOption: string = 'grouped',
  ): Observable<(DexPokemonMapping | null)[]> {
    if (dexType === DexType.FORM || dexType === DexType.ORIGIN_FORM) {
      return this.createFormDexMapping();
    }

    if (
      dexType === DexType.LIVING ||
      dexType === DexType.SHINY_LIVING ||
      dexType === DexType.ORIGIN
    ) {
      return this.createLivingDexMapping(dexType);
    }

    if (dexType === DexType.COMBINED_SHINY_LIVING) {
      return this.createCombinedShinyMapping(layoutOption);
    }

    if (dexType === DexType.STANDARD) {
      return this.createStandardDexMapping();
    }

    return of([]);
  }

  private getFormDexBoxNames(): Observable<string[] | undefined> {
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

  private getPersonalDexBoxNames(): Observable<string[] | undefined> {
    return this.http.get<string[]>(`${this.datasetBasePath}/indices/personal-dex-boxes.json`).pipe(
      catchError((err) => {
        console.error('Failed to load personal dex box names.', err);
        return of(undefined);
      }),
    );
  }

  private getLivingDexBoxNames(): Observable<string[] | undefined> {
    return this.http.get<string[]>(`${this.datasetBasePath}/indices/standard-dex-boxes.json`).pipe(
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

  private getCombinedShinyBoxNames(layoutOption: string): Observable<string[] | undefined> {
    return forkJoin([
      this.http.get<string[]>(`${this.datasetBasePath}/indices/standard-dex-boxes.json`),
      this.http.get<BoxPreset>(
        `${this.datasetBasePath}/boxpresets/modern/home/sorted-species-minimal.json`,
      ),
    ]).pipe(
      map(([names, preset]) => {
        const allNames = [...names, 'Paldea 1', 'Paldea 2', 'Paldea 3', 'Paldea 4'];
        const resultNames: string[] = [];

        let counter = 1;
        let currentPrefix = '';

        allNames.slice(0, MAX_LIVING_DEX_BOXES).forEach((name: string, index: number) => {
          const prefixMatch = name.match(/^([a-zA-Z\s]+?)\s*\d*$/);
          const prefix = prefixMatch ? prefixMatch[1].trim() : name;

          if (prefix !== currentPrefix) {
            currentPrefix = prefix;
            counter = 1;
          }

          const box = preset.boxes[index];
          if (!box) return;

          if (layoutOption === 'separate') {
            let hasNormal = false;
            for (let i = 0; i < MAX_BOX_SIZE; i++) {
              const slug = parseBoxSlotSlug(box.slots[i]);
              if (slug) hasNormal = true;
            }

            if (hasNormal) {
              resultNames.push(`${currentPrefix} ${counter}`);
              resultNames.push(`${currentPrefix} ${counter} Shiny`);
              counter++;
            }
          } else {
            const combinedItems: { slug: string | null }[] = [];
            for (let i = 0; i < MAX_BOX_SIZE; i++) {
              const slug = parseBoxSlotSlug(box.slots[i]);
              combinedItems.push({ slug });
              combinedItems.push({ slug });
            }

            for (let i = 0; i < combinedItems.length; i += MAX_BOX_SIZE) {
              const chunk = combinedItems.slice(i, i + MAX_BOX_SIZE);
              if (chunk.some((item) => item.slug !== null)) {
                resultNames.push(`${currentPrefix} ${counter}`);
                counter++;
              }
            }
          }
        });
        return resultNames;
      }),
      catchError((err) => {
        console.error('Failed to load combined shiny living dex box names.', err);
        return of(undefined);
      }),
    );
  }

  private createFormDexMapping(): Observable<(DexPokemonMapping | null)[]> {
    return this.http
      .get<BoxPreset>(`${this.datasetBasePath}/boxpresets/modern/home/grouped-region.json`)
      .pipe(
        map((preset) => {
          const mapping: (DexPokemonMapping | null)[] = [];
          preset.boxes.forEach((box, boxIndex) => {
            for (let i = 0; i < MAX_BOX_SIZE; i++) {
              const slug = parseBoxSlotSlug(box.slots[i]);

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

  private createLivingDexMapping(dexType: DexType): Observable<(DexPokemonMapping | null)[]> {
    return this.http
      .get<BoxPreset>(`${this.datasetBasePath}/boxpresets/modern/home/sorted-species-minimal.json`)
      .pipe(
        map((preset) => {
          const mapping: (DexPokemonMapping | null)[] = [];
          const isShinyDex = dexType === DexType.SHINY_LIVING;
          preset.boxes.slice(0, MAX_LIVING_DEX_BOXES).forEach((box, boxIndex) => {
            for (let i = 0; i < MAX_BOX_SIZE; i++) {
              const slug = parseBoxSlotSlug(box.slots[i]);

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

  private createCombinedShinyMapping(
    layoutOption: string,
  ): Observable<(DexPokemonMapping | null)[]> {
    return this.http
      .get<BoxPreset>(`${this.datasetBasePath}/boxpresets/modern/home/sorted-species-minimal.json`)
      .pipe(
        map((preset) => {
          const mapping: (DexPokemonMapping | null)[] = [];
          let currentBoxIndex = 0;

          preset.boxes.slice(0, MAX_LIVING_DEX_BOXES).forEach((box) => {
            const combinedItems: { slug: string | null; isShiny: boolean }[] = [];

            if (layoutOption === 'separate') {
              let hasPokemon = false;
              for (let i = 0; i < MAX_BOX_SIZE; i++) {
                const slug = parseBoxSlotSlug(box.slots[i]);
                if (slug) hasPokemon = true;
                combinedItems.push({ slug, isShiny: false });
              }

              for (let i = 0; i < MAX_BOX_SIZE; i++) {
                const slug = parseBoxSlotSlug(box.slots[i]);
                combinedItems.push({ slug, isShiny: true });
              }

              if (!hasPokemon) return;
            } else {
              for (let i = 0; i < MAX_BOX_SIZE; i++) {
                const slug = parseBoxSlotSlug(box.slots[i]);

                if (slug) {
                  combinedItems.push({ slug, isShiny: false });
                  combinedItems.push({ slug, isShiny: true });
                } else {
                  combinedItems.push({ slug: null, isShiny: false });
                  combinedItems.push({ slug: null, isShiny: true });
                }
              }
            }

            for (let i = 0; i < combinedItems.length; i += MAX_BOX_SIZE) {
              const chunk = combinedItems.slice(i, i + MAX_BOX_SIZE);
              if (!chunk.some((item) => item.slug !== null)) {
                continue;
              }

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

  private createStandardDexMapping(): Observable<(DexPokemonMapping | null)[]> {
    return this.getDexBoxNames(DexType.STANDARD).pipe(
      map((boxNames) => {
        const totalBoxes = boxNames ? boxNames.length : 40;
        const emptySlots = new Array(totalBoxes * MAX_BOX_SIZE).fill(null);
        return emptySlots;
      }),
    );
  }
}
