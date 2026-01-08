export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  sprites: PokemonSprites;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  species: PokemonSpecies;
  height: number;
  weight: number;
  baseExperience: number;
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  frontDefault: string | null;
  frontShiny: string | null;
  official: string | null;
  showdown: string | null;
}

export interface PokemonStat {
  baseStat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  isHidden: boolean;
  slot: number;
}

export interface PokemonSpecies {
  name: string;
  url: string;
  dexNumber: number;
}

export interface PokemonListItem {
  name: string;
  url: string;
  id: number;
}
