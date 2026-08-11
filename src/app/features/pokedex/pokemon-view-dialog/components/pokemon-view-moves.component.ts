import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxSlot } from '../../../../shared/models/dex.model';
import { MoveData } from '../../../../shared/models/dataset.model';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card/stat-card.component';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import {
  MoveCardComponent,
  MoveViewSlot,
} from '../../../../shared/components/move-card/move-card.component';

@Component({
  selector: 'app-pokemon-view-moves',
  standalone: true,
  imports: [CommonModule, MoveCardComponent],
  template: `
    @if (hasAnyMove()) {
      <div class="grid grid-cols-1 gap-6 overflow-hidden shadow-sm">
        @for (move of moveSlots(); track move.index) {
          <app-move-card [move]="move" />
        }
      </div>
    } @else {
      <div
        class="flex flex-col items-center justify-center p-8 bg-secondary/5 border border-theme rounded-2xl text-center"
      >
        <img src="assets/icons/no-moves.svg" alt="No Moves" class="w-10 h-10 opacity-40 mb-3" />
        <p class="text-sm font-medium text-secondary">No moves configured for this Pokémon.</p>
      </div>
    }
  `,
})
export class PokemonViewMovesComponent {
  pokemon = input.required<BoxSlot>();
  allMoves = input<MoveData[]>([]);

  formattedMoves = computed(() => {
    const moves = this.pokemon().moves || [];
    const padded = [...moves];
    while (padded.length < 4) padded.push('');
    return padded.slice(0, 4);
  });

  movesDictionary = computed(() => {
    const map = new Map<string, MoveData>();
    this.allMoves().forEach((move) => map.set(move.id, move));
    return map;
  });

  moveSlots = computed<MoveViewSlot[]>(() => {
    const moves = this.pokemon().moves || [];
    const dictionary = this.movesDictionary();
    const result: MoveViewSlot[] = [];

    for (let i = 0; i < 4; i++) {
      const moveId = moves[i];

      if (!moveId) {
        result.push({ index: i, status: 'empty' });
        continue;
      }

      const data = dictionary.get(moveId);

      if (data) {
        result.push({
          index: i,
          status: 'configured',
          name: data.name,
          type: data.type,
          typeLabel: data.type.charAt(0).toUpperCase() + data.type.slice(1),
          power: typeof data.power === 'number' ? data.power : '—',
          accuracy: typeof data.accuracy === 'number' ? data.accuracy : '—',
          pp: data.pp,
          category: data.category,
        });
      } else {
        result.push({
          index: i,
          status: 'unconfigured',
          fallbackName: this.formatMoveName(moveId),
        });
      }
    }

    return result;
  });

  hasAnyMove = computed(() => this.moveSlots().some((slot) => slot.status !== 'empty'));

  private formatMoveName(move: string): string {
    return move
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getMoveData(moveId: string): MoveData | undefined {
    return this.allMoves().find((m) => m.id === moveId);
  }
}
