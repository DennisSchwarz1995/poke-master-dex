import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxSlot } from '../../../../shared/models/dex.model';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-pokemon-view-general',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe, TooltipDirective],
  template: `
    <div class="grid grid-cols-1 gap-6 max-w-md mx-auto">
      <div>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-secondary text-sm">Nickname</span>
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ pokemon().nickname || '—' }}</span>
            </div>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary text-sm">National Dex</span>
            <span class="font-medium font-mono">#{{ pokemonData()?.nid || '???' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary text-sm">Species</span>
            <span class="font-medium">{{ localizedGenus() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary text-sm">Nature</span>
            <span class="font-medium">{{ natureName() }}</span>
          </div>
        </div>
      </div>

      <div>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-secondary text-sm">Language</span>
            <span class="font-medium">{{ pokemon().originLanguage || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary text-sm" title="Original Trainer">OT</span>
            <span class="font-medium">{{ pokemon().originalTrainer || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary text-sm" title="Trainer ID">TID</span>
            <span class="font-medium">{{ pokemon().trainerId || '—' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-secondary text-sm">Origin Game</span>
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ originGameName() }}</span>
              @if (originGameIcon()) {
                <img
                  [src]="originGameIcon() | cdnUrl: 'games'"
                  class="w-6 h-6 object-contain drop-shadow-sm"
                  [appTooltip]="originGameName()"
                  [alt]="originGameName()"
                />
              }
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-secondary text-sm">Stored In</span>
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ storedInGameName() }}</span>
              @if (storedInGameIcon()) {
                <img
                  [src]="storedInGameIcon() | cdnUrl: 'games'"
                  class="w-6 h-6 object-contain drop-shadow-sm"
                  [appTooltip]="storedInGameName()"
                  [alt]="storedInGameName()"
                />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PokemonViewGeneralComponent {
  pokemon = input.required<BoxSlot>();
  pokemonData = input<DatasetPokemon | null>(null);

  localizedGenus = input<string>('');
  natureName = input<string>('');
  originGameName = input<string>('');
  originGameIcon = input<string>('');
  storedInGameName = input<string>('');
  storedInGameIcon = input<string>('');
}
