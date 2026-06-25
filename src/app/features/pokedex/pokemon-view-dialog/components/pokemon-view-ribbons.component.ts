import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxSlot } from '../../../../shared/models/dex.model';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';

@Component({
  selector: 'app-pokemon-view-ribbons',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe],
  template: `
    <div class="max-w-md mx-auto space-y-8">
      <div>
        <h3
          class="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-theme pb-2"
        >
          Ribbons
        </h3>
        @if (pokemon().ribbon) {
          <div class="flex items-center gap-4 p-3 bg-secondary/10 rounded-lg">
            <img
              [src]="ribbonSpriteUrl() | cdnUrl: 'ribbons'"
              [alt]="ribbonName() || pokemon().ribbon"
              class="w-10 h-10 object-contain drop-shadow-md"
            />
            <span class="font-bold text-lg">{{ ribbonName() || pokemon().ribbon }}</span>
          </div>
        } @else {
          <p class="text-tertiary text-sm italic">None equipped</p>
        }
      </div>

      <div>
        <h3
          class="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-theme pb-2"
        >
          Marks
        </h3>
        @if (pokemon().mark) {
          <div class="flex items-center gap-4 p-3 bg-secondary/10 rounded-lg">
            <img
              [src]="markSpriteUrl() | cdnUrl: 'marks'"
              [alt]="markName() || pokemon().mark"
              class="w-10 h-10 object-contain drop-shadow-md"
            />
            <span class="font-bold text-lg">{{ markName() || pokemon().mark }}</span>
          </div>
        } @else {
          <p class="text-tertiary text-sm italic">None equipped</p>
        }
      </div>
    </div>
  `,
})
export class PokemonViewRibbonsComponent {
  pokemon = input.required<BoxSlot>();
  ribbonName = input<string>('');
  ribbonSpriteUrl = input<string>('');
  markName = input<string>('');
  markSpriteUrl = input<string>('');
}
