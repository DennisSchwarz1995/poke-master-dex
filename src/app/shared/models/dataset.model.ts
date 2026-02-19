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
