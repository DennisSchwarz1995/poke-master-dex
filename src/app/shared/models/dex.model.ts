export enum DexType {
  STANDARD = 'standard',
  LIVING = 'living',
  SHINY_LIVING = 'shiny-living',
  COMBINED_SHINY_LIVING = 'combined-shiny-living',
  FORM = 'form',
  ORIGIN = 'origin',
  ORIGIN_FORM = 'origin-form',
}

export interface Dex {
  id: string;
  userId: string;
  name: string;
  type: DexType;
  description: string;
  startBox: number;
  totalBoxes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatsMap {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface BoxSlot {
  position: number;
  pokemonSlug: string | null;
  isShiny: boolean;
  isOwned: boolean;
  isEvent?: boolean;
  isGmax?: boolean;
  isAlpha?: boolean;
  customName?: string;
  nickname?: string;
  notes?: string;
  level?: number;
  ball?: string;
  item?: string;
  ability?: string;
  nature?: string;
  originGame?: string;
  storedIn?: string;
  originLanguage?: string;
  originalTrainer?: string;
  trainerId?: string;
  mark?: string;
  ribbon?: string;
  ivs?: StatsMap;
  evs?: StatsMap;
  gender?: string;
  moves?: string[];
}

export interface Box {
  boxNumber: number;
  name: string;
  slots: BoxSlot[];
}

export interface DexLayoutOption {
  id: string;
  name: string;
}

export interface DexTypeConfig {
  type: DexType;
  name: string;
  description: string;
  icon: string;
  color: string;
  supportedLayouts?: DexLayoutOption[];
}
