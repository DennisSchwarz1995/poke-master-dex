import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Pokemon, PokemonListItem } from '../../../shared/models/pokemon.model';
import { 
  PokeApiPokemonListResponse, 
  PokeApiPokemonResponse 
} from '../models/pokeapi-response.model';

@Injectable({
  providedIn: 'root'
})
export class PokeapiService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private http = inject(HttpClient);
  
  private pokemonCache = new Map<number, Observable<Pokemon>>();
  private pokemonListCache: Observable<PokemonListItem[]> | null = null;
  
  getPokemonList(limit: number = 1025): Observable<PokemonListItem[]> {
    if (!this.pokemonListCache) {
      this.pokemonListCache = this.http
        .get<PokeApiPokemonListResponse>(`${this.baseUrl}/pokemon?limit=${limit}`)
        .pipe(
          map(response => response.results.map((item, index) => ({
            name: item.name,
            url: item.url,
            id: index + 1
          }))),
          shareReplay(1)
        );
    }
    return this.pokemonListCache;
  }
  
  getPokemonById(id: number): Observable<Pokemon> {
    if (!this.pokemonCache.has(id)) {
      const pokemon$ = this.http
        .get<PokeApiPokemonResponse>(`${this.baseUrl}/pokemon/${id}`)
        .pipe(
          map(data => this.mapToPokemon(data)),
          shareReplay(1)
        );
      this.pokemonCache.set(id, pokemon$);
    }
    return this.pokemonCache.get(id)!;
  }
  
  getPokemonByName(name: string): Observable<Pokemon> {
    return this.http
      .get<PokeApiPokemonResponse>(`${this.baseUrl}/pokemon/${name}`)
      .pipe(map(data => this.mapToPokemon(data)));
  }
  
  searchPokemon(query: string): Observable<PokemonListItem[]> {
    return this.getPokemonList().pipe(
      map(list => list.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toString() === query
      ))
    );
  }
  
  private mapToPokemon(data: PokeApiPokemonResponse): Pokemon {
    return {
      id: data.id,
      name: data.name,
      types: data.types,
      sprites: {
        frontDefault: data.sprites.front_default,
        frontShiny: data.sprites.front_shiny,
        official: data.sprites.other['official-artwork']?.front_default,
        showdown: data.sprites.other.showdown?.front_default
      },
      stats: data.stats.map(s => ({
        baseStat: s.base_stat,
        effort: s.effort,
        stat: s.stat
      })),
      abilities: data.abilities.map(a => ({
        ability: a.ability,
        isHidden: a.is_hidden,
        slot: a.slot
      })),
      species: {
        name: data.species.name,
        url: data.species.url,
        dexNumber: data.id
      },
      height: data.height,
      weight: data.weight,
      baseExperience: data.base_experience
    };
  }
}
