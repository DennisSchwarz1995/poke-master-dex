import { Component, computed, effect, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxSlot } from '../../../../shared/models/dex.model';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card/stat-card.component';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-pokemon-view-general',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe, StatCardComponent, TooltipDirective],
  template: `
    <section class="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
      <app-stat-card label="Type(s)">
        <div class="flex items-center gap-2">
          @for (type of formattedTypes(); track type) {
            @if (type) {
              <img
                [src]="type.name + '.png' | cdnUrl: 'types'"
                [alt]="type.name"
                class="w-6 h-6 object-contain flex-shrink-0 drop-shadow-sm rounded-lg"
                (error)="onImgError($event)"
                loading="lazy"
                [appTooltip]="type.label"
                tooltipPosition="top"
              />
            }
          }
        </div>
      </app-stat-card>
      <app-stat-card [label]="'National Dex'"> #{{ nationalId() }} </app-stat-card>
      <app-stat-card [label]="'Nickname'"> {{ nickname() }} </app-stat-card>
      <app-stat-card [label]="'Species'"> {{ localizedGenus() }} </app-stat-card>
      <app-stat-card [label]="'Nature'"> {{ natureName() }} </app-stat-card>
      <app-stat-card [label]="'Size'"> {{ size() | uppercase }} </app-stat-card>
      <app-stat-card [label]="'Height'"> {{ heightFormatted() }} </app-stat-card>
      <app-stat-card [label]="'Weight'"> {{ weightFormatted() }} </app-stat-card>
    </section>
  `,
})
export class PokemonViewGeneralComponent {
  pokemon = input.required<BoxSlot>();
  localizedGenus = input<string>('');
  natureName = input<string>('');
  size = input<string>('');
  pokemonData = input<DatasetPokemon | null>(null);

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  types = computed(() => {
    const data = this.pokemonData();
    const types = [data?.type1 || '', data?.type2 || ''];
    return types;
  });

  formattedTypes = computed(() => {
    const currentTypes = this.types();
    if (!currentTypes) return [];

    return currentTypes.map((type) => ({
      name: type,
      label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
    }));
  });

  nationalId = computed(() => {
    const data = this.pokemonData();
    return data ? data.nid : '0001';
  });

  heightFormatted = computed(() => {
    const data = this.pokemonData();
    if (!data || data.height === undefined) return '—';
    return (data.height / 10).toFixed(1) + ' m';
  });

  weightFormatted = computed(() => {
    const data = this.pokemonData();
    if (!data || data.weight === undefined) return '—';
    return (data.weight / 10).toFixed(1) + ' kg';
  });

  nickname = computed(() => {
    return this.pokemon().nickname || '—';
  });

  genderName = computed(() => {
    const gender = this.pokemon().gender;
    if (gender === 'male') return 'Male';
    if (gender === 'female') return 'Female';
    return '—';
  });
}
