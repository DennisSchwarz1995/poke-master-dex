import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../../shared/models/pokemon.model';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer p-4"
      (click)="onClick()"
    >
      @if (pokemon(); as pkmn) {
        <div class="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          @if (pkmn.sprites.official) {
            <img 
              [src]="pkmn.sprites.official" 
              [alt]="pkmn.name"
              class="w-full h-full object-contain p-2"
              loading="lazy"
            />
          } @else {
            <span class="text-4xl text-gray-400">?</span>
          }
        </div>
        
        <div class="text-center">
          <span class="text-xs text-gray-500 font-mono">
            #{{ pkmn.id.toString().padStart(4, '0') }}
          </span>
          <h3 class="font-bold text-gray-800 capitalize">
            {{ pkmn.name }}
          </h3>
          
          <div class="flex gap-1 justify-center mt-2 flex-wrap">
            @for (type of pkmn.types; track type.slot) {
              <span 
                class="px-2 py-1 rounded text-xs text-white font-medium uppercase"
                [style.background-color]="getTypeColor(type.type.name)"
              >
                {{ type.type.name }}
              </span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PokemonCardComponent {
  pokemon = input.required<Pokemon>();
  clicked = output<Pokemon>();
  
  onClick() {
    this.clicked.emit(this.pokemon());
  }
  
  getTypeColor(typeName: string): string {
    const typeColors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      electric: '#F8D030',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return typeColors[typeName] || '#777';
  }
}
