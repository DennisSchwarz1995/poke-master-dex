import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../../shared/components/custom-dropdown/custom-dropdown.component';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PokemonEditSizeComponent } from './pokemon-edit-size.component';

@Component({
  selector: 'app-pokemon-edit-general',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomDropdownComponent,
    CdnUrlPipe,
    TooltipDirective,
    IconComponent,
    PokemonEditSizeComponent,
  ],
  template: `
    <div class="flex flex-col gap-[32px]" [formGroup]="form()">
      <div class="grid grid-cols-2 gap-4">
        <app-custom-dropdown
          [options]="pokeballOptions()"
          [selectedId]="form().get('ball')?.value"
          [label]="'Poké Ball'"
          [placeholder]="'Select Poké Ball'"
          (valueChanged)="form().get('ball')?.setValue($event); form().get('ball')?.markAsDirty()"
        />

        <div class="flex flex-col gap-1.5 relative group">
          <label class="text-[12px] font-bold text-secondary uppercase pl-2 z-10 "> Level </label>
          <input
            type="number"
            formControlName="level"
            min="1"
            max="100"
            (keydown)="preventNonNumbers($event)"
            (input)="enforceLevelConstraints($event)"
            class="w-full bg-surface border-2 border-theme rounded-xl p-4 text-sm text-primary focus:border-[--color-active] outline-none transition-colors no-spinners transition-colors hover:bg-[--color-surface-hover]"
            placeholder="Level"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5 relative group">
          <label class="text-[12px] font-bold text-secondary uppercase pl-2 z-10">
            Special Flags
          </label>
          <div
            class="flex items-center justify-between bg-surface border-2 border-theme rounded-xl px-1 h-[56px]"
          >
            @for (btn of attributeButtons(); track btn.id) {
              <button
                type="button"
                (click)="!btn.isDisabled ? toggle(btn.id) : null"
                [disabled]="btn.isDisabled"
                class="w-10 h-10 rounded-full border-2 border-transparent enabled:hover:bg-surface-hover flex items-center justify-center transition-all duration-1200 relative group/btn disabled:opacity-50 disabled:cursor-not-allowed enabled:active:scale-95 enabled:active:border-[var(--color-active)]"
                [appTooltip]="btn.tooltip"
                [tooltipPosition]="'top'"
                [ngClass]="
                  form().get(btn.id)?.value
                    ? 'shadow-none bg-[var(--color-bg-secondary)]'
                    : 'shadow-sm bg-surface enabled:hover:shadow-md'
                "
              >
                <img
                  [src]="btn.icon | cdnUrl: btn.folder"
                  class="w-6 h-6 object-contain transition-all duration-300"
                  [ngClass]="
                    form().get(btn.id)?.value
                      ? 'grayscale-0 opacity-100 scale-95'
                      : 'grayscale opacity-50 drop-shadow-md ' +
                        (!btn.isDisabled
                          ? 'group-hover/btn:opacity-100 group-hover/btn:drop-shadow-none'
                          : '')
                  "
                  [alt]="btn.tooltip"
                />
              </button>
            }
          </div>
        </div>

        <div class="flex flex-col gap-1.5 relative group">
          <label class="text-[12px] font-bold text-secondary uppercase pl-2 z-10">Gender</label>
          <div
            class="flex w-full h-[56px] bg-surface border-2 border-theme rounded-xl overflow-hidden relative shadow-sm"
            [ngClass]="{ 'border-[--color-male]': selectedGender === 'male' }"
          >
            <div class="absolute left-1/2 top-0 bottom-0 w-px bg-theme z-10"></div>

            <button
              (click)="setGender('male')"
              [disabled]="!genderState().canMale"
              class="flex-1 flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm z-0 relative disabled:cursor-not-allowed disabled:opacity-50"
              [ngClass]="{ 'bg-[--color-male]': selectedGender === 'male' }"
            >
              <app-icon
                name="male"
                size="1.5em"
                class="transition-colors duration-200"
                [ngClass]="{
                  'text-white': selectedGender === 'male',
                  'text-[--color-male]': selectedGender !== 'male',
                }"
              ></app-icon>
              <span
                class="transition-colors duration-200"
                [ngClass]="{
                  'text-primary': selectedGender === 'male',
                  'text-secondary': selectedGender !== 'male',
                }"
                >Male</span
              >
            </button>

            <button
              (click)="genderState().canFemale ? setGender('female') : null"
              [disabled]="!genderState().canFemale"
              class="flex-1 flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm z-0 relative disabled:cursor-not-allowed disabled:opacity-50"
              [ngClass]="{ 'bg-[--color-female]': selectedGender === 'female' }"
            >
              <app-icon
                name="female"
                size="1.5em"
                class="transition-colors duration-200"
                [ngClass]="{
                  'text-white': selectedGender === 'female',
                  'text-[--color-female]': selectedGender !== 'female',
                }"
              ></app-icon>
              <span
                class="transition-colors duration-200"
                [ngClass]="{
                  'text-primary': selectedGender === 'female',
                  'text-secondary': selectedGender !== 'female',
                }"
                >Female</span
              >
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5 relative group">
          <label class="text-[12px] font-bold text-secondary uppercase pl-2 z-10"> Nickname </label>
          <input
            formControlName="nickname"
            placeholder="Nickname"
            class="w-full bg-surface border-2 border-theme rounded-xl p-4 text-sm text-primary focus:border-[--color-active] outline-none transition-colors no-spinners transition-colors hover:bg-[--color-surface-hover]"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <app-custom-dropdown
          [options]="itemOptions()"
          [selectedId]="form().get('item')?.value"
          [label]="'Held Item'"
          [placeholder]="'Select Held Item'"
          [searchable]="true"
          (valueChanged)="form().get('item')?.setValue($event); form().get('item')?.markAsDirty()"
        />

        <app-pokemon-edit-size
          [selectedSize]="form().get('size')?.value || ''"
          (sizeChanged)="form().get('size')?.setValue($event); form().get('size')?.markAsDirty()"
        ></app-pokemon-edit-size>
      </div>

      <div class="flex flex-col gap-1.5 relative group">
        <label class="text-[12px] font-bold text-secondary uppercase pl-2 z-10"> Notes </label>
        <textarea
          formControlName="notes"
          rows="2"
          class="w-full bg-surface border-2 border-theme rounded-xl px-4 py-3 text-sm text-primary focus:border-blue-500 outline-none resize-none transition-colors"
          placeholder="Notes"
        ></textarea>
      </div>
    </div>
  `,
})
export class PokemonEditAttributesComponent {
  form = input.required<FormGroup>();

  pokemonData = input<DatasetPokemon | null>(null);
  genderState = input<{ canMale: boolean; canFemale: boolean }>({ canMale: true, canFemale: true });
  currentAbilityDescription = input<string>('');
  pokeballOptions = input<CustomDropdownOption[]>([]);
  itemOptions = input<CustomDropdownOption[]>([]);

  get selectedGender(): string | null {
    return this.form().get('gender')?.value;
  }
  attributeButtons = computed(() => {
    const data = this.pokemonData();

    return [
      {
        id: 'isOwned',
        tooltip: 'Caught',
        icon: 'pokeball.webp',
        folder: 'pokeballs',
        isDisabled: false,
      },
      {
        id: 'isShiny',
        tooltip: 'Shiny',
        icon: 'shiny.png',
        folder: 'special_attributes',
        isDisabled: false,
      },
      {
        id: 'isEvent',
        tooltip: 'Event',
        icon: 'cherish.webp',
        folder: 'pokeballs',
        isDisabled: false,
      },
      {
        id: 'isGmax',
        tooltip: 'Gigantamax',
        icon: 'gigantamax.png',
        folder: 'special_attributes',
        isDisabled: !(data?.canGmax || data?.isGmax),
      },
      {
        id: 'isAlpha',
        tooltip: 'Alpha',
        icon: 'alpha.png',
        folder: 'special_attributes',
        isDisabled: !data?.canBeAlpha,
      },
    ];
  });

  setGender(gender: string) {
    const control = this.form().get('gender');
    if (control) {
      if (control.value === gender) {
        control.setValue(null);
      } else {
        control.setValue(gender);
      }
      control.markAsDirty();
    }
  }

  toggle(controlName: string) {
    const control = this.form().get(controlName);
    if (control) {
      control.setValue(!control.value);
      control.markAsDirty();
    }
  }

  preventNonNumbers(event: KeyboardEvent) {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
      event.preventDefault();
    }
  }

  enforceLevelConstraints(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      let val = parseInt(input.value, 10);
      if (val > 100) {
        input.value = '100';
        this.form().get('level')?.setValue(100);
      } else if (val < 1) {
        input.value = '1';
        this.form().get('level')?.setValue(1);
      }
    }
  }
}
