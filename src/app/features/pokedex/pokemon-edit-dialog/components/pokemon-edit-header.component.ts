import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../../shared/components/custom-dropdown/custom-dropdown.component';
import { FallbackImageDirective } from '../../../../shared/directives/fallback-image/fallback-image.directive';

@Component({
  selector: 'app-pokemon-edit-header',
  standalone: true,
  imports: [CommonModule, CustomDropdownComponent, FallbackImageDirective],
  template: `
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center flex-none">
          <div class="relative w-24 h-24">
            <div
              class="w-full h-full bg-secondary rounded-full flex items-center justify-center border-2 border-theme shadow-inner"
            >
              @if (pokemonData()) {
                <img
                  [src]="currentSpriteUrl()"
                  [alt]="pokemonData()?.names?.['eng'] || 'Pokemon'"
                  class="w-32 h-32 overflow-hidden object-contain drop-shadow-md z-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  appFallback
                />
              }
            </div>
          </div>
        </div>

        <div class="flex-1">
          <div class="mb-3">
            <app-custom-dropdown
              [options]="pokemonSearchOptions()"
              [selectedId]="localPokemonSlug() || ''"
              [placeholder]="'Search Pokemon...'"
              [searchable]="true"
              (valueChanged)="pokemonChanged.emit($event)"
            />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PokemonEditHeaderComponent {
  pokemonData = input<DatasetPokemon | null>();
  currentSpriteUrl = input<string>('');
  localPokemonSlug = input<string | null>(null);
  ball = input<string>('');
  pokemonSearchOptions = input.required<CustomDropdownOption[]>();
  localizedName = input<string>('');
  pokemonGenus = input<string>('Pokémon');

  pokemonChanged = output<string>();
  shinyToggled = output<void>();
}
