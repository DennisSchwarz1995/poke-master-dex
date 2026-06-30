import { Injectable } from '@angular/core';
import { DatasetPokemon } from '../../../shared/models/dataset.model';

@Injectable({
  providedIn: 'root',
})
export class PokemonSpriteService {
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
}
