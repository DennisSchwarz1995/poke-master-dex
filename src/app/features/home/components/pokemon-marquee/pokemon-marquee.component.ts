import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { POKEMON_SPECIAL_FORMS } from '../../../../core/constants/pokemon-forms.constants';

@Component({
  selector: 'app-pokemon-marquee',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe],
  template: `
    <section
      class="relative w-full overflow-hidden flex flex-col gap-3 sm:gap-4 mb-10 max-w-[1920px]"
    >
      <div class="relative overflow-hidden w-full group">
        <div
          class="flex gap-8 animate-marquee w-max whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]"
        >
          @for (pokemon of marqueeRow1; track $index) {
            <div
              class="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center shrink-0"
            >
              <img
                [src]="
                  (pokemon.isShiny ? 'shiny/' : 'normal/') + pokemon.id + '.png'
                    | cdnUrl: 'sprites/base'
                "
                class="h-auto w-24 max-w-none object-contain select-none"
                alt="pokemon"
                loading="eager"
                decoding="async"
              />
              @if (pokemon.isShiny) {
                <img
                  [src]="'shiny.png' | cdnUrl: 'special_attributes'"
                  alt="shiny"
                  class="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              }
            </div>
          }
        </div>
        <div
          class="flex gap-8 animate-marquee-copy w-max absolute top-0 left-0 whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]"
          aria-hidden="true"
        >
          @for (pokemon of marqueeRow1; track $index) {
            <div
              class="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center shrink-0"
            >
              <img
                [src]="
                  (pokemon.isShiny ? 'shiny/' : 'normal/') + pokemon.id + '.png'
                    | cdnUrl: 'sprites/base'
                "
                class="h-auto w-24 max-w-none object-contain select-none"
                alt="pokemon"
                loading="eager"
                decoding="async"
              />
              @if (pokemon.isShiny) {
                <img
                  [src]="'shiny.png' | cdnUrl: 'special_attributes'"
                  alt="shiny"
                  class="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              }
            </div>
          }
        </div>
      </div>

      <div class="relative overflow-hidden w-full group">
        <div
          class="flex gap-8 animate-marquee-rev w-max whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]"
        >
          @for (pokemon of marqueeRow2; track $index) {
            <div
              class="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center shrink-0"
            >
              <img
                [src]="
                  (pokemon.isShiny ? 'shiny/' : 'normal/') + pokemon.id + '.png'
                    | cdnUrl: 'sprites/base'
                "
                class="h-auto w-24 max-w-none object-contain select-none"
                alt="pokemon"
                loading="eager"
                decoding="async"
              />
              @if (pokemon.isShiny) {
                <img
                  [src]="'shiny.png' | cdnUrl: 'special_attributes'"
                  alt="shiny"
                  class="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              }
            </div>
          }
        </div>
        <div
          class="flex gap-8 animate-marquee-rev-copy w-max absolute top-0 left-0 whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]"
          aria-hidden="true"
        >
          @for (pokemon of marqueeRow2; track $index) {
            <div
              class="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center shrink-0"
            >
              <img
                [src]="
                  (pokemon.isShiny ? 'shiny/' : 'normal/') + pokemon.id + '.png'
                    | cdnUrl: 'sprites/base'
                "
                class="h-auto w-24 max-w-none object-contain select-none"
                alt="pokemon"
                loading="eager"
                decoding="async"
              />
              @if (pokemon.isShiny) {
                <img
                  [src]="'shiny.png' | cdnUrl: 'special_attributes'"
                  alt="shiny"
                  class="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class PokemonMarqueeComponent implements OnInit {
  marqueeRow1: { id: string | number; isShiny: boolean }[] = [];
  marqueeRow2: { id: string | number; isShiny: boolean }[] = [];

  ngOnInit() {
    for (let i = 0; i < 15; i++) {
      this.marqueeRow1.push(this.generateRandomPokemon());
      this.marqueeRow2.push(this.generateRandomPokemon());
    }
  }

  private generateRandomPokemon(): { id: number; isShiny: boolean } {
    const isShiny = Math.floor(Math.random() * 8192) === 0;
    let finalId = Math.floor(Math.random() * 1025) + 1;
    const specialForms = POKEMON_SPECIAL_FORMS[finalId];

    if (specialForms) {
      if (Math.random() < 0.3) {
        const randomFormIndex = Math.floor(Math.random() * specialForms.length);
        finalId = specialForms[randomFormIndex];
      }
    }
    return { id: finalId, isShiny };
  }
}
