import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-pokemon-edit-origin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomDropdownComponent],
  template: `
    <div class="flex flex-col gap-[24px]" [formGroup]="form()">
      <div class="relative group">
        <app-custom-dropdown
          [label]="'Language'"
          [options]="languageOptions()"
          [selectedId]="form().get('originLanguage')?.value"
          [placeholder]="'Select Language'"
          [searchable]="false"
          (valueChanged)="
            form().get('originLanguage')?.setValue($event);
            form().get('originLanguage')?.markAsDirty()
          "
        />
      </div>

      <div class="bg-secondary/10 border border-theme rounded-xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-bold text-primary">Original Trainer</h4>
          <div class="w-40">
            <app-custom-dropdown
              [options]="trainerOptions()"
              [selectedId]="''"
              [label]="''"
              [placeholder]="'Auto-fill...'"
              [searchable]="false"
              (valueChanged)="trainerSelected.emit($event)"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="flex flex-col gap-1.5 relative group">
            <label class="text-[10px] font-bold text-secondary uppercase pl-2 z-10">
              OT Name
            </label>
            <input
              formControlName="originalTrainer"
              placeholder="OT Name"
              class="w-full bg-surface border-2 border-theme rounded-xl px-3 py-3 text-sm text-primary focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div class="flex flex-col gap-1.5 relative group">
            <label class="text-[10px] font-bold text-secondary uppercase pl-2 z-10"> ID No. </label>
            <input
              formControlName="trainerId"
              placeholder="ID No."
              class="w-full bg-surface border-2 border-theme rounded-xl px-3 py-3 text-sm text-primary focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <app-custom-dropdown
            [label]="'Origin Game'"
            [options]="originGameOptions()"
            [selectedId]="form().get('originGame')?.value"
            [placeholder]="'Select Origin Game'"
            (valueChanged)="
              form().get('originGame')?.setValue($event); form().get('originGame')?.markAsDirty()
            "
          />

          <app-custom-dropdown
            [label]="'Stored In'"
            [options]="storedInOptions()"
            [selectedId]="form().get('storedIn')?.value"
            [placeholder]="'Select Game'"
            (valueChanged)="
              form().get('storedIn')?.setValue($event); form().get('storedIn')?.markAsDirty()
            "
          />
        </div>
      </div>
    </div>
  `,
})
export class PokemonEditOriginComponent {
  form = input.required<FormGroup>();
  languageOptions = input<CustomDropdownOption[]>([]);
  trainerOptions = input<CustomDropdownOption[]>([]);
  originGameOptions = input<CustomDropdownOption[]>([]);
  storedInOptions = input<CustomDropdownOption[]>([]);

  trainerSelected = output<string>();
}
