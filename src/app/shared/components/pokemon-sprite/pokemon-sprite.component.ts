import { Component, input, computed, signal, effect, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { TypeColorService } from '../../../core/services/type-color.service';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { CdnUrlPipe } from '../../pipes/cdnUrl.pipe';
import { AVAILABLE_SPRITES } from '../../../core/constants/available-sprites.constants';

@Component({
  selector: 'app-pokemon-sprite',
  standalone: true,
  imports: [CommonModule, TooltipDirective, CdnUrlPipe],
  template: `
    <div
      class="flex flex-col items-center p-2 rounded-lg transition-all duration-200 cursor-pointer border-2 bg-surface-raised"
      style="corner-shape: squircle;"
      [ngStyle]="borderStyle()"
      [class.shadow-lg]="isHovered()"
      [class.scale-105]="isHovered()"
      [class.z-20]="isHovered()"
      [class.grayscale]="!isOwned()"
      [class.opacity-40]="!isOwned()"
      (mouseenter)="onHover()"
      (mouseleave)="onLeave()"
      [appTooltip]="pokemonName() + ' ' + pokemonNid()"
      tooltipPosition="top"
    >
      @if (pokemonSlug()) {
        <div class="relative w-16 h-16">
          <img
            [src]="spriteUrl()"
            [alt]="pokemonName()"
            class="w-full h-full object-contain"
            loading="lazy"
          />
          <div
            class="absolute inset-0 pointer-events-none p-[2px] flex flex-col justify-between z-10"
          >
            <div class="flex justify-between items-start">
              @if (showPokeballIcon() && ball()) {
                <img
                  [src]="getBallImage(ball()!) | cdnUrl: 'pokeballs'"
                  class="w-3.5 h-3.5 object-contain drop-shadow"
                />
              } @else {
                <div></div>
              }
              @if (showShinyIcon() && isShiny()) {
                <img
                  [src]="'shiny-stars.png' | cdnUrl: 'special_attributes'"
                  class="w-4 h-4 object-contain drop-shadow"
                />
              }
            </div>
            <div class="flex justify-between items-end">
              @if (showGmaxIcon() && isGmax()) {
                <img
                  [src]="'gigantamax.png' | cdnUrl: 'special_attributes'"
                  class="w-4 h-4 object-contain drop-shadow"
                />
              } @else {
                <div></div>
              }
              @if (showAlphaIcon() && isAlpha()) {
                <img
                  [src]="'alpha.png' | cdnUrl: 'special_attributes'"
                  class="w-4 h-4 object-contain drop-shadow"
                />
              }
            </div>
          </div>
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
  private pokemonLangService = inject(PokemonLanguageService);

  pokemonSlug = input<string | null>(null);
  isOwned = input<boolean>(false);
  isShiny = input<boolean>(false);
  isGmax = input<boolean>(false);
  isAlpha = input<boolean>(false);
  ball = input<string | undefined>(undefined);

  showShinyIcon = input<boolean>(false);
  showGmaxIcon = input<boolean>(false);
  showAlphaIcon = input<boolean>(false);
  showPokeballIcon = input<boolean>(false);

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
      'background-image': `linear-gradient(var(--color-surface-raised), var(--color-surface-raised)), linear-gradient(to right, ${color1}, ${color2})`,
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
      const lang = this.pokemonLangService.currentLang(); // Track language changes
      if (slug) {
        this.datasetService.loadPokemonBySlug(slug).subscribe({
          next: (pokemon) => {
            this.pokemonName.set(this.pokemonLangService.getName(pokemon));
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

  getBallImage(ballId: string): string {
    return AVAILABLE_SPRITES.pokeballs.has(ballId) ? `${ballId}.webp` : 'pokeball.webp';
  }
}
