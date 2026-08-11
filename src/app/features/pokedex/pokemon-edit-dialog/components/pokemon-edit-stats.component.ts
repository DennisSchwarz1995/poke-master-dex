import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsMap } from '../../../../shared/models/dex.model';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-pokemon-edit-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective, IconComponent],
  template: `
    <div class="bg-surface border-2 border-theme rounded-xl overflow-hidden">
      <div
        class="grid grid-cols-[60px_1fr_1fr_60px] sm:grid-cols-[80px_1fr_1fr_80px] gap-2 sm:gap-4 p-3 sm:p-4 border-b border-theme text-[10px] font-bold text-secondary uppercase bg-secondary/5"
      >
        <div class="text-xs font-bold">Stat</div>
        <div class="text-center text-xs font-bold">EV</div>
        <div class="text-center text-xs font-bold">IV</div>
        <div class="flex items-center justify-center text-xs font-bold">
          <span class="relative inline-flex items-center">
            HT

            <span class="absolute left-full ml-1.5 flex items-center hover:cursor-help">
              <app-icon
                name="question-mark"
                [appTooltip]="'Hyper Trained'"
                tooltipPosition="top"
              ></app-icon>
            </span>
          </span>
        </div>
      </div>
      <div class="flex flex-col">
        @for (stat of statKeys; track stat.key) {
          <div
            class="grid grid-cols-[60px_1fr_1fr_60px] sm:grid-cols-[80px_1fr_1fr_80px] gap-2 sm:gap-4 p-3 sm:p-4 items-center border-b border-theme last:border-0 hover:bg-secondary/5 transition-colors"
          >
            <div class="flex gap-2 flex-col">
              <span
                class="text-sm font-bold transition-colors"
                [ngClass]="{
                  'text-[#e46787]': raisedStat() === stat.key,
                  'text-[#3babdf]': loweredStat() === stat.key,
                  'text-primary': raisedStat() !== stat.key && loweredStat() !== stat.key,
                }"
              >
                {{ stat.label }}
              </span>
              <span class="text-sm font-semibold text-secondary leading-none">
                {{ currentStats()[stat.key] }}
              </span>
            </div>

            <div class="flex justify-center">
              <input
                #evInput
                type="number"
                [ngModel]="evs()[stat.key]"
                (ngModelChange)="updateEv(stat.key, $event, evInput)"
                min="0"
                max="252"
                class="w-full max-w-[80px] bg-surface border-2 border-theme rounded-lg px-1 sm:px-1.5 py-1 sm:py-1.5 text-xs sm:text-sm text-primary text-center focus:border-[--color-active] outline-none transition-all no-spinners hover:bg-surface-hover hover:border-[--color-border-hover] active:border-[--color-active]"
              />
            </div>

            <div class="flex justify-center">
              <input
                type="number"
                [ngModel]="ivs()[stat.key]"
                (ngModelChange)="updateIv(stat.key, $event)"
                min="0"
                max="31"
                class="w-full max-w-[80px] bg-surface border-2 border-theme rounded-lg px-1 sm:px-1.5 py-1 sm:py-1.5 text-xs sm:text-sm text-primary text-center focus:border-[--color-active] outline-none transition-all no-spinners hover:bg-surface-hover hover:border-[--color-border-hover] active:border-[--color-active]"
              />
            </div>

            <div class="flex justify-center">
              <button
                type="button"
                (click)="toggleHyperTrained(stat.key)"
                class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all"
                [ngClass]="
                  hyperTrained().includes(stat.key)
                    ? 'bg-[var(--color-active)] border-[var(--color-active)] text-white shadow-sm'
                    : 'bg-surface border-theme text-transparent hover:bg-surface-hover hover:border-[var(--color-border-hover)] active:border-[var(--color-active)]'
                "
              >
                <svg
                  class="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        }

        <div
          class="grid grid-cols-[60px_1fr_1fr_60px] sm:grid-cols-[80px_1fr_1fr_80px] gap-2 sm:gap-4 p-3 sm:p-4 items-center bg-secondary/5 border-t border-theme"
        >
          <div class="text-xs sm:text-sm font-bold text-secondary">Total</div>
          <div class="text-center text-primary text-xs sm:text-sm font-semibold">
            {{ totalEvs() }} / 510
          </div>
          <div class="text-center text-xs sm:text-sm font-semibold text-primary">
            {{ totalIvs() }} / 186
          </div>
          <div></div>
        </div>
      </div>
    </div>
  `,
})
export class PokemonEditStatsComponent {
  ivs = input.required<StatsMap>();
  evs = input.required<StatsMap>();
  hyperTrained = input<string[]>([]);
  raisedStat = input<string | null>(null);
  loweredStat = input<string | null>(null);

  baseStats = input<StatsMap | undefined>();
  level = input<number>(100);

  ivsChanged = output<StatsMap>();
  evsChanged = output<StatsMap>();
  hyperTrainedChanged = output<string[]>();

  statKeys: { key: keyof StatsMap; label: string }[] = [
    { key: 'hp', label: 'HP' },
    { key: 'atk', label: 'Attack' },
    { key: 'def', label: 'Defense' },
    { key: 'spa', label: 'Sp. Atk' },
    { key: 'spd', label: 'Sp. Def' },
    { key: 'spe', label: 'Speed' },
  ];

  totalEvs = computed(() => {
    const e = this.evs();
    return (e.hp || 0) + (e.atk || 0) + (e.def || 0) + (e.spa || 0) + (e.spd || 0) + (e.spe || 0);
  });

  totalIvs = computed(() => {
    const i = this.ivs();
    return (i.hp || 0) + (i.atk || 0) + (i.def || 0) + (i.spa || 0) + (i.spd || 0) + (i.spe || 0);
  });

  currentStats = computed(() => {
    const base = this.baseStats();
    const ivs = this.ivs();
    const evs = this.evs();
    const lvl = this.level() || 100;
    const raised = this.raisedStat();
    const lowered = this.loweredStat();
    const ht = this.hyperTrained();

    if (!base) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    const getIv = (stat: keyof StatsMap) => (ht.includes(stat) ? 31 : ivs[stat] || 0);

    const calcOther = (stat: keyof StatsMap) => {
      let val = Math.floor(
        Math.floor((2 * base[stat] + getIv(stat) + Math.floor((evs[stat] || 0) / 4)) * lvl) / 100 +
          5,
      );
      if (raised === stat) val = Math.floor(val * 1.1);
      if (lowered === stat) val = Math.floor(val * 0.9);
      return val;
    };

    const hp =
      base.hp === 1
        ? 1
        : Math.floor(
            Math.floor((2 * base.hp + getIv('hp') + Math.floor((evs.hp || 0) / 4)) * lvl) / 100 +
              lvl +
              10,
          );

    return {
      hp,
      atk: calcOther('atk'),
      def: calcOther('def'),
      spa: calcOther('spa'),
      spd: calcOther('spd'),
      spe: calcOther('spe'),
    };
  });

  updateIv(stat: keyof StatsMap, value: number | null) {
    const val = value === null ? 0 : value;
    const currentIvs = this.ivs();
    this.ivsChanged.emit({ ...currentIvs, [stat]: val });
  }

  updateEv(stat: keyof StatsMap, value: number | null, inputElement?: HTMLInputElement) {
    let val = value === null ? 0 : value;
    if (val < 0) val = 0;
    if (val > 252) val = 252;

    const currentEvs = this.evs();
    let otherEvsTotal = 0;
    for (const key in currentEvs) {
      if (key !== stat) {
        otherEvsTotal += currentEvs[key as keyof StatsMap];
      }
    }

    if (otherEvsTotal + val > 510) {
      val = 510 - otherEvsTotal;
    }

    if (inputElement && Number(inputElement.value) !== val) {
      inputElement.value = val.toString();
    }

    this.evsChanged.emit({ ...currentEvs, [stat]: val });
  }

  toggleHyperTrained(stat: keyof StatsMap) {
    const currentHt = [...this.hyperTrained()];
    if (currentHt.includes(stat)) {
      this.hyperTrainedChanged.emit(currentHt.filter((s) => s !== stat));
    } else {
      currentHt.push(stat);
      this.hyperTrainedChanged.emit(currentHt);
    }
  }
}
