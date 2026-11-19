export const MAX_BOX_SIZE = 30;
export const MAX_LIVING_DEX_BOXES = 39;

export interface BoxSlotObject {
  pokemon: string;
}

export type BoxSlot = string | BoxSlotObject | null;

export interface DexBox {
  name: string;
  slots: BoxSlot[];
}

export interface BoxPreset {
  boxes: DexBox[];
}

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
  isBaby?: boolean;
  isUltraBeast?: boolean;
  isParadox?: boolean;
  isMega: boolean;
  isGmax: boolean;
  canGmax?: boolean;
  canBeAlpha?: boolean;
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
  obtainableIn: string[];
  eventOnlyIn: string[];
  storableIn: string[];
}

export interface SimplePokemon {
  slug: string;
  dexNum: number;
  name: string;
  nameGerman?: string;
  type1: string;
  type2?: string;
  obtainableIn?: string[];
  isForm: boolean;
  spriteId: string;
  allNames?: { [lang: string]: string }; // All language names for searching
}

export interface PokemonNameIndex {
  id: string;
  nid: string;
  dexNum: number;
  names: { [lang: string]: string };
  isDefault: boolean;
}

export interface DexPokemonMapping {
  slug: string;
  dexNum: number;
  position: number;
  isShiny?: boolean;
}

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

export interface PokemonMoves {
  id: string;
  moves: string[];
}
