import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsMap } from '../../../../shared/models/dex.model';

@Component({
  selector: 'app-pokemon-edit-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-secondary/30 p-4 rounded-xl border border-theme">
      <div class="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-secondary mb-1">
        <div class="text-left">Stat</div>
        <div>HP</div>
        <div>Atk</div>
        <div>Def</div>
        <div>SpA</div>
        <div>SpD</div>
        <div>Spe</div>
      </div>

      <div class="grid grid-cols-7 gap-2 mb-2 items-center">
        <div class="text-[10px] font-bold text-secondary text-left">IVs</div>
        <input
          type="number"
          [ngModel]="ivs().hp"
          (ngModelChange)="updateIv('hp', $event)"
          min="0"
          max="31"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="HP IV"
        />
        <input
          type="number"
          [ngModel]="ivs().atk"
          (ngModelChange)="updateIv('atk', $event)"
          min="0"
          max="31"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="Atk IV"
        />
        <input
          type="number"
          [ngModel]="ivs().def"
          (ngModelChange)="updateIv('def', $event)"
          min="0"
          max="31"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="Def IV"
        />
        <input
          type="number"
          [ngModel]="ivs().spa"
          (ngModelChange)="updateIv('spa', $event)"
          min="0"
          max="31"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="SpA IV"
        />
        <input
          type="number"
          [ngModel]="ivs().spd"
          (ngModelChange)="updateIv('spd', $event)"
          min="0"
          max="31"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="SpD IV"
        />
        <input
          type="number"
          [ngModel]="ivs().spe"
          (ngModelChange)="updateIv('spe', $event)"
          min="0"
          max="31"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="Spe IV"
        />
      </div>

      <div class="grid grid-cols-7 gap-2 items-center">
        <div class="text-[10px] font-bold text-secondary text-left">EVs</div>
        <input
          type="number"
          [ngModel]="evs().hp"
          (ngModelChange)="updateEv('hp', $event)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="HP EV"
        />
        <input
          type="number"
          [ngModel]="evs().atk"
          (ngModelChange)="updateEv('atk', $event)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="Atk EV"
        />
        <input
          type="number"
          [ngModel]="evs().def"
          (ngModelChange)="updateEv('def', $event)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="Def EV"
        />
        <input
          type="number"
          [ngModel]="evs().spa"
          (ngModelChange)="updateEv('spa', $event)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="SpA EV"
        />
        <input
          type="number"
          [ngModel]="evs().spd"
          (ngModelChange)="updateEv('spd', $event)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="SpD EV"
        />
        <input
          type="number"
          [ngModel]="evs().spe"
          (ngModelChange)="updateEv('spe', $event)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="Spe EV"
        />
      </div>
    </div>
  `,
  styles: [
    `
      /* Hide arrows/spinners for number inputs */
      .no-spinners::-webkit-outer-spin-button,
      .no-spinners::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .no-spinners {
        -moz-appearance: textfield;
      }
    `,
  ],
})
export class PokemonEditStatsComponent {
  ivs = input.required<StatsMap>();
  evs = input.required<StatsMap>();

  ivsChanged = output<StatsMap>();
  evsChanged = output<StatsMap>();

  updateIv(stat: keyof StatsMap, value: number | null) {
    const val = value === null ? 0 : value;
    const currentIvs = this.ivs();
    this.ivsChanged.emit({ ...currentIvs, [stat]: val });
  }

  updateEv(stat: keyof StatsMap, value: number | null) {
    const val = value === null ? 0 : value;
    const currentEvs = this.evs();
    this.evsChanged.emit({ ...currentEvs, [stat]: val });
  }
}
