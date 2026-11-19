import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import {
  CustomDropdownOption,
  CustomDropdownComponent,
} from '../../../../shared/components/custom-dropdown/custom-dropdown.component';
import { StatsMap } from '../../../../shared/models/dex.model';
import { NatureData } from '../../../../shared/models/dataset.model';
import { PokemonEditStatsTableComponent } from './pokemon-edit-stats-table.component';

@Component({
  selector: 'app-pokemon-edit-stats',
  standalone: true,
  imports: [CommonModule, CustomDropdownComponent, PokemonEditStatsTableComponent],
  template: `
    <div class="flex flex-col gap-[18px]">
      <section class="grid grid-cols-2 gap-4">
        <app-custom-dropdown
          [label]="'Nature'"
          [options]="natureOptions()"
          [selectedId]="form().get('nature')?.value || ''"
          [placeholder]="'Select Nature'"
          (valueChanged)="
            form().get('nature')?.setValue($event); form().get('nature')?.markAsDirty()
          "
        />
        <app-custom-dropdown
          [label]="'Mint'"
          [options]="natureOptions()"
          [selectedId]="form().get('mint')?.value || ''"
          [placeholder]="'Select Mint'"
          (valueChanged)="form().get('mint')?.setValue($event); form().get('mint')?.markAsDirty()"
        />
        <app-custom-dropdown
          [label]="'Ability'"
          [options]="abilityOptions()"
          [selectedId]="form().get('ability')?.value || ''"
          [placeholder]="'Select Ability'"
          [searchable]="false"
          (valueChanged)="
            form().get('ability')?.setValue($event); form().get('ability')?.markAsDirty()
          "
        />
        <app-custom-dropdown
          [label]="'Tera Type'"
          [options]="teraTypeOptions()"
          [selectedId]="form().get('teraType')?.value || ''"
          [placeholder]="'Select Tera Type'"
          [searchable]="false"
          (valueChanged)="
            form().get('teraType')?.setValue($event); form().get('teraType')?.markAsDirty()
          "
        />
      </section>

      <app-pokemon-edit-stats-table
        [ivs]="form().get('ivs')?.value!"
        [evs]="form().get('evs')?.value!"
        [hyperTrained]="form().get('hyperTrained')?.value!"
        [raisedStat]="activeNature()?.raises || null"
        [loweredStat]="activeNature()?.lowers || null"
        [baseStats]="baseStats()"
        [level]="form().get('level')?.value || 100"
        (ivsChanged)="form().get('ivs')?.setValue($event); form().get('ivs')?.markAsDirty()"
        (evsChanged)="form().get('evs')?.setValue($event); form().get('evs')?.markAsDirty()"
        (hyperTrainedChanged)="
          form().get('hyperTrained')?.setValue($event); form().get('hyperTrained')?.markAsDirty()
        "
      ></app-pokemon-edit-stats-table>
    </div>
  `,
})
export class PokemonEditStatsComponent {
  form = input.required<FormGroup>();
  natureOptions = input<CustomDropdownOption[]>([]);
  abilityOptions = input<CustomDropdownOption[]>([]);
  teraTypeOptions = input<CustomDropdownOption[]>([]);
  activeNature = input<NatureData | null>(null);
  baseStats = input<StatsMap | undefined>();
}
