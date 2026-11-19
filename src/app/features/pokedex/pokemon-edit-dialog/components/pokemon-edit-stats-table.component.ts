import { Component, input, output, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith, pairwise } from 'rxjs/operators';
import { StatsMap } from '../../../../shared/models/dex.model';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

const PKMN = {
  MAX_EV_PER_STAT: 252,
  MAX_EV_TOTAL: 510,
  MAX_IV: 31,
  MIN_STAT: 0,
  NATURE_BOOST: 1.1,
  NATURE_NERF: 0.9,
  FORMULA_HP_OFFSET: 10,
  FORMULA_STAT_OFFSET: 5,
  EV_DIVISOR: 4,
  DEFAULT_LEVEL: 100,
} as const;

@Component({
  selector: 'app-pokemon-edit-stats-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipDirective, IconComponent],
  template: `
    <div
      [formGroup]="statsForm"
      class="bg-surface border-2 border-theme rounded-xl overflow-hidden"
    >
      <div
        class="grid grid-cols-[60px_1fr_1fr_60px] sm:grid-cols-[80px_1fr_1fr_80px] gap-2 sm:gap-4 p-3 sm:p-4 border-b border-theme text-[10px] font-bold text-secondary uppercase bg-secondary/5"
      >
        <div class="text-xs font-bold">Stat</div>
        <div class="text-center text-xs font-bold">IV</div>
        <div class="text-center text-xs font-bold">EV</div>
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

            <div formGroupName="ivs" class="flex justify-center">
              <input
                type="number"
                [formControlName]="stat.key"
                min="0"
                max="31"
                class="w-full max-w-[80px] bg-surface border-2 border-theme rounded-lg px-1 sm:px-1.5 py-1 sm:py-1.5 text-xs sm:text-sm text-primary text-center focus:border-[--color-active] outline-none transition-all no-spinners hover:bg-surface-hover hover:border-[--color-border-hover] active:border-[--color-active]"
              />
            </div>

            <div formGroupName="evs" class="flex justify-center">
              <input
                type="number"
                [formControlName]="stat.key"
                min="0"
                max="252"
                class="w-full max-w-[80px] bg-surface border-2 border-theme rounded-lg px-1 sm:px-1.5 py-1 sm:py-1.5 text-xs sm:text-sm text-primary text-center focus:border-[--color-active] outline-none transition-all no-spinners hover:bg-surface-hover hover:border-[--color-border-hover] active:border-[--color-active]"
              />
            </div>

            <div class="flex justify-center">
              <button
                type="button"
                (click)="toggleHyperTrained(stat.key)"
                class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all"
                [ngClass]="
                  hyperTrainedSet().has(stat.key)
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
          <div class="text-center text-xs sm:text-sm font-semibold text-primary">
            {{ totalIvs() }} / 186
          </div>
          <div class="text-center text-primary text-xs sm:text-sm font-semibold">
            {{ totalEvs() }} / 510
          </div>
          <div></div>
        </div>
      </div>
    </div>
  `,
})
export class PokemonEditStatsTableComponent {
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

  private fb = inject(FormBuilder);

  statKeys: { key: keyof StatsMap; label: string }[] = [
    { key: 'hp', label: 'HP' },
    { key: 'atk', label: 'Attack' },
    { key: 'def', label: 'Defense' },
    { key: 'spa', label: 'Sp. Atk' },
    { key: 'spd', label: 'Sp. Def' },
    { key: 'spe', label: 'Speed' },
  ];

  statsForm = this.fb.nonNullable.group({
    evs: this.fb.nonNullable.group({
      hp: [0],
      atk: [0],
      def: [0],
      spa: [0],
      spd: [0],
      spe: [0],
    }),
    ivs: this.fb.nonNullable.group({
      hp: [0],
      atk: [0],
      def: [0],
      spa: [0],
      spd: [0],
      spe: [0],
    }),
  });

  constructor() {
    effect(() => {
      this.statsForm.patchValue(
        {
          evs: this.evs(),
          ivs: this.ivs(),
        },
        { emitEvent: false },
      );
    });

    this.statsForm.controls.evs.valueChanges
      .pipe(takeUntilDestroyed(), startWith(this.statsForm.controls.evs.value), pairwise())
      .subscribe(([prev, curr]) => {
        const clampedEvs = { ...curr } as StatsMap;

        const changedKey = this.statKeys.find((k) => prev[k.key] !== curr[k.key])?.key;

        if (changedKey) {
          let val = clampedEvs[changedKey] || 0;

          val = Math.max(PKMN.MIN_STAT, Math.min(PKMN.MAX_EV_PER_STAT, val));

          let otherEvsTotal = 0;
          this.statKeys.forEach((k) => {
            if (k.key !== changedKey) otherEvsTotal += clampedEvs[k.key] || 0;
          });

          if (otherEvsTotal + val > PKMN.MAX_EV_TOTAL) {
            val = PKMN.MAX_EV_TOTAL - otherEvsTotal;
          }

          clampedEvs[changedKey] = val;

          if (val !== curr[changedKey]) {
            this.statsForm.controls.evs.patchValue(clampedEvs, { emitEvent: false });
          }
        }

        this.evsChanged.emit(clampedEvs);
      });

    this.statsForm.controls.ivs.valueChanges.pipe(takeUntilDestroyed()).subscribe((curr) => {
      const clampedIvs = { ...curr } as StatsMap;
      let needsPatch = false;

      this.statKeys.forEach((k) => {
        let val = clampedIvs[k.key] || 0;
        val = Math.max(PKMN.MIN_STAT, Math.min(PKMN.MAX_IV, val));

        if (val !== curr[k.key]) {
          needsPatch = true;
          clampedIvs[k.key] = val;
        }
      });

      if (needsPatch) {
        this.statsForm.controls.ivs.patchValue(clampedIvs, { emitEvent: false });
      }

      this.ivsChanged.emit(clampedIvs);
    });
  }

  totalEvs = computed(() => Object.values(this.evs()).reduce((sum, val) => sum + (val || 0), 0));

  totalIvs = computed(() => Object.values(this.ivs()).reduce((sum, val) => sum + (val || 0), 0));

  hyperTrainedSet = computed(() => new Set(this.hyperTrained()));

  currentStats = computed(() => {
    const base = this.baseStats();
    const ivs = this.ivs();
    const evs = this.evs();
    const lvl = this.level() || PKMN.DEFAULT_LEVEL;
    const raised = this.raisedStat();
    const lowered = this.loweredStat();
    const htSet = this.hyperTrainedSet();

    if (!base) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    const getIv = (stat: keyof StatsMap) => (htSet.has(stat) ? PKMN.MAX_IV : ivs[stat] || 0);

    const calcOther = (stat: keyof StatsMap) => {
      let val = Math.floor(
        Math.floor(
          (2 * base[stat] + getIv(stat) + Math.floor((evs[stat] || 0) / PKMN.EV_DIVISOR)) * lvl,
        ) /
          100 +
          PKMN.FORMULA_STAT_OFFSET,
      );
      if (raised === stat) val = Math.floor(val * PKMN.NATURE_BOOST);
      if (lowered === stat) val = Math.floor(val * PKMN.NATURE_NERF);
      return val;
    };

    const hp =
      base.hp === 1
        ? 1
        : Math.floor(
            Math.floor(
              (2 * base.hp + getIv('hp') + Math.floor((evs.hp || 0) / PKMN.EV_DIVISOR)) * lvl,
            ) /
              100 +
              lvl +
              PKMN.FORMULA_HP_OFFSET,
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

  toggleHyperTrained(stat: keyof StatsMap) {
    const currentHt = [...this.hyperTrained()];
    if (currentHt.includes(stat)) {
      this.hyperTrainedChanged.emit(currentHt.filter((s) => s !== stat));
    } else {
      this.hyperTrainedChanged.emit([...currentHt, stat]);
    }
  }
}
