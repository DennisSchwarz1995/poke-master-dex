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
        <div [ngClass]="{'text-[#e46787]': raisedStat() === 'hp', 'text-[#3babdf]': loweredStat() === 'hp'}">HP</div>
        <div [ngClass]="{'text-[#e46787]': raisedStat() === 'atk', 'text-[#3babdf]': loweredStat() === 'atk'}">Atk</div>
        <div [ngClass]="{'text-[#e46787]': raisedStat() === 'def', 'text-[#3babdf]': loweredStat() === 'def'}">Def</div>
        <div [ngClass]="{'text-[#e46787]': raisedStat() === 'spa', 'text-[#3babdf]': loweredStat() === 'spa'}">SpA</div>
        <div [ngClass]="{'text-[#e46787]': raisedStat() === 'spd', 'text-[#3babdf]': loweredStat() === 'spd'}">SpD</div>
        <div [ngClass]="{'text-[#e46787]': raisedStat() === 'spe', 'text-[#3babdf]': loweredStat() === 'spe'}">Spe</div>
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
          #hpEvInput
          type="number"
          [ngModel]="evs().hp"
          (ngModelChange)="updateEv('hp', $event, hpEvInput)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="HP EV"
        />
        <input
          #atkEvInput
          type="number"
          [ngModel]="evs().atk"
          (ngModelChange)="updateEv('atk', $event, atkEvInput)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="Atk EV"
        />
        <input
          #defEvInput
          type="number"
          [ngModel]="evs().def"
          (ngModelChange)="updateEv('def', $event, defEvInput)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="Def EV"
        />
        <input
          #spaEvInput
          type="number"
          [ngModel]="evs().spa"
          (ngModelChange)="updateEv('spa', $event, spaEvInput)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="SpA EV"
        />
        <input
          #spdEvInput
          type="number"
          [ngModel]="evs().spd"
          (ngModelChange)="updateEv('spd', $event, spdEvInput)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="SpD EV"
        />
        <input
          #speEvInput
          type="number"
          [ngModel]="evs().spe"
          (ngModelChange)="updateEv('spe', $event, speEvInput)"
          min="0"
          max="252"
          class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
          title="Spe EV"
        />
      </div>
    </div>
  `,
})
export class PokemonEditStatsComponent {
  ivs = input.required<StatsMap>();
  evs = input.required<StatsMap>();
  raisedStat = input<string | null>(null);
  loweredStat = input<string | null>(null);

  ivsChanged = output<StatsMap>();
  evsChanged = output<StatsMap>();

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
}
