import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DatasetPokemon, DatasetService } from '../../../../core/api/services/dataset.service';

@Component({
  selector: 'app-pokemon-detail-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-[var(--color-bg-secondary)] rounded-3xl border border-theme p-6 sm:p-10 shadow-md relative overflow-hidden flex flex-col md:flex-row gap-8"
    >
      <div class="flex-1 flex flex-col z-10">
        <div class="mb-6">
          <div class="text-xs uppercase font-bold tracking-wider text-text-tertiary mb-1">
            {{ getFormName(pokemon) }}
          </div>
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
            {{ getPrimaryName(pokemon) }}
          </h1>

          <div class="flex items-center gap-2 text-lg text-secondary">
            <span class="font-mono rounded text-text-secondary"
              >#{{ formatDexNumber(pokemon.nid) }}</span
            >
            <span>&bull;</span>
            <span>{{ pokemon.genus['eng'] || 'Pokémon' }}</span>
          </div>
        </div>

        <div class="flex gap-3 mb-8">
          @if (pokemon.type1) {
            <button
              (click)="navigateToType(pokemon.type1)"
              [title]="capitalize(pokemon.type1)"
              class="group relative focus:outline-none"
              type="button"
            >
              <img
                [src]="'assets/images/types/' + pokemon.type1 + '.png'"
                [alt]="capitalize(pokemon.type1)"
                class="h-10 drop-shadow-sm rounded-full bg-surface border border-theme transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg group-hover:border-blue-400 cursor-pointer"
                draggable="false"
              />
            </button>
          }
          @if (pokemon.type2) {
            <button
              (click)="navigateToType(pokemon.type2)"
              [title]="capitalize(pokemon.type2)"
              class="group relative focus:outline-none"
              type="button"
            >
              <img
                [src]="'assets/images/types/' + pokemon.type2 + '.png'"
                [alt]="capitalize(pokemon.type2)"
                class="h-10 drop-shadow-sm rounded-full bg-surface border border-theme transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg group-hover:border-blue-400 cursor-pointer"
                draggable="false"
              />
            </button>
          }
        </div>

        <div class="mt-auto max-w-sm w-full">
          <h2 class="text-xl font-bold text-primary mb-4">Base Stats</h2>
          <div class="space-y-4">
            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between text-sm font-bold text-primary">
                <span>HP</span>
                <span>{{ pokemon.baseHp }}</span>
              </div>
              <div class="w-full h-2.5 bg-black/10 dark:bg-black/40 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  [style.width.%]="getStatPercent(pokemon.baseHp)"
                  [style.background-color]="getStatColor(pokemon.baseHp)"
                ></div>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between text-sm font-bold text-primary">
                <span>Attack</span>
                <span>{{ pokemon.baseAtk }}</span>
              </div>
              <div class="w-full h-2.5 bg-black/10 dark:bg-black/40 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  [style.width.%]="getStatPercent(pokemon.baseAtk)"
                  [style.background-color]="getStatColor(pokemon.baseAtk)"
                ></div>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between text-sm font-bold text-primary">
                <span>Defense</span>
                <span>{{ pokemon.baseDef }}</span>
              </div>
              <div class="w-full h-2.5 bg-black/10 dark:bg-black/40 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  [style.width.%]="getStatPercent(pokemon.baseDef)"
                  [style.background-color]="getStatColor(pokemon.baseDef)"
                ></div>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between text-sm font-bold text-primary">
                <span>Special Attack</span>
                <span>{{ pokemon.baseSpAtk }}</span>
              </div>
              <div class="w-full h-2.5 bg-black/10 dark:bg-black/40 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  [style.width.%]="getStatPercent(pokemon.baseSpAtk)"
                  [style.background-color]="getStatColor(pokemon.baseSpAtk)"
                ></div>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between text-sm font-bold text-primary">
                <span>Special Defense</span>
                <span>{{ pokemon.baseSpDef }}</span>
              </div>
              <div class="w-full h-2.5 bg-black/10 dark:bg-black/40 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  [style.width.%]="getStatPercent(pokemon.baseSpDef)"
                  [style.background-color]="getStatColor(pokemon.baseSpDef)"
                ></div>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between text-sm font-bold text-primary">
                <span>Speed</span>
                <span>{{ pokemon.baseSpeed }}</span>
              </div>
              <div class="w-full h-2.5 bg-black/10 dark:bg-black/40 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  [style.width.%]="getStatPercent(pokemon.baseSpeed)"
                  [style.background-color]="getStatColor(pokemon.baseSpeed)"
                ></div>
              </div>
            </div>
          </div>
          <div class="mt-8 text-center text-primary">
            <span class="text-xl font-bold"
              >Base Stats Total:
              <span class="text-3xl ml-1">{{ getTotalStats(pokemon) }}</span></span
            >
          </div>
        </div>
      </div>

      <div
        class="md:w-1/3 flex items-center justify-center flex-col p-4 bg-secondary/10 relative min-h-[300px]"
      >
        <img
          [src]="
            datasetService.getOfficialArtworkUrl(pokemon) || datasetService.getSpriteUrl(pokemon)
          "
          [alt]="getPrimaryName(pokemon)"
          class="w-full h-full max-h-80 object-contain drop-shadow-2xl z-10 transition-transform duration-500 hover:scale-105"
          draggable="false"
        />

        <div class="flex gap-2 absolute bottom-4 right-4">
          <a
            [href]="'https://www.serebii.net/pokemon/' + getPrimaryName(pokemon).toLowerCase()"
            target="_blank"
            class="py-2 pl-5 pr-2.5 flex items-center gap-2 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme"
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
          <a
            [href]="
              'https://bulbapedia.bulbagarden.net/wiki/' +
              getPrimaryName(pokemon).replace(' ', '_') +
              '_(Pokémon)'
            "
            target="_blank"
            class="py-2 pl-5 pr-2.5 flex items-center gap-2 border border-theme rounded-lg bg-surface-hover text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme"
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
  datasetService = inject(DatasetService);
  private router = inject(Router);

  @Input({ required: true }) pokemon!: DatasetPokemon;

  getPrimaryName(pkmn: DatasetPokemon): string {
    return pkmn.names?.['eng'] || pkmn.formNames?.['eng'] || pkmn.id;
  }

  getFormName(pkmn: DatasetPokemon): string {
    return pkmn.formNames?.['eng'] || '';
  }

  navigateToType(type: string) {
    this.router.navigate(['/pokemon'], {
      queryParams: { type: type.toLowerCase() },
    });
  }

  capitalize(s: string | undefined): string {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  getStatPercent(stat: number): number {
    return Math.min(100, Math.max(0, (stat / 200) * 100));
  }

  getStatColor(stat: number): string {
    if (stat < 80) return '#fa2d37';
    if (stat <= 99) return '#ff6a00';
    if (stat <= 129) return '#7ccf00';
    return '#00baa8';
  }

  getTotalStats(pkmn: DatasetPokemon): number {
    return (
      pkmn.baseHp + pkmn.baseAtk + pkmn.baseDef + pkmn.baseSpAtk + pkmn.baseSpDef + pkmn.baseSpeed
    );
  }

  formatDexNumber(dexNumber: string): string {
    return dexNumber
      .split('-')
      .map((number) => number.charAt(0).toUpperCase() + number.slice(1))
      .join('-');
  }
}
