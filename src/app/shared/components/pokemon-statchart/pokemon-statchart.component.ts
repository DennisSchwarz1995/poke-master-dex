import {
  Component,
  input,
  signal,
  inject,
  ViewChild,
  ElementRef,
  effect,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { BoxSlot } from '../../../shared/models/dex.model';
import { DatasetPokemon, DatasetService } from '../../../core/api/services/dataset.service';
import { NatureData } from '../../../shared/models/dataset.model';

@Component({
  selector: 'app-pokemon-statchart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-4 border-b border-theme pb-2">
        <h3 class="text-sm font-bold text-secondary uppercase tracking-wider">Stats</h3>
        <div class="flex gap-2">
          <button
            (click)="switchStatsView('base')"
            [class]="
              statsView() === 'base'
                ? 'px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded'
                : 'px-2 py-0.5 text-[10px] font-medium text-secondary hover:text-primary rounded'
            "
          >
            Base
          </button>
          <button
            (click)="switchStatsView('current')"
            [class]="
              statsView() === 'current'
                ? 'px-2 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded'
                : 'px-2 py-0.5 text-[10px] font-medium text-secondary hover:text-primary rounded'
            "
          >
            Current
          </button>
        </div>
      </div>
      <div class="h-64 w-full flex items-center justify-center relative">
        <canvas #statsChart></canvas>
      </div>
    </div>
  `,
})
export class PokemonStatchartComponent implements OnDestroy {
  pokemonData = input.required<DatasetPokemon>();
  pokemon = input.required<BoxSlot>();

  @ViewChild('statsChart') statsChartRef!: ElementRef<HTMLCanvasElement>;
  chartInstance: Chart | null = null;
  statsView = signal<'base' | 'current'>('base');
  allNatures = signal<NatureData[]>([]);

  datasetService = inject(DatasetService);

  constructor() {
    this.datasetService.loadNatures().subscribe((natures) => {
      this.allNatures.set(natures);
      this.initChart();
    });

    effect(() => {
      // Whenever pokemonData or pokemon changes, we re-initialize the chart
      this.pokemonData();
      this.pokemon();
      this.statsView();
      setTimeout(() => this.initChart(), 50);
    });
  }

  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  switchStatsView(view: 'base' | 'current') {
    this.statsView.set(view);
  }

  initChart() {
    if (!this.statsChartRef || !this.pokemonData() || this.allNatures().length === 0) return;

    const ctx = this.statsChartRef.nativeElement;
    const stats = this.pokemonData()!;
    const viewMode = this.statsView();
    const pkmn = this.pokemon();

    if (this.chartInstance) this.chartInstance.destroy();

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#cbd5e1' : '#4b5563';

    const getStatColor = (stat: string) => {
      if (!pkmn.nature) return textColor;
      const nature = this.allNatures().find((n) => n.id === pkmn.nature);
      if (!nature) return textColor;
      if (nature.raises === stat) return '#e46787';
      if (nature.lowers === stat) return '#3babdf';
      return textColor;
    };

    const pointLabelColors = [
      textColor,
      getStatColor('atk'),
      getStatColor('def'),
      getStatColor('spe'),
      getStatColor('spd'),
      getStatColor('spa'),
    ];

    let statValues: number[];
    let chartColor: string;

    if (viewMode === 'current') {
      const currentLevel = pkmn.level || 50;
      const nature = this.allNatures().find((n) => n.id === pkmn.nature);
      const ivs = pkmn.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
      const evs = pkmn.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

      statValues = [
        this.calculateHP(stats.baseHp, currentLevel, ivs.hp, evs.hp),
        this.calculateStat(
          stats.baseAtk,
          currentLevel,
          nature?.raises === 'atk',
          nature?.lowers === 'atk',
          ivs.atk,
          evs.atk,
        ),
        this.calculateStat(
          stats.baseDef,
          currentLevel,
          nature?.raises === 'def',
          nature?.lowers === 'def',
          ivs.def,
          evs.def,
        ),
        this.calculateStat(
          stats.baseSpeed,
          currentLevel,
          nature?.raises === 'spe',
          nature?.lowers === 'spe',
          ivs.spe,
          evs.spe,
        ),
        this.calculateStat(
          stats.baseSpDef,
          currentLevel,
          nature?.raises === 'spd',
          nature?.lowers === 'spd',
          ivs.spd,
          evs.spd,
        ),
        this.calculateStat(
          stats.baseSpAtk,
          currentLevel,
          nature?.raises === 'spa',
          nature?.lowers === 'spa',
          ivs.spa,
          evs.spa,
        ),
      ];
      chartColor = 'rgba(34, 197, 94, 0.8)';
    } else {
      statValues = [
        stats.baseHp,
        stats.baseAtk,
        stats.baseDef,
        stats.baseSpeed,
        stats.baseSpDef,
        stats.baseSpAtk,
      ];
      chartColor = 'rgba(59, 130, 246, 0.8)';
    }

    this.chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          `HP (${statValues[0]})`,
          `Atk (${statValues[1]})`,
          `Def (${statValues[2]})`,
          `Spe (${statValues[3]})`,
          `SpD (${statValues[4]})`,
          `SpA (${statValues[5]})`,
        ],
        datasets: [
          {
            label: viewMode === 'current' ? 'Current Stats' : 'Base Stats',
            data: statValues,
            backgroundColor: chartColor.replace('0.8', '0.2'),
            borderColor: chartColor,
            borderWidth: 2,
            pointBackgroundColor: chartColor,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: viewMode === 'current' ? Math.max(400, ...statValues) : 200,
            grid: { color: gridColor },
            pointLabels: {
              color: pointLabelColors as any,
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
              label: (context) => `${context.label.split(' ')[0]}: ${context.parsed.r}`,
            },
          },
        },
        maintainAspectRatio: false,
      },
    });
  }

  calculateHP(base: number, level: number, iv: number, ev: number): number {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }

  calculateStat(
    base: number,
    level: number,
    isRaised: boolean,
    isLowered: boolean,
    iv: number,
    ev: number,
  ): number {
    let stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    if (isRaised) stat = Math.floor(stat * 1.1);
    if (isLowered) stat = Math.floor(stat * 0.9);
    return stat;
  }
}
