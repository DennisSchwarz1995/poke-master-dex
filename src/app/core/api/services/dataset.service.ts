import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, shareReplay } from 'rxjs';
import { DexType } from '../../../shared/models/dex.model';

export interface DatasetPokemon {
  id: string;
  nid: string;
  dexNum: number;
  formId?: string;
  region: string;
  gen: number;
  type1: string;
  type2?: string;
  color: string;
  ability1: string;
  ability2?: string;
  abilityHidden?: string;
  isDefault: boolean;
  isForm: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  isMega: boolean;
  isGmax: boolean;
  isRegional: boolean;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpAtk: number;
  baseSpDef: number;
  baseSpeed: number;
  height: number;
  weight: number;
  maleRate: number;
  femaleRate: number;
  baseSpecies?: string;
  baseForms: string[];
  forms: string[];
  refs: {
    pkApiId: string;
    pkApiFormId: string;
    pkApiFormSlug: string;
    showdownName: string;
  };
  names: {
    eng: string;
    deu?: string;
    fra?: string;
    jap?: string;
    [key: string]: string | undefined;
  };
  genus: {
    eng: string;
    deu?: string;
    [key: string]: string | undefined;
  };
  speciesNames?: {
    [key: string]: string;
  };
  formNames?: {
    [key: string]: string;
  };
}

export interface SimplePokemon {
  slug: string;
  dexNum: number;
  name: string;
  nameGerman?: string;
  type1: string;
  type2?: string;
  isForm: boolean;
  spriteId: string;
}

export interface DexPokemonMapping {
  slug: string;
  dexNum: number;
  position: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatasetService {
  private readonly datasetBasePath = '/dataset/data';
  private pokemonCache = new Map<string, Observable<DatasetPokemon>>();
  private allPokemonCache: Observable<DatasetPokemon[]> | null = null;
  private pokemonIndexCache: Observable<string[]> | null = null;

  constructor(private http: HttpClient) {}

  private loadPokemonIndex(): Observable<string[]> {
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

  loadPokemonByDexNumber(dexNum: number): Observable<DatasetPokemon | null> {
    return this.loadAllPokemon().pipe(
      map(allPokemon => {
        return allPokemon.find(p => p.dexNum === dexNum && p.isDefault) || null;
      })
    );
  }

  loadAllPokemon(): Observable<DatasetPokemon[]> {
    if (!this.allPokemonCache) {
      this.allPokemonCache = this.loadPokemonIndex().pipe(
        map(slugs => {
          // Note: In production, we'd load these in batches or pre-bundle
          // For now, we'll create observables but they'll be lazy-loaded
          return slugs;
        }),
        shareReplay(1),
        // This is a simplified version - in reality we need to load all JSON files
        // For Angular, we'll need to either pre-bundle the data or use lazy loading
        map(() => []) // Placeholder - will implement proper loading
      );
    }
    return this.allPokemonCache;
  }

  getSimplePokemonList(): Observable<SimplePokemon[]> {
    return this.loadPokemonIndex().pipe(
      map(slugs => {
        return [];
      })
    );
  }

  createDexMapping(dexType: DexType): Observable<DexPokemonMapping[]> {
    return this.loadPokemonIndex().pipe(
      map(allSlugs => {
        let filteredSlugs: string[];
        
        switch (dexType) {
          case DexType.FORM:
            filteredSlugs = allSlugs;
            break;
            
          case DexType.STANDARD:
          case DexType.LIVING:
          case DexType.SHINY_LIVING:
            filteredSlugs = allSlugs.filter(slug => {
              if (slug.includes('-')) {
                const specialCases = [
                  'mr-mime', 'mime-jr', 'ho-oh', 'porygon-z', 'jangmo-o', 'hakamo-o', 'kommo-o',
                  'tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini', 'type-null', 'chi-yu',
                  'chien-pao', 'ting-lu', 'wo-chien', 'great-tusk', 'scream-tail', 'brute-bonnet',
                  'flutter-mane', 'slither-wing', 'sandy-shocks', 'iron-treads', 'iron-bundle',
                  'iron-hands', 'iron-jugulis', 'iron-moth', 'iron-thorns', 'roaring-moon',
                  'iron-valiant', 'walking-wake', 'iron-leaves', 'gouging-fire', 'raging-bolt',
                  'iron-boulder', 'iron-crown'
                ];
                
                if (specialCases.includes(slug)) {
                  return true;
                }
                
                return false;
              }
              return true;
            });
            break;
            
          case DexType.ORIGIN:
            filteredSlugs = [];
            break;
            
          default:
            filteredSlugs = [];
        }

        return filteredSlugs.map((slug, index) => ({
          slug,
          dexNum: index + 1,
          position: index + 1
        }));
      })
    );
  }

  searchPokemon(query: string): Observable<SimplePokemon[]> {
    const lowerQuery = query.toLowerCase();
    
    return this.loadPokemonIndex().pipe(
      map(slugs => {
        // Filter slugs that match the query
        const matchingSlugs = slugs.filter(slug => {
          // Match by slug name
          if (slug.includes(lowerQuery)) return true;
          
          // Match by number (would need to load pokemon data)
          // For now, just slug matching
          return false;
        });

        // Convert to SimplePokemon (would need actual data loading)
        return matchingSlugs.map(slug => ({
          slug,
          dexNum: 0, // Placeholder
          name: slug,
          type1: 'normal',
          isForm: slug.includes('-'),
          spriteId: '1'
        }));
      })
    );
  }

  getSpriteUrl(pokemon: DatasetPokemon, shiny: boolean = false): string {
    const spriteId = pokemon.refs.pkApiId;
    const shinyPath = shiny ? 'shiny/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shinyPath}${spriteId}.png`;
  }

  getOfficialArtworkUrl(pokemon: DatasetPokemon, shiny: boolean = false): string {
    const spriteId = pokemon.refs.pkApiId;
    const shinyPath = shiny ? 'shiny/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shinyPath}${spriteId}.png`;
  }
}
