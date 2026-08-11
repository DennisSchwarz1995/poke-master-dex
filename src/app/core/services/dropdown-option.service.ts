import { Injectable } from '@angular/core';
import { CustomDropdownOption } from '../../shared/components/custom-dropdown/custom-dropdown.component';
import {
  ItemData,
  MarkData,
  MoveData,
  NatureData,
  PokeballData,
  RibbonData,
  SimplePokemon,
} from '../../shared/models/dataset.model';
import { Trainer } from '../../shared/models/trainer.model';
import { AVAILABLE_SPRITES } from '../constants/available-sprites.constants';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DropdownOptionService {
  getNatureStatLabel(stat: string): string {
    const labels: Record<string, string> = {
      atk: 'Atk',
      def: 'Def',
      spa: 'SpA',
      spd: 'SpD',
      spe: 'Spe',
    };
    return labels[stat] || stat;
  }

  mapNatures(natures: NatureData[]): CustomDropdownOption[] {
    return natures.map((nat) => {
      let desc = '';
      let descHtml = '';
      if (nat.raises && nat.lowers) {
        desc = `(+${this.getNatureStatLabel(nat.raises)} -${this.getNatureStatLabel(nat.lowers)})`;
        descHtml = `(<span class="text-[#e46787] font-bold">+${this.getNatureStatLabel(nat.raises)}</span> <span class="text-[#3babdf] font-bold">-${this.getNatureStatLabel(nat.lowers)}</span>)`;
      }
      return {
        id: nat.id,
        name: nat.name,
        description: desc,
        descriptionHtml: descHtml,
      };
    });
  }

  mapPokeballs(pokeballs: PokeballData[]): CustomDropdownOption[] {
    const categoryLabels: Record<string, string> = {
      regular: 'Regular',
      special: 'Special',
      hisuian: 'Hisuian',
      other: 'Other',
    };
    return pokeballs.map((ball) => ({
      id: ball.id,
      name: ball.name,
      description: ball.shortDesc,
      category: categoryLabels[ball.category] ?? ball.category,
      iconPath: AVAILABLE_SPRITES.pokeballs.has(ball.id) ? `${ball.id}.webp` : undefined,
      cdnFolder: 'pokeballs',
    }));
  }

  mapItems(items: ItemData[]): CustomDropdownOption[] {
    const categoryLabels: Record<string, string> = {
      ball: 'Poké Ball',
      berry: 'Berry',
      other: 'Item',
    };

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.shortDesc,
      category: categoryLabels[item.category] ?? item.category,
      iconPath: AVAILABLE_SPRITES.items.has(item.id) ? `${item.id}.png` : undefined,
      cdnFolder: 'items',
    }));
  }

  mapRibbons(ribbons: RibbonData[]): CustomDropdownOption[] {
    return ribbons
      .map((ribbon) => ({
        id: ribbon.id,
        name: ribbon.name,
        description: ribbon.shortDesc,
        category: `Gen ${ribbon.gen}`,
        iconPath: AVAILABLE_SPRITES.ribbons.has(ribbon.id) ? `${ribbon.id}.png` : undefined,
        cdnFolder: 'ribbons',
      }))
      .sort((a, b) => {
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA;
        return a.name.localeCompare(b.name);
      });
  }

  mapMarks(marks: MarkData[]): CustomDropdownOption[] {
    return marks
      .map((mark) => ({
        id: mark.id,
        name: mark.name,
        description: mark.shortDesc,
        category: `Gen ${mark.gen}`,
        iconPath: AVAILABLE_SPRITES.marks.has(mark.id) ? `${mark.id}.png` : undefined,
        cdnFolder: 'marks',
      }))
      .sort((a, b) => {
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA;
        return a.name.localeCompare(b.name);
      });
  }

  mapMoves(moves: MoveData[]): CustomDropdownOption[] {
    return [
      { id: '', name: 'None', description: 'Empty move slot' },
      ...moves.map((m) => {
        const typeUrl = `${environment.cdnUrl}/types/${m.type}.png`;
        const typeBadge = `<img src="${typeUrl}" alt="${m.type}" class="w-6 h-6 object-contain inline-block drop-shadow-sm" />`;

        return {
          id: m.id,
          name: m.name,
          description: `${m.type} | Power: ${m.power || '—'} | PP: ${m.pp}`,
          descriptionHtml: `<div class="flex flex-col gap-1.5 mt-1 whitespace-normal">
            <div class="flex items-center gap-3 text-xs text-secondary font-medium">
              ${typeBadge}
              <div class="flex items-center gap-2">
                <span title="PP">PP: ${m.pp}</span>
                <span class="text-secondary">|</span>
                <span title="Power">Power: ${m.power || '—'}</span>
                <span class="text-secondary">|</span>
                <span title="Accuracy">Acc: ${m.accuracy === true ? '—' : m.accuracy || '—'}</span>
              </div>
            </div>
            <div class="text-[11px] text-secondary leading-tight italic">${m.shortDesc}</div>
          </div>`,
          category: `Generation ${m.gen}`,
        };
      }),
    ];
  }

  getLanguageOptions(): CustomDropdownOption[] {
    return [
      { id: '', name: 'None' },
      { id: 'ENG', name: 'ENG', description: 'English' },
      { id: 'DEU', name: 'DEU', description: 'German' },
      { id: 'JPN', name: 'JPN', description: 'Japanese' },
      { id: 'FRA', name: 'FRA', description: 'French' },
      { id: 'ITA', name: 'ITA', description: 'Italian' },
      { id: 'ESP', name: 'ESP', description: 'Spanish' },
      { id: 'KOR', name: 'KOR', description: 'Korean' },
      { id: 'CHS', name: 'CHS', description: 'Chinese (Simp)' },
      { id: 'CHT', name: 'CHT', description: 'Chinese (Trad)' },
    ];
  }

  mapTrainers(
    trainers: Trainer[],
    isTrainerCompatibleFn: (t: Trainer) => boolean,
  ): CustomDropdownOption[] {
    return trainers.map((trainer) => {
      const compatible = isTrainerCompatibleFn(trainer);
      return {
        id: trainer.id,
        name: trainer.name,
        description: `(${trainer.game})${!compatible ? ' — incompatible' : ''}`,
        category: !compatible ? 'Incompatible' : 'Compatible',
      };
    });
  }

  mapPokemonSearchOptions(pokemonList: SimplePokemon[]): CustomDropdownOption[] {
    return pokemonList.map((p) => ({
      id: p.slug,
      name: p.name,
      description: p.nameGerman && p.nameGerman !== p.name ? p.nameGerman : '',
      searchTerms: p.allNames ? Object.values(p.allNames).filter((n) => n) : [],
    }));
  }
}
