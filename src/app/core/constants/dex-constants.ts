import { DexType, DexTypeConfig } from '../../shared/models/dex.model';

export interface DexCategory {
  id: string;
  name: string;
  description: string;
  types: DexType[];
}

export const DEX_CATEGORIES: DexCategory[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Your own custom Pokemon collection without restrictions',
    types: [DexType.STANDARD],
  },
  {
    id: 'living',
    name: 'Living',
    description: 'Collect one of each Pokemon species',
    types: [DexType.LIVING, DexType.SHINY_LIVING, DexType.COMBINED_SHINY_LIVING],
  },
  {
    id: 'form',
    name: 'Form',
    description: 'Collect all forms and variants of each Pokemon',
    types: [DexType.FORM],
  },
  {
    id: 'origin',
    name: 'Origin',
    description: 'Collect Pokemon originating from their debut generation',
    types: [DexType.ORIGIN, DexType.ORIGIN_FORM],
  },
];

export const DEX_TYPE_CONFIGS: DexTypeConfig[] = [
  {
    type: DexType.STANDARD,
    name: 'Personal Pokedex',
    description: 'Your own custom Pokemon collection without restrictions',
    color: 'blue',
  },
  {
    type: DexType.LIVING,
    name: 'Living Dex',
    description: 'One Pokemon of each species (1025 total)',
    color: 'green',
  },
  {
    type: DexType.SHINY_LIVING,
    name: 'Shiny Living Dex',
    description: 'Shiny version of each species',
    color: 'yellow',
  },
  {
    type: DexType.COMBINED_SHINY_LIVING,
    name: 'Combined Shiny Living Dex',
    description: 'Normal and Shiny versions side by side',
    color: 'yellow',
    supportedLayouts: [
      { id: 'grouped', name: 'Species then Shiny (Side-by-side)' },
      { id: 'separate', name: 'Species then Shiny Species in a separate Box' },
    ],
  },
  {
    type: DexType.FORM,
    name: 'Form Dex',
    description: 'All forms and variants of each Pokemon',
    color: 'purple',
  },
  {
    type: DexType.ORIGIN,
    name: 'Origin Dex',
    description: 'Collect all 1025 Base Species, but each one must be from its debut generation.',
    color: 'yellow',
  },
  {
    type: DexType.ORIGIN_FORM,
    name: 'Origin Form Dex',
    description: 'Collect all 1428 Forms, where each form is caught in its debut generation.',
    color: 'green',
  },
];
