import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DatasetService } from '../../../../core/api/services/dataset.service';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';
import { PokemonLanguageService } from '../../../../core/services/pokemon-language.service';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { DexNumberPipe } from '../../../../shared/pipes/dex-number.pipe';
import { StatPercentPipe } from '../../../../shared/pipes/stat-percent.pipe';
import { StatColorPipe } from '../../../../shared/pipes/stat-color.pipe';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';

@Component({
  selector: 'app-pokemon-detail-header',
  standalone: true,
  imports: [
    CommonModule,
    TooltipDirective,
    CapitalizePipe,
    DexNumberPipe,
    StatPercentPipe,
    StatColorPipe,
    CdnUrlPipe,
  ],
  template: `
    <div
      class="bg-[var(--color-bg-secondary)] rounded-3xl border border-theme p-6 sm:p-10 shadow-md relative overflow-hidden flex flex-col md:flex-row gap-8"
    >
      <div class="flex-1 flex flex-col z-10">
        <div class="mb-6">
          <div class="text-xs uppercase font-bold tracking-wider text-text-tertiary mb-1">
            {{ formName() }}
          </div>
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
            {{ primaryName() }}
          </h1>

          <div class="flex items-center gap-2 text-lg text-secondary">
            <span class="font-mono rounded text-text-secondary">{{
              pokemon().nid | dexNumber
            }}</span>
            <span>&bull;</span>
            <span>{{ pokemon().genus['eng'] || 'Pokémon' }}</span>
          </div>
        </div>

        <div class="flex gap-3 mb-8">
          @for (type of pokemonTypes(); track type) {
            <button
              (click)="navigateToType(type)"
              [appTooltip]="type | capitalize"
              class="group relative focus:outline-none"
              type="button"
            >
              <img
                [src]="type + '.png' | cdnUrl: 'types'"
                [alt]="type | capitalize"
                class="h-10 drop-shadow-sm rounded-full bg-surface border border-theme transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg group-hover:border-blue-400 cursor-pointer"
                draggable="false"
              />
            </button>
          }
        </div>
        <div class="mt-auto max-w-sm w-full">
          <h2 class="text-xl font-bold text-primary mb-4">Base Stats</h2>

          <div class="space-y-4">
            @for (stat of pokemonStats(); track stat.label) {
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between text-sm font-bold text-primary">
                  <span>{{ stat.label }}</span>
                  <span>{{ stat.value }}</span>
                </div>
                <div class="w-full h-2.5 bg-black/10 dark:bg-black/40 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-1000 ease-out"
                    [style.width.%]="stat.value | statPercent"
                    [style.background-color]="stat.value | statColor"
                  ></div>
                </div>
              </div>
            }
          </div>

          <div class="mt-8 text-center text-primary">
            <span class="text-xl font-bold">
              Base Stats Total: <span class="text-3xl ml-1">{{ totalStats() }}</span>
            </span>
          </div>
        </div>
      </div>
      <div
        class="md:w-1/3 flex items-center justify-center flex-col p-4 bg-secondary/10 relative min-h-[300px]"
      >
        <img
          [src]="imageUrl()"
          [alt]="primaryName()"
          class="w-full h-full max-h-80 object-contain drop-shadow-2xl z-10 transition-transform duration-500 hover:scale-105"
          draggable="false"
        />

        <div class="flex gap-2 absolute bottom-4 right-4">
          <a [href]="serebiiUrl()" target="_blank" class="btn-secondary"
            >Serebii
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-arrow-right-short"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"
              />
            </svg>
          </a>
          <a [href]="bulbapediaUrl()" target="_blank" class="btn-secondary"
            >Bulbapedia
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-arrow-right-short"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class PokemonDetailHeaderComponent {
  private datasetService = inject(DatasetService);
  private languageService = inject(PokemonLanguageService);
  private router = inject(Router);

  pokemon = input.required<DatasetPokemon>();

  primaryName = computed(() => {
    return this.languageService.getName(this.pokemon());
  });

  formName = computed(() => {
    return this.languageService.getFormLabel(this.pokemon());
  });

  totalStats = computed(() => {
    const pokemon = this.pokemon();
    return (
      pokemon.baseHp +
      pokemon.baseAtk +
      pokemon.baseDef +
      pokemon.baseSpAtk +
      pokemon.baseSpDef +
      pokemon.baseSpeed
    );
  });

  imageUrl = computed(() => {
    return (
      this.datasetService.getOfficialArtworkUrl(this.pokemon()) ||
      this.datasetService.getSpriteUrl(this.pokemon())
    );
  });

  serebiiUrl = computed(() => {
    return `https://www.serebii.net/pokemon/${this.primaryName().toLowerCase()}`;
  });

  bulbapediaUrl = computed(() => {
    return `https://bulbapedia.bulbagarden.net/wiki/${this.primaryName().replace(' ', '_')}_(Pokémon)`;
  });

  pokemonTypes = computed(() => {
    const { type1, type2 } = this.pokemon();
    return [type1, type2].filter((type): type is string => !!type);
  });

  pokemonStats = computed(() => {
    const pokemon = this.pokemon();
    return [
      { label: 'HP', value: pokemon.baseHp },
      { label: 'Attack', value: pokemon.baseAtk },
      { label: 'Defense', value: pokemon.baseDef },
      { label: 'Special Attack', value: pokemon.baseSpAtk },
      { label: 'Special Defense', value: pokemon.baseSpDef },
      { label: 'Speed', value: pokemon.baseSpeed },
    ];
  });

  navigateToType(type: string): void {
    this.router.navigate(['/pokemon'], {
      queryParams: { type: type.toLowerCase() },
    });
  }
}
