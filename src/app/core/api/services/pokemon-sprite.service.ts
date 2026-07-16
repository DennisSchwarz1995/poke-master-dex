import { Injectable } from '@angular/core';
import { DatasetPokemon } from '../../../shared/models/dataset.model';

const CDN_BASE_URL = 'https://poke-master-dex.web.app/images/sprites/';

@Injectable({
  providedIn: 'root',
})
export class PokemonSpriteService {
  getSpriteUrl(pokemon: DatasetPokemon, shiny: boolean = false): string {
    let spriteId = pokemon.refs.pkApiId;
    if (pokemon.id?.startsWith('unown-') && pokemon.id !== 'unown') {
      spriteId = `201-${pokemon.id.replace('unown-', '')}`;
    }

    const formPath = shiny ? 'shiny/' : 'normal/';

    return `${CDN_BASE_URL}/base/${formPath}${spriteId}.png`;
  }

  getOfficialArtworkUrl(pokemon: DatasetPokemon, shiny: boolean = false): string {
    const spriteId = pokemon.refs.pkApiId;
    const formPath = shiny ? 'shiny/' : 'normal/';

    return `${CDN_BASE_URL}/official_artwork/${formPath}${spriteId}.png`;
  }
}
