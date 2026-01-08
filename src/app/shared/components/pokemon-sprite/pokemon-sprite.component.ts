import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-sprite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer 
             hover:bg-gray-200 transition-colors border-2"
      [class.border-blue-400]="isOwned()"
      [class.border-transparent]="!isOwned()"
      (click)="onClick()"
    >
      @if (pokemonId()) {
        <img 
          [src]="getSpriteUrl(pokemonId()!)"
          [alt]="'Pokemon #' + pokemonId()"
          class="w-full h-full object-contain p-1 transition-all"
          [class.grayscale]="!isOwned()"
          [class.opacity-40]="!isOwned()"
          loading="lazy"
        />
      } @else {
        <span class="text-gray-300">—</span>
      }
    </div>
  `,
  styles: []
})
export class PokemonSpriteComponent {
  pokemonId = input<number | null>(null);
  isOwned = input<boolean>(false);
  isShiny = input<boolean>(false);
  
  clicked = output<number | null>();
  
  onClick() {
    this.clicked.emit(this.pokemonId());
  }
  
  getSpriteUrl(id: number): string {
    const shiny = this.isShiny() ? 'shiny/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny}${id}.png`;
  }
}
