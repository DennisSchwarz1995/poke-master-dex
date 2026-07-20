import { Injectable } from '@angular/core';
import { GameDefinition } from '../../shared/models/game-definitions.model';
import { CustomDropdownOption } from '../../shared/components/custom-dropdown/custom-dropdown.component';
import { GAME_DEFINITIONS, GAME_DEFINITIONS_MAP } from '../constants/game-data.constants';

@Injectable({ providedIn: 'root' })
export class GameDataService {
  getGameByCode(gameId: string): GameDefinition | undefined {
    return GAME_DEFINITIONS_MAP[gameId?.toLowerCase()];
  }

  getShortGameName(gameId: string): string {
    const game = GAME_DEFINITIONS.find((g) => g.id === gameId.toLowerCase());
    if (!game) {
      return gameId
        .split('-')
        .map((part) => part.toUpperCase())
        .join(' ');
    }
    return game.name.replace('Pokémon ', '');
  }

  getFullGameName(gameId: string): string {
    const game = GAME_DEFINITIONS.find((g) => g.id === gameId.toLowerCase());
    return game ? game.name : this.getShortGameName(gameId);
  }

  getGameIconPath(gameId: string): string {
    const game = GAME_DEFINITIONS.find((g) => g.id === gameId.toLowerCase());
    return game ? game.iconFilename : '';
  }

  getGameOriginMark(gameId: string): { id: string; name: string } | null {
    if (!gameId) return null;
    const game = GAME_DEFINITIONS.find((g) => g.id === gameId.toLowerCase());

    if (game && game.originMarkId && game.originMarkName) {
      return {
        id: game.originMarkId,
        name: game.originMarkName,
      };
    }
    return null;
  }

  getGameCustomDescription(gameId: string): string | undefined {
    if (!gameId) return undefined;
    const game = GAME_DEFINITIONS.find((g) => g.id === gameId.toLowerCase());
    return game?.description;
  }

  getGameDropdownOptions(): CustomDropdownOption[] {
    return GAME_DEFINITIONS.map((game) => ({
      id: game.id,
      name: game.name,
      iconPath: game.iconFilename,
      cdnFolder: 'games',
      category: game.category,
    }));
  }

  getAvailableGamesForPokemon(storableIn: string[]): GameDefinition[] {
    return storableIn
      .map((id) => GAME_DEFINITIONS_MAP[id])
      .filter((game): game is GameDefinition => game !== undefined)
      .sort((a, b) => {
        if (a.gen !== b.gen) return b.gen - a.gen;
        return b.year - a.year;
      });
  }

  getOriginGameOptions(availableGamesByGen: { label: string; games: GameDefinition[] }[]): CustomDropdownOption[] {
    const options: CustomDropdownOption[] = [
      { id: '', name: 'None', description: 'No Origin Game selected', category: 'Options' },
    ];

    availableGamesByGen.forEach((group) => {
      group.games.forEach((game) => {
        options.push({
          id: game.id,
          name: game.name,
          category: group.label,
          iconPath: this.getGameIconPath(game.id) || undefined,
        });
      });
    });

    return options;
  }

  getStoredInOptions(): CustomDropdownOption[] {
    const options: CustomDropdownOption[] = [
      { id: '', name: 'None', description: 'Not Stored / Unknown', category: 'Options' },
    ];

    const allowedCodes = [
      'home', 'sv-s', 'sv-v', 'swsh-sw', 'swsh-sh', 'bdsp-bd', 'bdsp-sp', 'la', 'lgpe-lgp', 'lgpe-lge',
    ];

    allowedCodes.forEach((code) => {
      const game = GAME_DEFINITIONS_MAP[code];
      if (game) {
        options.push({
          id: game.id,
          name: game.name,
          category: game.gen === 0 ? 'Special' : `Generation ${game.gen}`,
          iconPath: this.getGameIconPath(game.id) || undefined,
        });
      }
    });

    return options;
  }
}
