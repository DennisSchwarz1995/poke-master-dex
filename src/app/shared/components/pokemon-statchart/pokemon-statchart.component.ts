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
      <div class="relative flex items-center justify-center w-full h-64">
        <canvas #currentChart></canvas>
      </div>
    </div>
  `,
})
export class PokemonStatchartComponent {
  pokemonData = input.required<DatasetPokemon>();
  pokemon = input.required<BoxSlot>();

  currentChartRef = viewChild<ElementRef<HTMLCanvasElement>>('currentChart');

  private datasetService = inject(DatasetService);
  allNatures = toSignal(this.datasetService.loadNatures(), { initialValue: [] });
  statDefinitions = STAT_DEFINITIONS;

  activeNature = computed(() => {
    const mint = this.pokemon().mint;
    const natId = mint || this.pokemon().nature;
    return this.allNatures().find((n) => n.id === natId) ?? null;
  });

  constructor() {
    effect((onCleanup) => {
      const pData = this.pokemonData();
      const p = this.pokemon();
      const natures = this.allNatures();
      const currentCanvas = this.currentChartRef()?.nativeElement;

      if (!pData || natures.length === 0 || !currentCanvas) {
        return;
      }

      const currentChart = this.createCurrentChart(currentCanvas, pData, p);

      onCleanup(() => {
        currentChart.destroy();
      });
    });
  }

  getIv(statId: string): number {
    const ht = this.pokemon().hyperTrained || [];
    if (ht.includes(statId)) return 31;
    return (this.pokemon().ivs as any)?.[statId] ?? 31;
  }

  getEv(statId: string): number {
    return (this.pokemon().evs as any)?.[statId] ?? 0;
  }

  private createCurrentChart(
    canvas: HTMLCanvasElement,
    stats: DatasetPokemon,
    pkmn: BoxSlot,
  ): Chart {
    const currentLevel = pkmn.level || 50; // default 50 for chart viewing if undefined
    const nature = this.activeNature();
    let activeColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-active')
      .trim();

    let backgroundColor = activeColor;
    if (activeColor.startsWith('#') && activeColor.length === 7) {
      backgroundColor = activeColor + '80';
    }

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
            backgroundColor: backgroundColor,
            borderColor: activeColor,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 0,
          },
        ],
      },
      options: this.getChartOptions(currentMaxScale),
    });
  }

  private getChartOptions(maxScale: number): ChartOptions<'radar'> {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#cbd5e1' : '#4b5563';
    const nature = this.activeNature();

    const pointLabelColors = this.statDefinitions.map((def) => {
      if (nature?.raises === def.id) return '#e46787';
      if (nature?.lowers === def.id) return '#3babdf';
      return textColor;
    });

    const fullStatNames: Record<string, string> = {
      hp: 'Health Points',
      atk: 'Attack',
      def: 'Defense',
      spa: 'Special Attack',
      spd: 'Special Defense',
      spe: 'Speed',
    };

    return {
      scales: {
        r: {
          beginAtZero: true,
          max: maxScale,
          grid: { color: gridColor },
          pointLabels: {
            color: (context: any) => pointLabelColors[context.index],
            font: { size: 12, weight: 'bold' },
            padding: 6,
          },
          ticks: { display: false, count: 5 },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          displayColors: false, // Verhindert das kleine Farb-Quadrat im Tooltip
          callbacks: {
            // Verhindert, dass der Standard-Titel (z.B. "HP (150)") über deinem Text steht
            title: () => 'null',

            label: (context: any) => {
              const def = this.statDefinitions[context.dataIndex];
              const value = context.parsed.r;

              const statName = fullStatNames[def.id] || def.label;

              const tooltipLines = [`${statName} Value: ${value}`];

              if (nature) {
                const natureName =
                  nature.name || nature.id.charAt(0).toUpperCase() + nature.id.slice(1);

                if (nature.raises === def.id) {
                  tooltipLines.push(`Increased by 10% because of ${natureName} Nature`);
                } else if (nature.lowers === def.id) {
                  tooltipLines.push(`Decreased by 10% because of ${natureName} Nature`);
                }
              }

              return tooltipLines;
            },
          },
        },
      },
      maintainAspectRatio: false,
    };
  }
}
