import { CustomDropdownOption } from '../../shared/components/custom-dropdown/custom-dropdown.component';

export interface GameDefinition {
  id: string;
  name: string;
  iconFilename: string;
  category?: string;
  originMarkId?: string;
  originMarkName?: string;
  description?: string;
}

export const GAME_MASTER_LIST: GameDefinition[] = [
  {
    id: 'wiwa-wi',
    name: 'Pokémon Winds',
    iconFilename: 'winds.webp',
    category: 'Generation 10',
  },
  {
    id: 'wiwa-wa',
    name: 'Pokémon Waves',
    iconFilename: 'waves.webp',
    category: 'Generation 10',
  },
  {
    id: 'champions',
    name: 'Pokémon Champions',
    iconFilename: 'champions.webp',
    category: 'Other',
    description:
      'Pokémon Champions is a free-to-start, battle-focused strategy game. Designed to make the classic Pokémon battling experience more accessible, the game heavily emphasizes strategic player-vs-player (PvP) combat, ranked matches, and the official Video Game Championships (VGC) format.',
  },
  {
    id: 'pokopia',
    name: 'Pokémon Pokopia',
    iconFilename: 'pokopia.webp',
    category: 'Other',
    description:
      'Pokémon Pokopia is a cozy life simulation and sandbox game. Instead of focusing on traditional turn-based battling, Pokopia challenges players to rebuild and cultivate a desolate, post-apocalyptic world into a thriving utopian paradise for Pokémon.',
  },

  {
    id: 'lza',
    name: 'Pokémon Legends: Z-A',
    iconFilename: 'legends_z-a.webp',
    category: 'Generation 9',
  },
  {
    id: 'sv-v',
    name: 'Pokémon Violet',
    iconFilename: 'violet.webp',
    category: 'Generation 9',
    originMarkId: 'paldea',
    originMarkName: 'Paldea Mark',
  },
  {
    id: 'sv-s',
    name: 'Pokémon Scarlet',
    iconFilename: 'scarlet.webp',
    category: 'Generation 9',
    originMarkId: 'paldea',
    originMarkName: 'Paldea Mark',
  },

  {
    id: 'la',
    name: 'Pokémon Legends: Arceus',
    iconFilename: 'legends_arceus.webp',
    category: 'Generation 8',
    originMarkId: 'hisui',
    originMarkName: 'Hisui Mark',
  },
  {
    id: 'bdsp-sp',
    name: 'Pokémon Shining Pearl',
    iconFilename: 'shining_pearl.webp',
    category: 'Generation 8',
    originMarkId: 'sinnoh',
    originMarkName: 'Sinnoh Mark',
  },
  {
    id: 'bdsp-bd',
    name: 'Pokémon Brilliant Diamond',
    iconFilename: 'brilliant_diamond.webp',
    category: 'Generation 8',
    originMarkId: 'sinnoh',
    originMarkName: 'Sinnoh Mark',
  },
  {
    id: 'swsh-sh',
    name: 'Pokémon Shield',
    iconFilename: 'shield.webp',
    category: 'Generation 8',
    originMarkId: 'galar',
    originMarkName: 'Galar Mark',
  },
  {
    id: 'swsh-sw',
    name: 'Pokémon Sword',
    iconFilename: 'sword.webp',
    category: 'Generation 8',
    originMarkId: 'galar',
    originMarkName: 'Galar Mark',
  },

  {
    id: 'lgpe-lge',
    name: "Pokémon Let's Go Eevee!",
    iconFilename: "let's_go_eevee.webp",
    category: 'Generation 7',
    originMarkId: 'lets-go',
    originMarkName: 'Kanto Mark',
  },
  {
    id: 'lgpe-lgp',
    name: "Pokémon Let's Go Pikachu!",
    iconFilename: "let's_go_pikachu.webp",
    category: 'Generation 7',
    originMarkId: 'lets-go',
    originMarkName: 'Kanto Mark',
  },
  {
    id: 'usum-um',
    name: 'Pokémon Ultra Moon',
    iconFilename: 'ultra_moon.webp',
    category: 'Generation 7',
    originMarkId: 'alola',
    originMarkName: 'Alola Mark',
  },
  {
    id: 'usum-us',
    name: 'Pokémon Ultra Sun',
    iconFilename: 'ultra_sun.webp',
    category: 'Generation 7',
    originMarkId: 'alola',
    originMarkName: 'Alola Mark',
  },
  {
    id: 'sm-m',
    name: 'Pokémon Moon',
    iconFilename: 'moon.webp',
    category: 'Generation 7',
    originMarkId: 'alola',
    originMarkName: 'Alola Mark',
  },
  {
    id: 'sm-s',
    name: 'Pokémon Sun',
    iconFilename: 'sun.webp',
    category: 'Generation 7',
    originMarkId: 'alola',
    originMarkName: 'Alola Mark',
  },

  {
    id: 'oras-as',
    name: 'Pokémon Alpha Sapphire',
    iconFilename: 'alpha_sapphire.webp',
    category: 'Generation 6',
    originMarkId: 'kalos',
    originMarkName: 'Kalos Mark',
  },
  {
    id: 'oras-or',
    name: 'Pokémon Omega Ruby',
    iconFilename: 'omega_ruby.webp',
    category: 'Generation 6',
    originMarkId: 'kalos',
    originMarkName: 'Kalos Mark',
  },
  {
    id: 'xy-y',
    name: 'Pokémon Y',
    iconFilename: 'y.webp',
    category: 'Generation 6',
    originMarkId: 'kalos',
    originMarkName: 'Kalos Mark',
  },
  {
    id: 'xy-x',
    name: 'Pokémon X',
    iconFilename: 'x.webp',
    category: 'Generation 6',
    originMarkId: 'kalos',
    originMarkName: 'Kalos Mark',
  },

  { id: 'b2w2-w2', name: 'Pokémon White 2', iconFilename: 'white2.webp', category: 'Generation 5' },
  { id: 'b2w2-b2', name: 'Pokémon Black 2', iconFilename: 'black2.webp', category: 'Generation 5' },
  { id: 'bw-w', name: 'Pokémon White', iconFilename: 'white.webp', category: 'Generation 5' },
  { id: 'bw-b', name: 'Pokémon Black', iconFilename: 'black.webp', category: 'Generation 5' },

  {
    id: 'hgss-ss',
    name: 'Pokémon SoulSilver',
    iconFilename: 'soulsilver.webp',
    category: 'Generation 4',
  },
  {
    id: 'hgss-hg',
    name: 'Pokémon HeartGold',
    iconFilename: 'heartgold.webp',
    category: 'Generation 4',
  },
  { id: 'pt', name: 'Pokémon Platinum', iconFilename: 'platin.webp', category: 'Generation 4' },
  { id: 'dp-p', name: 'Pokémon Pearl', iconFilename: 'pearl.webp', category: 'Generation 4' },

  { id: 'dp-d', name: 'Pokémon Diamond', iconFilename: 'diamond.webp', category: 'Generation 4' },

  {
    id: 'frlg-lg',
    name: 'Pokémon LeafGreen',
    iconFilename: 'leafgreen.webp',
    category: 'Generation 3',
  },
  {
    id: 'frlg-fr',
    name: 'Pokémon FireRed',
    iconFilename: 'firered.webp',
    category: 'Generation 3',
  },
  { id: 'e', name: 'Pokémon Emerald', iconFilename: 'emerald.webp', category: 'Generation 3' },

  { id: 'rs-s', name: 'Pokémon Sapphire', iconFilename: 'sapphire.webp', category: 'Generation 3' },

  { id: 'rs-r', name: 'Pokémon Ruby', iconFilename: 'ruby.webp', category: 'Generation 3' },

  {
    id: 'c',
    name: 'Pokémon Crystal',
    iconFilename: 'crystal.webp',
    category: 'Generation 2',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },

  {
    id: 'gs-s',
    name: 'Pokémon Silver',
    iconFilename: 'silver.webp',
    category: 'Generation 2',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },

  {
    id: 'gs-g',
    name: 'Pokémon Gold',
    iconFilename: 'gold.webp',
    category: 'Generation 2',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },

  {
    id: 'y',
    name: 'Pokémon Yellow',
    iconFilename: 'yellow.webp',
    category: 'Generation 1',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'rb-b',
    name: 'Pokémon Blue',
    iconFilename: 'blue.webp',
    category: 'Generation 1',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },
  {
    id: 'rb-r',
    name: 'Pokémon Red',
    iconFilename: 'red.webp',
    category: 'Generation 1',
    originMarkId: 'virtual-console',
    originMarkName: 'GameBoy Mark',
  },

  {
    id: 'go',
    name: 'Pokémon GO',
    iconFilename: 'go.webp',
    category: 'Other',
    originMarkId: 'go',
    originMarkName: 'Go Mark',
    description:
      'Pokémon GO is an augmented reality mobile game that brings Pokémon into the real world. Catch, trade, and battle on the go!',
  },
  { id: 'home', name: 'Pokémon HOME', iconFilename: 'home.webp', category: 'Other' },
  { id: 'bank', name: 'Pokémon Bank', iconFilename: 'bank.webp', category: 'Other' },
  { id: 'xd', name: 'Pokémon XD', iconFilename: 'xd.webp', category: 'Other' },
  { id: 'colosseum', name: 'Pokémon Colosseum', iconFilename: 'coloseum.webp', category: 'Other' },
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
  const game = GAME_MASTER_LIST.find((game) => game.id === gameId.toLowerCase());
  if (!game) {
    return gameId
      .split('-')
      .map((part) => part.toUpperCase())
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

export function getGameCustomDescription(gameId: string): string | undefined {
  if (!gameId) return undefined;
  const game = GAME_MASTER_LIST.find((game) => game.id === gameId.toLowerCase());
  return game?.description;
}
