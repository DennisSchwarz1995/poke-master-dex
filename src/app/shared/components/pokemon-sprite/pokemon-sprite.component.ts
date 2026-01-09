import { Component, input, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetService } from '../../../core/api/services/dataset.service';

@Component({
  selector: 'app-pokemon-sprite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center p-2 rounded-lg transition-all duration-200 cursor-pointer border-2"
         [style.border-color]="borderColor()"
         [class.bg-white]="isHovered"
         [class.shadow-lg]="isHovered"
         [class.scale-105]="isHovered"
         [class.z-20]="isHovered"
         [class.grayscale]="!isOwned()"
         [class.opacity-40]="!isOwned()"
         (mouseenter)="onHover()"
         (mouseleave)="onLeave()">
      @if (pokemonSlug()) {
        <div class="relative w-16 h-16">
          <img 
            [src]="spriteUrl()" 
            [alt]="pokemonName()"
            class="w-full h-full object-contain"
            loading="lazy"
          />
          @if (isShiny()) {
            <div class="absolute top-0 right-0 text-yellow-400 text-lg" title="Shiny">✨</div>
          }
        </div>
        
        <div class="text-center mt-1">
          <div class="text-[10px] text-gray-400 font-mono">
            {{ pokemonNid() }}
          </div>
          <div class="text-xs font-medium capitalize truncate max-w-[80px]" [title]="pokemonName()">
            {{ pokemonName() }}
          </div>
        </div>
      } @else {
        <div class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
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
  private datasetService = inject(DatasetService);
  
  pokemonSlug = input<string | null>(null);
  isOwned = input<boolean>(false);
  isShiny = input<boolean>(false);
  
  pokemonName = signal('...');
  pokemonNid = signal('');
  spriteUrl = signal('');
  pokemonTypes = signal<string[]>([]);
  isHovered = false;
  
  borderColor = computed(() => {
    if (!this.isHovered) return 'transparent';
    
    const types = this.pokemonTypes();
    if (types.length === 0) return 'transparent';
    
    // Use primary type (type1) for border color
    return this.getTypeColor(types[0]);
  });
  
  onHover() {
    this.isHovered = true;
  }
  
  onLeave() {
    this.isHovered = false;
  }
  
  constructor() {
    effect(() => {
      const slug = this.pokemonSlug();
      if (slug) {
        this.datasetService.loadPokemonBySlug(slug).subscribe({
          next: (pokemon) => {
            this.pokemonName.set(pokemon.names.deu || pokemon.names.eng);
            this.pokemonNid.set(pokemon.nid);
            this.spriteUrl.set(this.datasetService.getSpriteUrl(pokemon, this.isShiny()));
            
            // Store types
            const types = [pokemon.type1];
            if (pokemon.type2) types.push(pokemon.type2);
            this.pokemonTypes.set(types);
          },
          error: () => {
            this.pokemonName.set('Unknown');
            this.pokemonNid.set('????');
            this.spriteUrl.set('');
            this.pokemonTypes.set([]);
          }
        });
      } else {
        this.pokemonName.set('');
        this.pokemonNid.set('');
        this.spriteUrl.set('');
        this.pokemonTypes.set([]);
      }
    });
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
    return typeColors[typeName.toLowerCase()] || '#777';
  }
}
