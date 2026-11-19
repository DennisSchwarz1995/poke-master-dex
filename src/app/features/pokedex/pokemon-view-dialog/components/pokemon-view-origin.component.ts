import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxSlot } from '../../../../shared/models/dex.model';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card/stat-card.component';
import { POKEMON_LANGUAGES } from '../../../../core/services/pokemon-language.service';

@Component({
  selector: 'app-pokemon-view-origin',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe, TooltipDirective, StatCardComponent],
  template: `
    <section class="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
      <app-stat-card [label]="'Language'">
        @if (languageDetails(); as lang) {
          <div class="flex items-center gap-2">
            <span
              class="border text-primary rounded-md px-4 py-[4px] text-[10px] leading-none font-bold w-9 flex items-center justify-center"
              >{{ lang.badge }}</span
            >
            <span>{{ lang.label }}</span>
          </div>
        } @else {
          —
        }
      </app-stat-card>
      <app-stat-card [label]="'OT'"> {{ originalTrainer() }} </app-stat-card>
      <app-stat-card [label]="'TID'"> {{ trainerId() }} </app-stat-card>
      <app-stat-card [label]="'Origin Game'">
        {{ originGameName() }}
        @if (originGameIcon()) {
          <img
            [src]="originGameIcon() | cdnUrl: 'games'"
            class="w-6 h-6 object-contain drop-shadow-sm"
            [appTooltip]="originGameName()"
            [alt]="originGameName()"
          />
        }
      </app-stat-card>
      <app-stat-card [label]="'Stored In'">
        {{ storedInGameName() }}
        @if (storedInGameIcon()) {
          <img
            [src]="storedInGameIcon() | cdnUrl: 'games'"
            class="w-6 h-6 object-contain drop-shadow-sm"
            [appTooltip]="storedInGameName()"
            [alt]="storedInGameName()"
          />
        }
      </app-stat-card>
    </section>
  `,
})
export class PokemonViewOriginComponent {
  pokemon = input.required<BoxSlot>();
  originGameName = input<string>('');
  originGameIcon = input<string>('');
  storedInGameName = input<string>('');
  storedInGameIcon = input<string>('');

  languageDetails = computed(() => {
    const langBadge = this.pokemon().originLanguage;
    if (!langBadge) return null;
    let lang = POKEMON_LANGUAGES.find((l) => l.badge === langBadge);
    if (!lang && langBadge === 'ESP') {
      lang = POKEMON_LANGUAGES.find((l) => l.badge === 'ES-ES');
    }
    return lang || { badge: langBadge, label: langBadge };
  });

  originalTrainer = computed(() => this.pokemon().originalTrainer || '—');
  trainerId = computed(() => this.pokemon().trainerId || '—');
}
