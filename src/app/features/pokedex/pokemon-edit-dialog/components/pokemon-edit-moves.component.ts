import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-pokemon-edit-moves',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomDropdownComponent],
  template: `
    <div class="flex flex-col gap-[18px]" [formGroup]="form()">
      <app-custom-dropdown
        [label]="'Move 1'"
        [options]="moveOptions()"
        [selectedId]="form().get('move1')?.value || ''"
        [highlightedIds]="currentMoveIds"
        [placeholder]="'Select Move'"
        [searchable]="true"
        (valueChanged)="onMoveChange(1, $event)"
      />
      <app-custom-dropdown
        [label]="'Move 2'"
        [options]="moveOptions()"
        [selectedId]="form().get('move2')?.value || ''"
        [highlightedIds]="currentMoveIds"
        [placeholder]="'Select Move'"
        [searchable]="true"
        (valueChanged)="onMoveChange(2, $event)"
      />
      <app-custom-dropdown
        [label]="'Move 3'"
        [options]="moveOptions()"
        [selectedId]="form().get('move3')?.value || ''"
        [highlightedIds]="currentMoveIds"
        [placeholder]="'Select Move'"
        [searchable]="true"
        (valueChanged)="onMoveChange(3, $event)"
      />
      <app-custom-dropdown
        [label]="'Move 4'"
        [options]="moveOptions()"
        [selectedId]="form().get('move4')?.value || ''"
        [highlightedIds]="currentMoveIds"
        [placeholder]="'Select Move'"
        [searchable]="true"
        (valueChanged)="onMoveChange(4, $event)"
      />
    </div>
  `,
})
export class PokemonEditMovesComponent {
  form = input.required<FormGroup>();
  moveOptions = input<CustomDropdownOption[]>([]);

  get currentMoveIds(): string[] {
    const form = this.form();
    return [
      form.get('move1')?.value,
      form.get('move2')?.value,
      form.get('move3')?.value,
      form.get('move4')?.value,
    ].filter((val) => val && val !== '');
  }

  onMoveChange(slot: number, newMoveId: string) {
    const form = this.form();

    if (!newMoveId) {
      form.get(`move${slot}`)?.setValue('');
      form.get(`move${slot}`)?.markAsDirty();
      return;
    }

    for (let i = 1; i <= 4; i++) {
      if (i !== slot && form.get(`move${i}`)?.value === newMoveId) {
        form.get(`move${i}`)?.setValue('');
        form.get(`move${i}`)?.markAsDirty();
      }
    }

    form.get(`move${slot}`)?.setValue(newMoveId);
    form.get(`move${slot}`)?.markAsDirty();
  }
}
