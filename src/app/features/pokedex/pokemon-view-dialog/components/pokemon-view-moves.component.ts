import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxSlot } from '../../../../shared/models/dex.model';

@Component({
  selector: 'app-pokemon-view-moves',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-md mx-auto space-y-6">
      <h3
        class="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-theme pb-2"
      >
        Moves
      </h3>

      @if (hasAnyMove()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (move of formattedMoves(); track $index) {
            @if (move) {
              <div
                class="p-4 bg-secondary/10 border border-theme rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div class="flex flex-col">
                  <span class="text-xs text-secondary opacity-60 uppercase font-mono mb-1"
                    >Slot {{ $index + 1 }}</span
                  >
                  <span class="font-bold text-primary text-base">{{ formatMoveName(move) }}</span>
                </div>
              </div>
            } @else {
              <div
                class="p-4 bg-secondary/5 border border-theme border-dashed rounded-2xl flex items-center justify-between opacity-60"
              >
                <div class="flex flex-col">
                  <span class="text-xs text-secondary opacity-60 uppercase font-mono mb-1"
                    >Slot {{ $index + 1 }}</span
                  >
                  <span class="italic text-tertiary text-base">Empty Slot</span>
                </div>
              </div>
            }
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
    </div>
  `,
})
export class PokemonViewMovesComponent {
  pokemon = input.required<BoxSlot>();

  formattedMoves = computed(() => {
    const moves = this.pokemon().moves || [];
    const padded = [...moves];
    while (padded.length < 4) padded.push('');
    return padded.slice(0, 4);
  });

  hasAnyMove(): boolean {
    const moves = (this.pokemon() as any).moves;
    return Array.isArray(moves) && moves.some((m) => m && m.trim() !== '');
  }

  formatMoveName(move: string): string {
    return move
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
