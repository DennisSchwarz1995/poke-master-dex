export interface GameDefinition {
  id: string;
  name: string;
  iconFilename: string;
  category?: string;
  gen: number;
  region: string;
  year: number;
  originMarkId?: string;
  originMarkName?: string;
  description?: string;
}
