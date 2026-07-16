import {
  Component,
  input,
  signal,
  inject,
  viewChild,
  ElementRef,
  effect,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import Chart, { ChartOptions } from 'chart.js/auto';
import { BoxSlot } from '../../../shared/models/dex.model';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { DatasetPokemon } from '../../../shared/models/dataset.model';
import { STAT_DEFINITIONS, calculateHP, calculateStat } from '../../utils/stat-calculator.util';

@Component({
  selector: 'app-pokemon-statchart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-4 overflow-hidden">
      <div class="flex items-center justify-between border-b border-theme pb-2">
        <h3 class="text-sm font-bold tracking-wider text-secondary uppercase">Stats</h3>
        <div class="flex gap-2">
          <button
            (click)="statsView.set('base')"
            [class.bg-blue-600]="statsView() === 'base'"
            [class.text-white]="statsView() === 'base'"
            [class.text-secondary]="statsView() !== 'base'"
            class="px-2 py-0.5 text-[10px] font-bold rounded hover:text-primary transition-colors"
          >
            Base
          </button>
          <button
            (click)="statsView.set('current')"
            [class.bg-green-600]="statsView() === 'current'"
            [class.text-white]="statsView() === 'current'"
            [class.text-secondary]="statsView() !== 'current'"
            class="px-2 py-0.5 text-[10px] font-bold rounded hover:text-primary transition-colors"
          >
            Current
          </button>
        </div>
      </div>

      <div class="relative w-full overflow-hidden">
        <div
          class="flex w-full transition-transform duration-300 ease-in-out"
          [style.transform]="'translateX(' + (statsView() === 'base' ? '0%' : '-100%') + ')'"
        >
          <div class="flex flex-col shrink-0 gap-4 w-full">
            <div class="relative flex items-center justify-center w-full h-64">
              <canvas #baseChart></canvas>
            </div>
          </div>

          <div class="flex flex-col shrink-0 gap-4 w-full">
            <div class="relative flex items-center justify-center w-full h-64">
              <canvas #currentChart></canvas>
            </div>

            <div class="p-4 border rounded-xl bg-secondary/10 border-theme">
              <div class="grid grid-cols-7 gap-2 mb-2 text-xs font-bold text-center text-secondary">
                <div class="text-left">Stat</div>
                @for (stat of statDefinitions; track stat.id) {
                  <div
                    [ngClass]="{
                      'text-[#e46787]': activeNature()?.raises === stat.id,
                      'text-[#3babdf]': activeNature()?.lowers === stat.id,
                    }"
                  >
                    {{ stat.label }}
                  </div>
                }
              </div>
              <div class="grid items-center grid-cols-7 gap-2 mb-2">
                <div class="text-[10px] font-bold text-secondary text-left">IVs</div>
                @for (stat of statDefinitions; track stat.id) {
                  <div
                    class="w-full py-1 text-xs text-center border rounded bg-surface border-theme text-primary"
                  >
                    {{ getIv(stat.id) }}
                  </div>
                }
              </div>
              <div class="grid items-center grid-cols-7 gap-2">
                <div class="text-[10px] font-bold text-secondary text-left">EVs</div>
                @for (stat of statDefinitions; track stat.id) {
                  <div
                    class="w-full py-1 text-xs text-center border rounded bg-surface border-theme text-primary"
                  >
                    {{ getEv(stat.id) }}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PokemonStatchartComponent {
  pokemonData = input.required<DatasetPokemon>();
  pokemon = input.required<BoxSlot>();

  baseChartRef = viewChild<ElementRef<HTMLCanvasElement>>('baseChart');
  currentChartRef = viewChild<ElementRef<HTMLCanvasElement>>('currentChart');

  statsView = signal<'base' | 'current'>('base');

  private datasetService = inject(DatasetService);
  allNatures = toSignal(this.datasetService.loadNatures(), { initialValue: [] });
  statDefinitions = STAT_DEFINITIONS;

  activeNature = computed(() => {
    const natId = this.pokemon().nature;
    return this.allNatures().find((n) => n.id === natId) ?? null;
  });

  constructor() {
    effect((onCleanup) => {
      const pData = this.pokemonData();
      const p = this.pokemon();
      const natures = this.allNatures();
      const baseCanvas = this.baseChartRef()?.nativeElement;
      const currentCanvas = this.currentChartRef()?.nativeElement;

      if (!pData || natures.length === 0 || !baseCanvas || !currentCanvas) {
        return;
      }

      const baseChart = this.createBaseChart(baseCanvas, pData, p);
      const currentChart = this.createCurrentChart(currentCanvas, pData, p);

      onCleanup(() => {
        baseChart.destroy();
        currentChart.destroy();
      });
    });
  }

  getIv(statId: string): number {
    return (this.pokemon().ivs as any)?.[statId] ?? 31;
  }

  getEv(statId: string): number {
    return (this.pokemon().evs as any)?.[statId] ?? 0;
  }

  private createBaseChart(canvas: HTMLCanvasElement, stats: DatasetPokemon, pkmn: BoxSlot): Chart {
    const baseStatValues = this.statDefinitions.map((def) => (stats as any)[def.baseKey]);

    return new Chart(canvas, {
      type: 'radar',
      data: {
        labels: this.statDefinitions.map((def, i) => `${def.label} (${baseStatValues[i]})`),
        datasets: [
          {
            label: 'Base Stats',
            data: baseStatValues,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: this.getChartOptions(200, pkmn),
    });
  }

  private createCurrentChart(
    canvas: HTMLCanvasElement,
    stats: DatasetPokemon,
    pkmn: BoxSlot,
  ): Chart {
    const currentLevel = pkmn.level || 50;
    const nature = this.activeNature();

    const currentStatValues = this.statDefinitions.map((def) => {
      const iv = this.getIv(def.id);
      const ev = this.getEv(def.id);
      const base = (stats as any)[def.baseKey];

      if (def.id === 'hp') {
        return calculateHP(base, currentLevel, iv, ev);
      }
      return calculateStat(
        base,
        currentLevel,
        nature?.raises === def.id,
        nature?.lowers === def.id,
        iv,
        ev,
      );
    });

    const currentMaxScale = Math.max(50, Math.max(...currentStatValues) * 1.1);

    return new Chart(canvas, {
      type: 'radar',
      data: {
        labels: this.statDefinitions.map((def, i) => `${def.label} (${currentStatValues[i]})`),
        datasets: [
          {
            label: 'Current Stats',
            data: currentStatValues,
            backgroundColor: 'rgba(34, 197, 94, 0.4)',
            borderColor: 'rgba(34, 197, 94, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(34, 197, 94, 1)',
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: this.getChartOptions(currentMaxScale, pkmn),
    });
  }

  private getChartOptions(maxScale: number, pkmn: BoxSlot): ChartOptions<'radar'> {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#cbd5e1' : '#4b5563';
    const nature = this.activeNature();

    const pointLabelColors = this.statDefinitions.map((def) => {
      if (nature?.raises === def.id) return '#e46787';
      if (nature?.lowers === def.id) return '#3babdf';
      return textColor;
    });

    return {
      scales: {
        r: {
          beginAtZero: true,
          max: maxScale,
          grid: { color: gridColor },
          pointLabels: {
            color: (context: any) => pointLabelColors[context.index],
            font: { size: 10, weight: 'bold' },
            padding: 6,
          },
          ticks: { display: false, count: 5 },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context: any) => `${context.label.split(' ')[0]}: ${context.parsed.r}`,
          },
        },
      },
      maintainAspectRatio: false,
    };
  }
}
