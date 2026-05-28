import { CustomDropdownOption } from '../../shared/components/custom-dropdown/custom-dropdown.component';

export interface GameDefinition {
  id: string;
  name: string;
  iconFilename: string;
  category?: string;
  originMarkId?: string;
  originMarkName?: string;
}

export const GAME_MASTER_LIST: GameDefinition[] = [
  {
    id: 'lza',
    name: 'Pokémon Legends: Z-A',
    iconFilename: 'legends_z-a.png',
    category: 'Generation 9',
  },
  {
    id: 'sv-v',
    name: 'Pokémon Violet',
    iconFilename: 'violet.png',
    category: 'Generation 9',
    originMarkId: 'paldea',
    originMarkName: 'Paldea Mark',
  },
  {
    id: 'sv-s',
    name: 'Pokémon Scarlet',
    iconFilename: 'scarlet.png',
    category: 'Generation 9',
    originMarkId: 'paldea',
    originMarkName: 'Paldea Mark',
  },

  {
    id: 'pla',
    name: 'Pokémon Legends: Arceus',
    iconFilename: 'legends_arceus.png',
    category: 'Generation 8',
    originMarkId: 'hisui',
    originMarkName: 'Hisui Mark',
  },
  {
    id: 'la',
    name: 'Pokémon Legends: Arceus',
    iconFilename: 'legends_arceus.png',
    category: 'Generation 8',
    originMarkId: 'hisui',
    originMarkName: 'Hisui Mark',
  },
  {
    id: 'bdsp-sp',
    name: 'Pokémon Shining Pearl',
    iconFilename: 'shining_pearl.png',
    category: 'Generation 8',
    originMarkId: 'sinnoh',
    originMarkName: 'Sinnoh Mark',
  },
  {
    id: 'bdsp-bd',
    name: 'Pokémon Brilliant Diamond',
    iconFilename: 'brilliant_diamond.png',
    category: 'Generation 8',
    originMarkId: 'sinnoh',
    originMarkName: 'Sinnoh Mark',
  },
  {
    id: 'swsh-sh',
    name: 'Pokémon Shield',
    iconFilename: 'shield.png',
    category: 'Generation 8',
    originMarkId: 'galar',
    originMarkName: 'Galar Mark',
  },
  {
    id: 'swsh-sw',
    name: 'Pokémon Sword',
    iconFilename: 'sword.png',
    category: 'Generation 8',
    originMarkId: 'galar',
    originMarkName: 'Galar Mark',
  },

  {
    id: 'lgpe-lge',
    name: "Pokémon Let's Go Eevee!",
    iconFilename: "let's_go_eevee.png",
    category: 'Generation 7',
    originMarkId: 'lets-go',
    originMarkName: 'Kanto Mark',
  },
  {
    id: 'lgpe-lgp',
    name: "Pokémon Let's Go Pikachu!",
    iconFilename: "let's_go_pikachu.png",
    category: 'Generation 7',
    originMarkId: 'lets-go',
    originMarkName: 'Kanto Mark',
  },
  {
    id: 'usum-um',
    name: 'Pokémon Ultra Moon',
    iconFilename: 'ultra_moon.png',
    category: 'Generation 7',
    originMarkId: 'alola',
    originMarkName: 'Alola Mark',
  },
  {
    id: 'usum-us',
    name: 'Pokémon Ultra Sun',
    iconFilename: 'ultra_sun.png',
    category: 'Generation 7',
    originMarkId: 'alola',
    originMarkName: 'Alola Mark',
  },
  {
    id: 'sm-m',
    name: 'Pokémon Moon',
    iconFilename: 'moon.png',
    category: 'Generation 7',
    originMarkId: 'alola',
    originMarkName: 'Alola Mark',
  },
  {
    id: 'sm-s',
    name: 'Pokémon Sun',
    iconFilename: 'sun.png',
    category: 'Generation 7',
    originMarkId: 'alola',
    originMarkName: 'Alola Mark',
  },

  {
    id: 'oras-as',
    name: 'Pokémon Alpha Sapphire',
    iconFilename: 'alpha_sapphire.png',
    category: 'Generation 6',
    originMarkId: 'kalos',
    originMarkName: 'Kalos Mark',
  },
  {
    id: 'oras-or',
    name: 'Pokémon Omega Ruby',
    iconFilename: 'omega_ruby.png',
    category: 'Generation 6',
    originMarkId: 'kalos',
    originMarkName: 'Kalos Mark',
  },
  {
    id: 'xy-y',
    name: 'Pokémon Y',
    iconFilename: 'y.png',
    category: 'Generation 6',
    originMarkId: 'kalos',
    originMarkName: 'Kalos Mark',
  },
  {
    id: 'xy-x',
    name: 'Pokémon X',
    iconFilename: 'x.png',
    category: 'Generation 6',
    originMarkId: 'kalos',
    originMarkName: 'Kalos Mark',
  },

  { id: 'b2w2-w2', name: 'Pokémon White 2', iconFilename: 'white2.png', category: 'Generation 5' },
  { id: 'b2w2-b2', name: 'Pokémon Black 2', iconFilename: 'black2.png', category: 'Generation 5' },
  { id: 'bw-w', name: 'Pokémon White', iconFilename: 'white.png', category: 'Generation 5' },
  { id: 'bw-b', name: 'Pokémon Black', iconFilename: 'black.png', category: 'Generation 5' },

  {
    id: 'hgss-ss',
    name: 'Pokémon SoulSilver',
    iconFilename: 'soulsilver.png',
    category: 'Generation 4',
  },
  {
    id: 'hgss-hg',
    name: 'Pokémon HeartGold',
    iconFilename: 'heartgold.png',
    category: 'Generation 4',
  },
  { id: 'dppt-pt', name: 'Pokémon Platinum', iconFilename: 'platin.png', category: 'Generation 4' },
  { id: 'pt', name: 'Pokémon Platinum', iconFilename: 'platin.png', category: 'Generation 4' },
  { id: 'dp-p', name: 'Pokémon Pearl', iconFilename: 'pearl.png', category: 'Generation 4' },
  { id: 'dppt-p', name: 'Pokémon Pearl', iconFilename: 'pearl.png', category: 'Generation 4' },
  { id: 'dp-d', name: 'Pokémon Diamond', iconFilename: 'diamond.png', category: 'Generation 4' },
  { id: 'dppt-d', name: 'Pokémon Diamond', iconFilename: 'diamond.png', category: 'Generation 4' },

  {
    id: 'frlg-lg',
    name: 'Pokémon LeafGreen',
    iconFilename: 'leafgreen.png',
    category: 'Generation 3',
  },
  { id: 'frlg-fr', name: 'Pokémon FireRed', iconFilename: 'firered.png', category: 'Generation 3' },
  { id: 'e', name: 'Pokémon Emerald', iconFilename: 'emerald.png', category: 'Generation 3' },
  { id: 'rse-e', name: 'Pokémon Emerald', iconFilename: 'emerald.png', category: 'Generation 3' },
  { id: 'rs-s', name: 'Pokémon Sapphire', iconFilename: 'sapphire.png', category: 'Generation 3' },
  { id: 'rse-s', name: 'Pokémon Sapphire', iconFilename: 'sapphire.png', category: 'Generation 3' },
  { id: 'rs-r', name: 'Pokémon Ruby', iconFilename: 'ruby.png', category: 'Generation 3' },
  { id: 'rse-r', name: 'Pokémon Ruby', iconFilename: 'ruby.png', category: 'Generation 3' },

  {
    id: 'c',
    name: 'Pokémon Crystal',
    iconFilename: 'crystal.png',
    category: 'Generation 2',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'gsc-c',
    name: 'Pokémon Crystal',
    iconFilename: 'crystal.png',
    category: 'Generation 2',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'gs-s',
    name: 'Pokémon Silver',
    iconFilename: 'silver.png',
    category: 'Generation 2',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'gsc-s',
    name: 'Pokémon Silver',
    iconFilename: 'silver.png',
    category: 'Generation 2',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'gs-g',
    name: 'Pokémon Gold',
    iconFilename: 'gold.png',
    category: 'Generation 2',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'gsc-g',
    name: 'Pokémon Gold',
    iconFilename: 'gold.png',
    category: 'Generation 2',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'y',
    name: 'Pokémon Yellow',
    iconFilename: 'yellow.png',
    category: 'Generation 1',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'rb-b',
    name: 'Pokémon Blue',
    iconFilename: 'blue.png',
    category: 'Generation 1',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'rb-r',
    name: 'Pokémon Red',
    iconFilename: 'red.png',
    category: 'Generation 1',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },

  {
    id: 'go',
    name: 'Pokémon GO',
    iconFilename: 'go.png',
    category: 'Other',
    originMarkId: 'go',
    originMarkName: 'Go Mark',
  },
  { id: 'home', name: 'Pokémon HOME', iconFilename: 'home.png', category: 'Other' },
  { id: 'bank', name: 'Pokémon Bank', iconFilename: 'bank.png', category: 'Other' },
  { id: 'xd', name: 'Pokémon XD', iconFilename: 'xd.png', category: 'Other' },
  { id: 'colosseum', name: 'Pokémon Colosseum', iconFilename: 'coloseum.png', category: 'Other' },
];

export function getGameDropdownOptions(): CustomDropdownOption[] {
  return GAME_MASTER_LIST.map((game) => ({
    id: game.id,
    name: game.name,
    iconPath: game.iconFilename,
    cdnFolder: 'games',
    category: game.category,
  }));
}

export function getShortGameName(gameId: string): string {
  const game = GAME_MASTER_LIST.find((g) => g.id === gameId.toLowerCase());
  if (!game) {
    return gameId
      .split('-')
      .map((p) => p.toUpperCase())
      .join(' ');
  }
  return game.name.replace('Pokémon ', '');
}

export function getFullGameName(gameId: string): string {
  const game = GAME_MASTER_LIST.find((game) => game.id === gameId.toLowerCase());
  return game ? game.name : getShortGameName(gameId);
}

export function getGameIconPath(gameId: string): string {
  const game = GAME_MASTER_LIST.find((game) => game.id === gameId.toLowerCase());
  return game ? game.iconFilename : '';
}

export function getGameOriginMark(gameId: string): { id: string; name: string } | null {
  if (!gameId) return null;
  const game = GAME_MASTER_LIST.find((game) => game.id === gameId.toLowerCase());

  if (game && game.originMarkId && game.originMarkName) {
    return {
      id: game.originMarkId,
      name: game.originMarkName,
    };
  }
  return null;
}
