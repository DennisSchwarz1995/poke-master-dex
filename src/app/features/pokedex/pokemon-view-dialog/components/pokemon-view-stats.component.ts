import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxSlot, StatsMap } from '../../../../shared/models/dex.model';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import { PokemonStatchartComponent } from '../../../../shared/components/pokemon-statchart/pokemon-statchart.component';
import { DatasetService } from '../../../../core/api/services/dataset.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card/stat-card.component';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-pokemon-view-stats',
  standalone: true,
  imports: [
    CommonModule,
    PokemonStatchartComponent,
    StatCardComponent,
    CdnUrlPipe,
    TooltipDirective,
  ],
  template: `
    <div class="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <section class="flex flex-col gap-4">
        <app-stat-card [label]="'Nature'"> {{ natureName() }} </app-stat-card>
        <app-stat-card [label]="'Mint'"> {{ mintName() }} </app-stat-card>
        <app-stat-card [label]="'Ability'"> {{ abilityName() }} </app-stat-card>
        <app-stat-card [label]="'Tera Type'">
          @if (pokemon().teraType) {
            <div class="flex items-center gap-2">
              <img
                [src]="pokemon().teraType + '.png' | cdnUrl: 'types'"
                [alt]="pokemon().teraType"
                class="w-6 h-6 object-contain flex-shrink-0 drop-shadow-sm rounded-lg"
                (error)="onImgError($event)"
                [appTooltip]="teraTypeName()"
                tooltipPosition="top"
                loading="lazy"
              />
            </div>
          } @else {
            {{ teraTypeName() }}
          }
        </app-stat-card>
      </section>

      <div class="bg-surface rounded-xl p-4">
        <app-pokemon-statchart
          [pokemonData]="pokemonData()"
          [pokemon]="pokemon()"
        ></app-pokemon-statchart>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        @for (stat of statKeys; track stat.key) {
          <div class="bg-surface-raised rounded-xl p-3 flex flex-col gap-3 shadow-sm">
            <span
              class="text-sm font-bold"
              [ngClass]="{
                'text-[#e46787]': activeNature()?.raises === stat.key,
                'text-[#3babdf]': activeNature()?.lowers === stat.key,
                'text-primary':
                  activeNature()?.raises !== stat.key && activeNature()?.lowers !== stat.key,
              }"
            >
              {{ stat.label }}
            </span>

            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-4">
                <div class="relative flex-1 h-4 bg-[--color-surface] rounded-xl overflow-hidden">
                  <div
                    class="absolute top-0 left-0 h-full bg-[--color-bg-active]"
                    [style.width.%]="(getEffectiveIv(stat.key) / 31) * 100"
                  ></div>
                  <div
                    class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary z-10"
                  >
                    IV
                  </div>
                </div>
                <span class="text-xs font-bold text-right min-w-[24px] text-primary">
                  {{ isHt(stat.key) ? 'HT' : getIv(stat.key) }}
                </span>
              </div>

              <div class="flex items-center gap-4">
                <div class="relative flex-1 h-4 bg-[--color-surface] rounded-xl overflow-hidden">
                  <div
                    class="absolute top-0 left-0 h-full bg-[--color-bg-active]"
                    [style.width.%]="(getEv(stat.key) / 252) * 100"
                  ></div>
                  <div
                    class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary z-10"
                  >
                    EV
                  </div>
                </div>
                <span class="text-xs font-bold text-primary text-right min-w-[24px]">
                  {{ getEv(stat.key) }}
                </span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class PokemonViewStatsComponent {
  pokemon = input.required<BoxSlot>();
  pokemonData = input.required<DatasetPokemon>();

  private datasetService = inject(DatasetService);
  allNatures = toSignal(this.datasetService.loadNatures(), { initialValue: [] });
  allAbilities = toSignal(this.datasetService.loadAbilities(), { initialValue: [] });

  statKeys: { key: keyof StatsMap; label: string }[] = [
    { key: 'hp', label: 'HP' },
    { key: 'atk', label: 'Attack' },
    { key: 'def', label: 'Defense' },
    { key: 'spa', label: 'Sp. Atk' },
    { key: 'spd', label: 'Sp. Def' },
    { key: 'spe', label: 'Speed' },
  ];

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  activeNature = computed(() => {
    const mint = this.pokemon().mint;
    const natId = mint || this.pokemon().nature;
    return this.allNatures().find((n) => n.id === natId) ?? null;
  });

  getEv(stat: keyof StatsMap): number {
    return this.pokemon().evs?.[stat] ?? 0;
  }

  getIv(stat: keyof StatsMap): number {
    return this.pokemon().ivs?.[stat] ?? (stat === 'hp' ? 31 : 31);
  }

  isHt(stat: keyof StatsMap): boolean {
    return this.pokemon().hyperTrained?.includes(stat) ?? false;
  }

  totalEvs = computed(() => {
    return this.statKeys.reduce((acc, s) => acc + this.getEv(s.key), 0);
  });

  totalIvs = computed(() => {
    return this.statKeys.reduce((acc, s) => acc + this.getIv(s.key), 0);
  });

  getEffectiveIv(stat: keyof StatsMap): number {
    return this.isHt(stat) ? 31 : this.getIv(stat);
  }

  natureName = computed(() => {
    const natId = this.pokemon().nature;
    if (!natId) return '—';
    const nature = this.allNatures().find((n) => n.id === natId);
    return nature ? this.capitalize(nature.name) : this.capitalize(natId);
  });

  mintName = computed(() => {
    const mintId = this.pokemon().mint;
    if (!mintId) return '—';
    const nature = this.allNatures().find((n) => n.id === mintId);
    return nature ? this.capitalize(nature.name) + ' Mint' : this.capitalize(mintId);
  });

  abilityName = computed(() => {
    const abilityId = this.pokemon().ability;
    if (!abilityId) return '—';
    const ability = this.allAbilities().find((a) => a.id === abilityId);
    return ability ? ability.name : this.capitalize(abilityId);
  });

  teraTypeName = computed(() => {
    const tera = this.pokemon().teraType;
    return tera ? this.capitalize(tera) : '—';
  });

  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  currentStats = computed(() => {
    const data = this.pokemonData();
    const pkmn = this.pokemon();
    const lvl = pkmn.level || 100;
    const nature = this.activeNature();

    if (!data) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    const calcOther = (stat: keyof StatsMap, baseVal: number) => {
      let val = Math.floor(
        Math.floor(
          (2 * baseVal + this.getEffectiveIv(stat) + Math.floor(this.getEv(stat) / 4)) * lvl,
        ) /
          100 +
          5,
      );
      if (nature?.raises === stat) val = Math.floor(val * 1.1);
      if (nature?.lowers === stat) val = Math.floor(val * 0.9);
      return val;
    };

    const hp =
      data.baseHp === 1
        ? 1
        : Math.floor(
            Math.floor(
              (2 * data.baseHp + this.getEffectiveIv('hp') + Math.floor(this.getEv('hp') / 4)) *
                lvl,
            ) /
              100 +
              lvl +
              10,
          );

    return {
      hp,
      atk: calcOther('atk', data.baseAtk),
      def: calcOther('def', data.baseDef),
      spa: calcOther('spa', data.baseSpAtk),
      spd: calcOther('spd', data.baseSpDef),
      spe: calcOther('spe', data.baseSpeed),
    };
  });
}
