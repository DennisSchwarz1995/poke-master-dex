import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import {
  AbilityData,
  ItemData,
  PokeballData,
  NatureData,
  MarkData,
  RibbonData,
  GameData,
  MoveData,
} from '../../../shared/models/dataset.model';

@Injectable({
  providedIn: 'root',
})
export class ReferenceDataService {
  private readonly datasetBasePath = '/dataset/data';
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<unknown>>();

  loadAbilities(): Observable<AbilityData[]> {
    return this.cachedGet<AbilityData[]>('abilities', 'abilities.json');
  }

  loadItems(): Observable<ItemData[]> {
    return this.cachedGet<ItemData[]>('items', 'items.json');
  }

  loadPokeballs(): Observable<PokeballData[]> {
    return this.cachedGet<PokeballData[]>('pokeballs', 'pokeballs.json');
  }

  loadNatures(): Observable<NatureData[]> {
    return this.cachedGet<NatureData[]>('natures', 'natures.json');
  }

  loadMarks(): Observable<MarkData[]> {
    return this.cachedGet<MarkData[]>('marks', 'marks.json');
  }

  loadRibbons(): Observable<RibbonData[]> {
    return this.cachedGet<RibbonData[]>('ribbons', 'ribbons.json');
  }

  loadGames(): Observable<GameData[]> {
    return this.cachedGet<GameData[]>('games', 'games/games.json');
  }

  loadMoves(): Observable<MoveData[]> {
    return this.cachedGet<MoveData[]>('moves', 'moves.json');
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

  private cachedGet<T>(key: string, path: string): Observable<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, this.http.get<T>(`${this.datasetBasePath}/${path}`).pipe(shareReplay(1)));
    }
    return this.cache.get(key) as Observable<T>;
  }
}
