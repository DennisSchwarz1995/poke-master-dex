export interface AppPokemon {
  slug: string;
  dexNum: number;
  name: string;
  nameGerman?: string;
  types: string[];
  spriteUrl: string;
  officialArtUrl?: string;

  stats: {
    hp: number;
    atk: number;
    def: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };

  isForm: boolean;
  isMega: boolean;
  isGmax: boolean;
  isShiny?: boolean;
  height: number;
  weight: number;
  genus?: string;
  abilities: string[];
}

export interface PokemonListItem {
  slug: string;
  dexNum: number;
  name: string;
  types: string[];
  spriteUrl: string;
}

export interface Pokemon {
  id: number;
  name: string;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  sprites: {
    frontDefault: string | null;
    frontShiny: string | null;
    official: string | null;
    showdown: string | null;
  };
  stats: Array<{
    baseStat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    isHidden: boolean;
    slot: number;
  }>;
  species: {
    name: string;
    url: string;
    dexNumber: number;
  };
  height: number;
  weight: number;
  baseExperience: number;
}
