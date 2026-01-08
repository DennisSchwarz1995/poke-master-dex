export enum DexType {
  STANDARD = 'standard',
  LIVING = 'living',
  SHINY_LIVING = 'shiny-living',
  FORM = 'form',
  ORIGIN = 'origin'
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

export interface BoxSlot {
  position: number;
  pokemonId: number | null;
  isShiny: boolean;
  isOwned: boolean;
  customName?: string;
  notes?: string;
}

export interface Box {
  boxNumber: number;
  name: string;
  slots: BoxSlot[];
}

export interface DexTypeConfig {
  type: DexType;
  name: string;
  description: string;
  icon: string;
  color: string;
}
