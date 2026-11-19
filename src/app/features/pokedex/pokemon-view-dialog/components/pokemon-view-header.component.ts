import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxSlot } from '../../../../shared/models/dex.model';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import { ThemeService } from '../../../../core/services/theme.service';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';
import { FallbackImageDirective } from '../../../../shared/directives/fallback-image/fallback-image.directive';

@Component({
  selector: 'app-pokemon-view-header',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe, CapitalizePipe, TooltipDirective, FallbackImageDirective],
  template: `
    <div class="flex items-center gap-4">
      <div class="flex flex-col items-center flex-none">
        <div class="relative w-24 h-24">
          <div
            class="w-full h-full bg-secondary rounded-full flex items-center justify-center border-2 border-theme shadow-inner"
          >
            @if (pokemonData()) {
              <img
                [src]="spriteUrl()"
                [alt]="pokemonData()?.names?.['eng'] || 'Pokemon'"
                class="w-32 h-32 overflow-hidden object-contain drop-shadow-md z-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                appFallback
              />
            }
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 gap-4 self-start min-w-0">
        <div class="flex items-baseline flex-wrap gap-2">
          <h2 class="text-3xl font-semibold truncate">
            {{
              (pokemon().pokemonSlug | capitalize) ||
                pokemon().nickname ||
                pokemon().customName ||
                localizedName() ||
                'Empty Slot'
            }}
          </h2>

          @if (pokemon().level) {
            <div class="font-bold text-secondary flex gap-1">
              <span class="text-2xl">Lv.</span><span class="text-2xl">{{ pokemon().level }}</span>
            </div>
          }

          <div class="flex items-center self-end flex-none">
            <img
              [src]="(pokemon().ball || 'pokeball') + '.webp' | cdnUrl: 'pokeballs'"
              [alt]="pokemon().ball || 'pokeball' | capitalize"
              [appTooltip]="pokemon().ball || 'No Ball selected' | capitalize"
              class="w-8 h-8 object-contain transition-all duration-300"
              [class.grayscale]="!pokemon().ball"
              appFallback
            />
          </div>

          @if (pokemon().gender === 'male') {
            <img
              [src]="'male.svg' | cdnUrl: 'icons'"
              [appTooltip]="'Male'"
              alt="Male"
              class="flex-none w-8 h-8 self-end"
            />
          }
          @if (pokemon().gender === 'female') {
            <img
              [src]="'female.svg' | cdnUrl: 'icons'"
              [appTooltip]="'Female'"
              alt="Female"
              class="flex-none w-8 h-8 self-end"
            />
          }
        </div>
        <section class="flex flex-row gap-4 items-center">
          @if (pokemon().isShiny) {
            <div
              class="bg-surface flex items-center justify-center flex-none"
              [appTooltip]="'Shiny'"
            >
              <img
                [src]="'shiny.png' | cdnUrl: 'special_attributes'"
                class="w-6 h-6 object-contain"
                alt="Shiny"
              />
            </div>
          }

          @if (pokemon().isGmax) {
            <img
              [src]="'gigantamax.png' | cdnUrl: 'special_attributes'"
              alt="'Gigantamax'"
              class="h-6 w-6 object-contain flex-none"
              [appTooltip]="'Gigantamax'"
            />
          }
          @if (pokemon().isAlpha) {
            <img
              [src]="'alpha.png' | cdnUrl: 'special_attributes'"
              alt="Alpha"
              class="h-6 w-6 object-contain flex-none"
              [appTooltip]="'Alpha'"
            />
          }

          @if (pokemon().isEvent) {
            <span
              class="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded font-bold border border-purple-200 shadow-sm flex-none"
              >Event</span
            >
          }

          @if (originMark()) {
            <div
              class="w-6 h-6 flex items-center justify-center opacity-70"
              [appTooltip]="originMark()!.name"
            >
              <img
                [src]="
                  (themeService.currentTheme() === 'dark'
                    ? originMark()!.id + '-white.png'
                    : originMark()!.id + '-black.png'
                  ) | cdnUrl: 'origin_marks'
                "
                [alt]="originMark()!.name"
              />
            </div>
          }
        </section>
      </div>
    </div>
  `,
})
export class PokemonViewHeaderComponent {
  themeService = inject(ThemeService);

  pokemon = input.required<BoxSlot>();
  pokemonData = input<DatasetPokemon | null>(null);
  spriteUrl = input.required<string>();
  localizedName = input.required<string>();
  originMark = input<{ id: string; name: string } | null>(null);
}
