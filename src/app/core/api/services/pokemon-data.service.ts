import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { DatasetPokemon, SimplePokemon } from '../../../shared/models/dataset.model';

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
export class PokemonDataService {
  private readonly datasetBasePath = '/dataset/data';
  private readonly http = inject(HttpClient);

  private pokemonCache = new Map<string, Observable<DatasetPokemon>>();
  private pokemonIndexCache: Observable<string[]> | null = null;
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
}
