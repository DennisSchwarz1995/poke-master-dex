import { Component, input, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokeapiService } from '../../../core/api/services/pokeapi.service';
import { Pokemon } from '../../../core/api/models/pokeapi-response.model';

@Component({
  selector: 'app-pokemon-sprite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center">
      @if (pokemonId()) {
        <div 
          class="relative w-20 h-20 rounded-lg transition-all hover:scale-110"
          [class.grayscale]="!isOwned()"
          [class.opacity-40]="!isOwned()"
        >
          <img 
            [src]="spriteUrl()" 
            [alt]="pokemonName()"
            class="w-full h-full object-contain"
            loading="lazy"
          />
          @if (isShiny()) {
            <div class="absolute top-0 right-0 text-yellow-400 text-xl" title="Shiny">✨</div>
          }
        </div>
        <div class="text-center mt-1">
          <div class="text-[10px] text-gray-400 font-mono">
            #{{ (pokemonId() || 0).toString().padStart(4, '0') }}
          </div>
          <div class="text-xs font-medium capitalize truncate max-w-[80px]" [title]="pokemonName()">
            {{ pokemonName() }}
          </div>
        </div>
      } @else {
        <div class="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
          <span class="text-gray-300 text-2xl">?</span>
        </div>
        <div class="text-center mt-1">
          <div class="text-[10px] text-gray-300">—</div>
          <div class="text-xs text-gray-300">Empty</div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PokemonSpriteComponent {
  private pokeapiService = inject(PokeapiService);
  
  pokemonId = input<number | null>(null);
  isOwned = input<boolean>(false);
  isShiny = input<boolean>(false);
  
  pokemonName = signal('...');
  
  spriteUrl = computed(() => {
    const id = this.pokemonId();
    if (!id) return '';
    
    const variant = this.isShiny() ? 'shiny' : 'default';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${variant}/${id}.png`;
  });
  
  constructor() {
    effect(() => {
      const id = this.pokemonId();
      if (id) {
        this.pokeapiService.getPokemonById(id).subscribe({
          next: (pokemon: Pokemon) => this.pokemonName.set(pokemon.name),
          error: () => this.pokemonName.set('Unknown')
        });
      } else {
        this.pokemonName.set('');
      }
    });
  }
}
