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
  pokemonSlug: string | null;  // Changed from pokemonId to pokemonSlug
  isShiny: boolean;
  isOwned: boolean;
  customName?: string;
  notes?: string;
  
  // Advanced Pokemon Details
  level?: number;
  ball?: string;
  item?: string;
  ability?: string;
  nature?: string;
  originGame?: string;
  originLanguage?: string;
  originalTrainer?: string;
  trainerId?: string;
  mark?: string;  // e.g., "lunchtime", "rare"
  ribbon?: string;  // e.g., "champion", "best-friends"
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
