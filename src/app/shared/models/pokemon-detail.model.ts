export interface PokemonDetail extends BoxSlot {
  level?: number;
  ball?: string;
  originGame?: string;
  originalTrainer?: string;
  trainerId?: string;
  nature?: string;
  ability?: string;
  moves?: string[];
  metLocation?: string;
  metLevel?: number;
  metDate?: Date;
}
