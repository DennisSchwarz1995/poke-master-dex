import { Component, input, computed, signal, effect, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { TypeColorService } from '../../../core/services/type-color.service';

@Component({
  selector: 'app-pokemon-sprite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center p-2 rounded-lg transition-all duration-200 cursor-pointer border-2"
      style="corner-shape: squircle;"
      [ngStyle]="borderStyle()"
      [class.bg-surface]="isHovered()"
      [class.shadow-lg]="isHovered()"
      [class.scale-105]="isHovered()"
      [class.z-20]="isHovered()"
      [class.grayscale]="!isOwned()"
      [class.opacity-40]="!isOwned()"
      (mouseenter)="onHover()"
      (mouseleave)="onLeave()"
    >
      @if (pokemonSlug()) {
        <div class="relative w-16 h-16">
          <img
            [src]="spriteUrl()"
            [alt]="pokemonName()"
            class="w-full h-full object-contain"
            loading="lazy"
          />
          @if (isShiny()) {
            <div class="absolute top-0 right-0 text-yellow-500 text-lg" title="Shiny">
              <img
                src="assets/images/special_attributes/shiny-stars.png"
                alt="Shiny"
                class="w-5 h-5 object-contain"
              />
            </div>
          }
        </div>

        <div class="text-center mt-1 w-full px-1">
          <div class="text-[10px] text-gray-400 font-mono">
            {{ pokemonNid() }}
          </div>
          <div
            class="text-xs font-medium capitalize truncate w-full text-primary"
            [title]="pokemonName()"
          >
            {{ pokemonName() }}
          </div>
        </div>
      } @else {
        <div class="w-16 h-16"></div>
        <div class="text-center mt-1">
          <div class="text-[10px]">&nbsp;</div>
          <div class="text-xs">&nbsp;</div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class PokemonSpriteComponent {
  private datasetService = inject(DatasetService);
  private typeColorService = inject(TypeColorService);

  pokemonSlug = input<string | null>(null);
  isOwned = input<boolean>(false);
  isShiny = input<boolean>(false);

  pokemonName = signal('...');
  pokemonNid = signal('');
  spriteUrl = signal('');
  pokemonTypes = signal<string[]>([]);
  isHovered = signal(false);

  borderStyle = computed(() => {
    if (!this.isHovered()) return { 'border-color': 'transparent' };

    const types = this.pokemonTypes();
    if (types.length === 0) return { 'border-color': 'transparent' };

    if (types.length === 1) {
      return { 'border-color': this.typeColorService.getTypeColor(types[0]) };
    }
    const color1 = this.typeColorService.getTypeColor(types[0]);
    const color2 = this.typeColorService.getTypeColor(types[1]);

    return {
      'background-image': `linear-gradient(var(--color-surface), var(--color-surface)), linear-gradient(to right, ${color1}, ${color2})`,
      'background-origin': 'border-box',
      'background-clip': 'padding-box, border-box',
      border: '2px solid transparent',
    };
  });

  onHover() {
    this.isHovered.set(true);
  }

  onLeave() {
    this.isHovered.set(false);
  }

  constructor() {
    effect(() => {
      const slug = this.pokemonSlug();
      if (slug) {
        this.datasetService.loadPokemonBySlug(slug).subscribe({
          next: (pokemon) => {
            this.pokemonName.set(pokemon.names.deu || pokemon.names.eng);
            this.pokemonNid.set(this.formatNid(pokemon.nid));
            this.spriteUrl.set(this.datasetService.getSpriteUrl(pokemon, this.isShiny()));

            const types = [pokemon.type1];
            if (pokemon.type2) types.push(pokemon.type2);
            this.pokemonTypes.set(types);
          },
          error: () => {
            this.pokemonName.set('Unknown');
            this.pokemonNid.set('????');
            this.spriteUrl.set('');
            this.pokemonTypes.set([]);
          },
        });
      } else {
        this.pokemonName.set('');
        this.pokemonNid.set('');
        this.spriteUrl.set('');
        this.pokemonTypes.set([]);
      }
    });
  }

  private formatNid(nid: string | number): string {
    return (
      '#' +
      String(nid)
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-')
    );
  }
}
