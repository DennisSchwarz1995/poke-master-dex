import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetPokemon } from '../../../../core/api/services/dataset.service';
import { CustomDropdownComponent, CustomDropdownOption } from '../../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-pokemon-edit-header',
  standalone: true,
  imports: [CommonModule, CustomDropdownComponent],
  template: `
    <div class="flex items-center gap-6">
      <div class="flex flex-col items-center">
        <div class="relative group">
          <div
            class="w-32 h-32 bg-secondary rounded-full flex items-center justify-center border-2 border-theme shadow-inner"
          >
            @if (localPokemonSlug() && currentSpriteUrl()) {
              <img
                [src]="currentSpriteUrl()"
                [alt]="localizedName()"
                class="w-28 h-28 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                (error)="onImageError($event)"
              />
            }
          </div>
          @if (ball()) {
            <div
              class="absolute bottom-0 left-0 w-7 h-7 bg-surface border border-theme rounded-full shadow flex items-center justify-center"
            >
              <img
                [src]="'assets/images/pokeballs/' + ball() + '.png'"
                [alt]="ball()"
                class="w-5 h-5 object-contain"
                style="image-rendering: pixelated"
                (error)="onImageError($event)"
              />
            </div>
          }
          @if (localPokemonSlug()) {
            <button
              (click)="shinyToggled.emit()"
              class="absolute bottom-0 right-0 p-1 bg-surface border border-theme rounded-full shadow hover:bg-surface-hover transition-colors flex items-center justify-center w-7 h-7"
              title="Toggle Shiny Preview"
            >
              <img
                src="assets/images/special_attributes/shiny-stars.png"
                alt="Shiny"
                class="w-5 h-5 object-contain"
              />
            </button>
          }
        </div>
        <div class="flex items-center gap-2 mt-2">
          @if (pokemonData()?.type1) {
            <img
              [src]="'assets/images/types/' + pokemonData()!.type1 + '.png'"
              [alt]="pokemonData()!.type1"
              class="h-5 object-contain"
              (error)="onImageError($event)"
            />
          }
          @if (pokemonData()?.type2) {
            <img
              [src]="'assets/images/types/' + pokemonData()!.type2 + '.png'"
              [alt]="pokemonData()!.type2"
              class="h-5 object-contain"
              (error)="onImageError($event)"
            />
          }
        </div>
      </div>

      <div class="flex-1">
        <div class="mb-3">
          <label class="block text-xs font-bold text-secondary uppercase mb-2">Pokemon</label>
          <app-custom-dropdown
            [options]="pokemonSearchOptions()"
            [selectedId]="localPokemonSlug() || ''"
            [placeholder]="'Search Pokemon...'"
            (valueChanged)="pokemonChanged.emit($event)"
          />
        </div>

        @if (localPokemonSlug()) {
          <div class="flex flex-col gap-1 text-sm text-secondary">
            <span class="flex items-center gap-2">
              {{ localizedName() }}
            </span>
            <span class="italic">{{ pokemonGenus() }}</span>
          </div>
        } @else {
          <div class="text-lg text-tertiary italic">Empty Slot</div>
        }
      </div>
    </div>
  `
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
