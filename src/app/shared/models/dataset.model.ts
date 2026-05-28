export interface AbilityData {
  id: string;
  name: string;
  psName: string;
  gen: number;
  shortDesc: string;
  desc: string;
}

export interface ItemData {
  id: string;
  name: string;
  psName?: string;
  category: string;
  shortDesc: string;
  desc: string;
  gen: number;
  unholdable?: boolean;
}

export interface PokeballData {
  id: string;
  name: string;
  gen: number;
  shortDesc: string;
  desc: string;
  category: string;
  unusable?: boolean;
}

export interface NatureData {
  id: string;
  name: string;
  raises: string | null;
  lowers: string | null;
}

export interface MarkData {
  id: string;
  name: string;
  gen: number;
  shortDesc: string;
  desc: string | null;
  title: string;
  conditions: string;
  chance: string;
  chanceCharm: string;
}

export interface RibbonData {
  id: string;
  name: string;
  gen: number;
  shortDesc: string;
  desc: string | null;
  title: string;
  category: string;
}

export interface GameData {
  id: string;
  name: string;
  nameSlug: string;
  gen: number;
  codename: string | null;
  type: string;
  series: string;
  gameSet?: string | null;
  gameSuperSet?: string | null;
  releaseDate: string | null;
  region: string;
  platforms: string[];
  pokedexes: string[];
}

export interface MoveData {
  id: string;
  name: string;
  psName: string;
  gen: number;
  shortDesc: string;
  desc: string;
  type: string;
  power: number;
  accuracy: number | boolean;
  pp: number;
  category: string;
  priority: number;
  isZ: boolean;
  isGmax: boolean;
}
