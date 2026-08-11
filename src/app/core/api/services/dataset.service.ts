import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
  DexPokemonMapping,
} from '../../../shared/models/dataset.model';
import { PokemonDataService } from './pokemon-data.service';
import { DexLayoutService } from './dex-layout.service';
import { ReferenceDataService } from './reference-data.service';
import { PokemonSpriteService } from './pokemon-sprite.service';

@Injectable({
  providedIn: 'root',
})
export class DatasetService {
  private readonly pokemonData = inject(PokemonDataService);
  private readonly dexLayout = inject(DexLayoutService);
  private readonly referenceData = inject(ReferenceDataService);
  private readonly sprites = inject(PokemonSpriteService);

  loadPokemonIndex(): Observable<string[]> {
    return this.pokemonData.loadPokemonIndex();
  }

  loadPokemonBySlug(slug: string): Observable<DatasetPokemon> {
    return this.pokemonData.loadPokemonBySlug(slug);
  }

  loadPokemonByDexNum(dexNum: number): Observable<DatasetPokemon | null> {
    return this.pokemonData.loadPokemonByDexNum(dexNum);
  }

  loadAllPokemon(): Observable<DatasetPokemon[]> {
    return this.pokemonData.loadAllPokemon();
  }

  getSimplePokemonList(): Observable<SimplePokemon[]> {
    return this.pokemonData.getSimplePokemonList();
  }

  searchPokemon(query: string): Observable<SimplePokemon[]> {
    return this.pokemonData.searchPokemon(query);
  }

  getDexBoxNames(
    dexType: DexType,
    layoutOption: string = 'grouped',
  ): Observable<string[] | undefined> {
    return this.dexLayout.getDexBoxNames(dexType, layoutOption);
  }

  createDexMapping(
    dexType: DexType,
    layoutOption: string = 'grouped',
  ): Observable<(DexPokemonMapping | null)[]> {
    return this.dexLayout.createDexMapping(dexType, layoutOption);
  }

  getSpriteUrl(pokemon: DatasetPokemon, shiny: boolean = false): string {
    return this.sprites.getSpriteUrl(pokemon, shiny);
  }

  getOfficialArtworkUrl(pokemon: DatasetPokemon, shiny: boolean = false): string {
    return this.sprites.getOfficialArtworkUrl(pokemon, shiny);
  }

  loadAbilities(): Observable<AbilityData[]> {
    return this.referenceData.loadAbilities();
  }

  loadItems(): Observable<ItemData[]> {
    return this.referenceData.loadItems();
  }

  loadPokeballs(): Observable<PokeballData[]> {
    return this.referenceData.loadPokeballs();
  }

  loadNatures(): Observable<NatureData[]> {
    return this.referenceData.loadNatures();
  }

  loadMarks(): Observable<MarkData[]> {
    return this.referenceData.loadMarks();
  }

  loadRibbons(): Observable<RibbonData[]> {
    return this.referenceData.loadRibbons();
  }

  loadGames(): Observable<GameData[]> {
    return this.referenceData.loadGames();
  }

  loadMoves(): Observable<MoveData[]> {
    return this.referenceData.loadMoves();
  }

  loadPokemonMovesFromPokeApi(slug: string): Observable<Set<string>> {
    return this.referenceData.loadPokemonMovesFromPokeApi(slug);
  }

  getPokedexesStats(dexNames: string[]): Observable<{ species: number; forms: number }> {
    return this.referenceData.getPokedexesStats(dexNames);
  }
}
