import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DatasetService } from '../../../../core/api/services/dataset.service';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { PokemonLanguageService } from '../../../../core/services/pokemon-language.service';
import { FormatAbilityPipe } from '../../../../shared/pipes/ability.pipe';
import { getShortGameName, getGameIconPath } from '../../../../core/constants/game-data.constants';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';

@Component({
  selector: 'app-pokemon-detail-info',
  standalone: true,
  imports: [CommonModule, TooltipDirective, CapitalizePipe, FormatAbilityPipe, CdnUrlPipe],
  template: `
    <div
      class="bg-[var(--color-bg-secondary)] rounded-3xl border border-theme p-6 sm:p-10 shadow-md"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div class="space-y-6">
          <h2 class="text-xl font-bold text-text-primary pb-2">Characteristics</h2>

          <div class="flex flex-col gap-6">
            <div class="flex items-start gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                fill="currentColor"
                class="w-5 h-5 shrink-0 mt-0.5 opacity-80"
              >
                <path
                  d="m600-120-240-84-186 72q-20 8-37-4.5T120-170v-560q0-13 7.5-23t20.5-15l212-72 240 84 186-72q20-8 37 4.5t17 33.5v560q0 13-7.5 23T812-192l-212 72Zm-40-98v-468l-160-56v468l160 56Zm80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z"
                />
              </svg>
              <div class="space-y-1">
                <h3
                  class="text-xs uppercase font-bold tracking-wider text-[var(--color-text-secondary)]"
                >
                  Region
                </h3>
                <p class="text-base font-medium">
                  {{ pokemon().region | capitalize }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-1.5">
              <img
                [src]="'virtual-console-white.png' | cdnUrl: 'origin_marks'"
                class="w-5 h-5 shrink-0 mt-0.5 invert dark:invert-0 opacity-80"
                alt="Generation"
              />
              <div class="space-y-1">
                <h3
                  class="text-xs uppercase font-bold tracking-wider text-[var(--color-text-secondary)]"
                >
                  Generation
                </h3>
                <p class="text-base font-medium">{{ pokemon().gen }}</p>
              </div>
            </div>
            <div class="flex items-start gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                fill="currentColor"
                class="w-5 h-5 shrink-0 mt-0.5 opacity-80"
              >
                <path
                  d="M179.94-255Q149-255 127-277.03q-22-22.04-22-52.98v-300.05Q105-661 127.03-683q22.04-22 52.98-22h600.05Q811-705 833-682.97q22 22.04 22 52.98v300.05Q855-299 832.97-277q-22.04 22-52.98 22H179.94Zm.06-75h600v-300H667.5v150h-75v-150h-75v150h-75v-150h-75v150h-75v-150H180v300Zm112.5-150h75-75Zm150 0h75-75Zm150 0h75-75ZM480-480Z"
                />
              </svg>
              <div class="space-y-1">
                <h3
                  class="text-xs uppercase font-bold tracking-wider text-[var(--color-text-secondary)]"
                >
                  Height
                </h3>
                <p class="text-base font-medium">{{ height() }}</p>
              </div>
            </div>
            <div class="flex items-start gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                fill="currentColor"
                class="w-5 h-5 shrink-0 mt-0.5 opacity-80"
              >
                <path
                  d="M237-197.5h486l-58-405H295l-58 405Zm242.96-480q18.04 0 30.29-12.21 12.25-12.2 12.25-30.25 0-18.04-12.21-30.29-12.2-12.25-30.25-12.25-18.04 0-30.29 12.21-12.25 12.2-12.25 30.25 0 18.04 12.21 30.29 12.2 12.25 30.25 12.25Zm109.54 0H665q28.18 0 48.84 18.5 20.66 18.5 25.16 46l58 405q5 33.82-17.17 59.66Q757.66-122.5 723-122.5H237q-34.66 0-56.83-25.84T163-208l58-405q4.5-27.5 25.16-46T295-677.5h75.5q-4-10.5-6-20.63-2-10.14-2-21.87 0-48.96 34.28-83.23t83.25-34.27q48.97 0 83.22 34.27T597.5-720q0 11.73-2 21.87-2 10.13-6 20.63ZM237-197.5h486-486Z"
                />
              </svg>
              <div class="space-y-1">
                <h3
                  class="text-xs uppercase font-bold tracking-wider text-[var(--color-text-secondary)]"
                >
                  Weight
                </h3>
                <p class="text-base font-medium">{{ weight() }}</p>
              </div>
            </div>
            <div class="flex items-start gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                fill="currentColor"
                class="w-5 h-5 shrink-0 mt-0.5 opacity-80"
              >
                <path
                  d="M480-90q-80.5 0-151.5-30.75t-124-83.75q-53-53-83.75-124T90-480q0-81.5 31.5-152.5T207-756.25Q261-809 333.5-839.5T488-870q77.5 0 146.75 27t121.5 74.25q52.25 47.25 83 111.75T870-518q0 112-67.75 171.5T637-287h-72q-10.5 0-15.25 5.75T545-268q0 13 15 37.25T575-177q0 42.5-24.5 64.75T480-90Zm0-390Zm-176.25 20.75Q320-475.5 320-500t-16.25-40.75Q287.5-557 263-557t-40.75 16.25Q206-524.5 206-500t16.25 40.75Q238.5-443 263-443t40.75-16.25Zm119-158Q439-633.5 439-658t-16.25-40.75Q406.5-715 382-715t-40.75 16.25Q325-682.5 325-658t16.25 40.75Q357.5-601 382-601t40.75-16.25Zm197 0Q636-633.5 636-658t-16.25-40.75Q603.5-715 579-715t-40.75 16.25Q522-682.5 522-658t16.25 40.75Q554.5-601 579-601t40.75-16.25Zm118 158Q754-475.5 754-500t-16.25-40.75Q721.5-557 697-557t-40.75 16.25Q640-524.5 640-500t16.25 40.75Q672.5-443 697-443t40.75-16.25ZM480-165q9 0 14.5-5t5.5-13q0-14-14.5-33.5T471-273q0-41.5 28.25-65.25T569-362h68q66 0 112-37.75T795-518q0-118.5-91.25-197.75T488-795q-133.5 0-228.25 91.5T165-480q0 130.5 92.25 222.75T480-165Z"
                />
              </svg>
              <div class="space-y-1">
                <h3
                  class="text-xs uppercase font-bold tracking-wider text-[var(--color-text-secondary)]"
                >
                  Color
                </h3>
                <p class="text-base font-medium">
                  {{ color() }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                fill="currentColor"
                class="w-5 h-5 shrink-0 mt-0.5 opacity-80"
              >
                <path
                  d="M312-320h64l32-92h146l32 92h62L512-680h-64L312-320Zm114-144 52-150h4l52 150H426Zm54 436L346-160H160v-186L28-480l132-134v-186h186l134-132 134 132h186v186l132 134-132 134v186H614L480-28Zm0-112 100-100h140v-140l100-100-100-100v-140H580L480-820 380-720H240v140L140-480l100 100v140h140l100 100Zm0-340Z"
                />
              </svg>
              <div class="space-y-1">
                <h3
                  class="text-xs uppercase font-bold tracking-wider text-[var(--color-text-secondary)] mb-2"
                >
                  Abilities
                </h3>
                <div class="flex flex-col gap-1 text-sm">
                  @for (ability of pokemonAbilities(); track ability.name) {
                    <span
                      class="text-base font-medium"
                      [class.text-text-primary]="!ability.isHidden"
                      [class.text-text-secondary]="ability.isHidden"
                      [title]="ability.isHidden ? 'Hidden Ability' : ''"
                    >
                      {{ ability.name | formatAbility }}

                      @if (ability.isHidden) {
                        <span class="opacity-70 text-xs ml-1">(Hidden)</span>
                      }
                    </span>
                  }
                </div>
              </div>
            </div>
            <div class="flex items-start gap-1.5 w-full max-w-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-venus-and-mars-icon lucide-venus-and-mars"
              >
                <path d="M10 20h4" />
                <path d="M12 16v6" />
                <path d="M17 2h4v4" />
                <path d="m21 2-5.46 5.46" />
                <circle cx="12" cy="11" r="5" />
              </svg>
              <div class="space-y-1 w-full">
                <h3
                  class="text-xs uppercase font-bold tracking-wider text-[var(--color-text-secondary)]"
                >
                  Gender Ratio
                </h3>
                <div class="w-full mt-2">
                  @if (pokemon().maleRate === -1) {
                    <span class="text-text-secondary italic">Genderless</span>
                  } @else {
                    <div class="flex items-center justify-between text-sm font-bold w-full mb-3">
                      <span class="flex items-center text-blue-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="currentColor"
                        >
                          <path
                            d="M797.5-797.5v235h-75V-669L558-505.5q19 28 29.25 59.66Q597.5-414.18 597.5-380q0 90.95-63.28 154.23-63.28 63.27-154.25 63.27t-154.22-63.28q-63.25-63.28-63.25-154.25t63.27-154.22Q289.05-597.5 380-597.5q33.5 0 65.5 10T505-558l164-164.5H562.5v-75h235ZM279.25-480.78q-41.75 41.73-41.75 100.75 0 59.03 41.72 100.78 41.73 41.75 100.75 41.75 59.03 0 100.78-41.72 41.75-41.73 41.75-100.75 0-59.03-41.72-100.78-41.73-41.75-100.75-41.75-59.03 0-100.78 41.72Z"
                          />
                        </svg>
                        {{ maleRate() }}% Male
                      </span>
                      <span class="flex items-center text-pink-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#d6428c"
                        >
                          <path
                            d="M442.5-122.5v-80h-80v-75h80V-366q-78.5-14-129.25-74.6Q262.5-501.19 262.5-581q0-90.37 63.5-153.44 63.5-63.06 154-63.06t154 63.06q63.5 63.07 63.5 153.44 0 79.81-50.75 140.4Q596-380 517.5-366v88.5h80v75h-80v80h-75Zm138.25-356.72q41.75-41.73 41.75-100.75 0-59.03-41.72-100.78-41.73-41.75-100.75-41.75-59.03 0-100.78 41.72-41.75 41.73-41.75 100.75 0 59.03 41.72 100.78 41.73 41.75 100.75 41.75 59.03 0 100.78-41.72Z"
                          />
                        </svg>
                        {{ femaleRate() }}% Female
                      </span>
                    </div>
                    <div
                      class="w-full h-2 sm:h-2.5 rounded-full flex overflow-hidden bg-surface-hover shadow-inner"
                    >
                      <div
                        class="h-full bg-blue-500/90 transition-all duration-700"
                        [style.width.%]="maleRate()"
                      ></div>
                      <div
                        class="h-full bg-pink-500/90 transition-all duration-700"
                        [style.width.%]="femaleRate()"
                      ></div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <h2 class="text-xl font-bold text-text-primary pb-2">Availability</h2>

          <div class="bg-secondary/20 h-full min-h-[250px] mt-0">
            <p class="text-sm text-text-secondary mb-4">
              <span class="font-semibold text-text-primary">{{ primaryName() }}</span> can be
              obtained in the following games (or their DLCs) through regular gameplay:
            </p>

            <div class="flex flex-wrap gap-4">
              @for (game of obtainableGames(); track game.code) {
                @if (game.iconUrl) {
                  <img
                    (click)="navigateToGame(game.code)"
                    [src]="game.iconUrl | cdnUrl: 'games'"
                    [alt]="game.name"
                    [appTooltip]="game.name"
                    class="h-14 w-14 sm:h-16 sm:w-16 object-contain drop-shadow hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                    draggable="false"
                  />
                } @else {
                  <span
                    (click)="navigateToGame(game.code)"
                    class="px-2 py-1 text-text-secondary rounded text-xs uppercase font-bold tracking-wider flex items-center cursor-pointer transition-colors duration-200"
                  >
                    {{ game.name }}
                  </span>
                }
              }

              @if (!obtainableGames().length && !pokemon().eventOnlyIn.length) {
                <span class="text-sm text-text-tertiary italic">Data not available</span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PokemonDetailInfoComponent {
  private readonly router = inject(Router);
  private readonly datasetService = inject(DatasetService);
  private readonly languageService = inject(PokemonLanguageService);

  pokemon = input.required<DatasetPokemon>();

  primaryName = computed(() => {
    return this.languageService.getName(this.pokemon());
  });

  pokemonAbilities = computed(() => {
    const pkmn = this.pokemon();
    const abilities = [];

    if (pkmn.ability1) {
      abilities.push({ name: pkmn.ability1, isHidden: false });
    }
    if (pkmn.ability2) {
      abilities.push({ name: pkmn.ability2, isHidden: false });
    }
    if (pkmn.abilityHidden) {
      abilities.push({ name: pkmn.abilityHidden, isHidden: true });
    }

    return abilities;
  });

  height = computed(() => {
    if (!this.pokemon().height) return '? m';
    return `${this.pokemon().height} m`;
  });

  weight = computed(() => {
    if (!this.pokemon().weight) return '? kg';
    return `${this.pokemon().weight} kg`;
  });

  color = computed(() => {
    return this.pokemon().color.slice(0, 1).toUpperCase() + this.pokemon().color.slice(1);
  });

  maleRate = computed(() => {
    return this.formatGenderRate(this.pokemon().maleRate);
  });

  femaleRate = computed(() => {
    return this.formatGenderRate(this.pokemon().femaleRate);
  });

  obtainableGames = computed(() => {
    const games = this.pokemon().obtainableIn || [];

    return games.map((gameCode) => ({
      code: gameCode,
      name: getShortGameName(gameCode),
      iconUrl: getGameIconPath(gameCode),
    }));
  });

  formatGenderRate(rate: number): string {
    return Number(rate).toFixed(1).replace('.0', '');
  }

  navigateToGame(gameId: string) {
    this.datasetService.loadGames().subscribe((games) => {
      const foundGame = games.find((game) => game.id === gameId);
      if (foundGame && foundGame.nameSlug) {
        this.router.navigate(['/games', foundGame.nameSlug]);
      } else {
        this.router.navigate(['/games']);
      }
    });
  }
}
