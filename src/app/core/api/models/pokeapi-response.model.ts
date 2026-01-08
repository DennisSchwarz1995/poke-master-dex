export interface PokeApiPokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeApiNamedResource[];
}

export interface PokeApiNamedResource {
  name: string;
  url: string;
}

export interface PokeApiPokemonResponse {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  types: PokeApiPokemonType[];
  sprites: PokeApiSprites;
  stats: PokeApiStat[];
  abilities: PokeApiAbility[];
  species: PokeApiNamedResource;
}

export interface PokeApiPokemonType {
  slot: number;
  type: PokeApiNamedResource;
}

export interface PokeApiSprites {
  front_default: string | null;
  front_shiny: string | null;
  other: {
    'official-artwork': {
      front_default: string | null;
    };
    showdown: {
      front_default: string | null;
    };
  };
}

export interface PokeApiStat {
  base_stat: number;
  effort: number;
  stat: PokeApiNamedResource;
}

export interface PokeApiAbility {
  ability: PokeApiNamedResource;
  is_hidden: boolean;
  slot: number;
}
