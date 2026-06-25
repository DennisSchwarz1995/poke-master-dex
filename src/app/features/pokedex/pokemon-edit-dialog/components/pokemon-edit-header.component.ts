import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-pokemon-edit-header',
  standalone: true,
  imports: [CommonModule, CustomDropdownComponent],
  template: `
    <div class="flex items-center gap-6">
      <div class="flex flex-col items-center">
        <div class="relative group">
          <div
            class="w-24 h-24 bg-secondary rounded-full flex items-center justify-center border-2 border-theme shadow-inner"
          >
            @if (localPokemonSlug() && currentSpriteUrl()) {
              <img
                [src]="currentSpriteUrl()"
                [alt]="localizedName()"
                class="w-20 h-20 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                (error)="onImageError($event)"
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

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
