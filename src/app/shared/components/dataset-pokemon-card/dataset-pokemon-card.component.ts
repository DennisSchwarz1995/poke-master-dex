import { Component, input, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DatasetPokemon, DatasetService } from '../../../core/api/services/dataset.service';
import { TypeColorService } from '../../../core/services/type-color.service';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { CdnUrlPipe } from '../../pipes/cdnUrl.pipe';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-dataset-pokemon-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, CapitalizePipe, CdnUrlPipe, TooltipDirective],
  template: `
    <a
      [routerLink]="['/pokemon', pokemon().id]"
      class="group block relative w-full h-full bg-surface border-2 rounded-2xl shadow-md hover:shadow-xl dark:border-white/5 dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col items-center p-4 overflow-hidden cursor-pointer"
      [class.opacity-40]="isGreyedOut()"
      [class.grayscale]="isGreyedOut()"
      [ngStyle]="getCardBorderStyle()"
      (mouseenter)="isHovered.set(true)"
      (mouseleave)="isHovered.set(false)"
    >
      <div
        class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        [style.background-color]="typeColorService.getTypeColor(pokemon().type1)"
      ></div>

      <div class="absolute top-2.5 right-2.5 flex flex-row gap-1.5 z-20">
        <img
          [src]="pokemon().type1 + '.png' | cdnUrl: 'types'"
          [alt]="pokemon().type1 | capitalize"
          [appTooltip]="pokemon().type1 | capitalize"
          class="h-4 drop-shadow-md rounded-full bg-surface"
          (error)="onImageError($event)"
          draggable="false"
          [appTooltip]="pokemon().type1 | capitalize"
        />
        @if (pokemon().type2) {
          <img
            [src]="pokemon().type2 + '.png' | cdnUrl: 'types'"
            [alt]="pokemon().type2 | capitalize"
            [appTooltip]="pokemon().type2 | capitalize"
            class="h-4 drop-shadow-md rounded-full bg-surface"
            (error)="onImageError($event)"
            draggable="false"
          />
        }
      </div>

      <img
        [src]="datasetService.getSpriteUrl(pokemon())"
        [alt]="getPrimaryName()"
        [title]="getPrimaryName()"
        class="w-20 h-20 sm:w-24 sm:h-24 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-lg z-10 mt-1"
        loading="lazy"
        (error)="onImageError($event)"
        draggable="false"
      />

      <div class="z-10 flex flex-col items-center gap-1 mt-3 w-full">
        <span
          class="text-xs font-mono font-bold text-tertiary group-hover:text-primary transition-colors tracking-widest text-center"
          >#{{ pokemon().nid.slice(0, 4) }}</span
        >

        <span
          class="text-sm sm:text-base font-bold text-primary truncate w-full text-center leading-tight mt-0.5"
          >{{ getPrimaryName() }}</span
        >

        @if (getFormLabel()) {
          <span
            class="text-[10px] sm:text-xs font-medium text-secondary leading-tight italic truncate w-full text-center"
          >
            {{ getFormLabel() }}
          </span>
        }
      </div>
    </a>
  `,
})
export class DatasetPokemonCardComponent {
  datasetService = inject(DatasetService);
  typeColorService = inject(TypeColorService);
  langService = inject(PokemonLanguageService);

  pokemon = input.required<DatasetPokemon>();
  isGreyedOut = input<boolean>(false);

  isHovered = signal(false);

  getPrimaryName(): string {
    return this.langService.getName(this.pokemon());
  }

  getFormLabel(): string {
    return this.langService.getFormLabel(this.pokemon());
  }

  getCardBorderStyle(): Record<string, string> {
    const pkmn = this.pokemon();
    if (!this.isHovered()) {
      return { 'border-color': 'transparent' };
    }

    const color1 = this.typeColorService.getTypeColor(pkmn.type1);
    if (!pkmn.type2) {
      return { 'border-color': color1 };
    }
    const color2 = this.typeColorService.getTypeColor(pkmn.type2);
    return {
      'background-image':
        'linear-gradient(var(--color-surface), var(--color-surface)), linear-gradient(to bottom right, ' +
        color1 +
        ', ' +
        color2 +
        ')',
      'background-origin': 'border-box',
      'background-clip': 'padding-box, border-box',
      'border-color': 'transparent',
    };
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
