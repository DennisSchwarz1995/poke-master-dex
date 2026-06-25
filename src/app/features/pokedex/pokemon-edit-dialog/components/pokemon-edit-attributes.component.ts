import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatasetPokemon } from '../../../../shared/models/dataset.model';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-pokemon-edit-attributes',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent],
  template: `
    <div class="flex flex-col gap-[18px]">
      <div
        class="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-theme"
      >
        <label class="flex items-center gap-3 cursor-pointer group select-none">
          <div class="relative flex items-center">
            <input
              type="checkbox"
              [ngModel]="isOwned()"
              (ngModelChange)="isOwned.set($event)"
              class="peer sr-only"
            />
            <div
              class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all"
            ></div>
            <svg
              class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"
              />
            </svg>
          </div>
          <span class="font-medium text-primary group-hover:text-blue-400 transition-colors"
            >Caught</span
          >
        </label>

        <div class="w-px h-6 bg-theme"></div>

        <label class="flex items-center gap-3 cursor-pointer group select-none">
          <div class="relative flex items-center">
            <input
              type="checkbox"
              [ngModel]="isShiny()"
              (ngModelChange)="isShiny.set($event)"
              class="peer sr-only"
            />
            <div
              class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-yellow-500 peer-checked:border-yellow-500 transition-all"
            ></div>
            <svg
              class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"
              />
            </svg>
          </div>
          <span class="font-medium text-primary group-hover:text-yellow-400 transition-colors"
            >Shiny</span
          >
        </label>

        <div class="w-px h-6 bg-theme"></div>

        <label class="flex items-center gap-3 cursor-pointer group select-none">
          <div class="relative flex items-center">
            <input
              type="checkbox"
              [ngModel]="isEvent()"
              (ngModelChange)="isEvent.set($event)"
              class="peer sr-only"
            />
            <div
              class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-purple-500 peer-checked:border-purple-500 transition-all"
            ></div>
            <svg
              class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"
              />
            </svg>
          </div>
          <span class="font-medium text-primary group-hover:text-purple-400 transition-colors"
            >Event</span
          >
        </label>

        <div class="w-px h-6 bg-theme"></div>

        <label
          class="flex items-center gap-3 cursor-pointer group select-none relative"
          [class.opacity-50]="!pokemonData()?.canGmax && !pokemonData()?.isGmax"
        >
          <div class="relative flex items-center">
            <input
              type="checkbox"
              [ngModel]="isGmax()"
              (ngModelChange)="isGmax.set($event)"
              [disabled]="!pokemonData()?.canGmax && !pokemonData()?.isGmax"
              class="peer sr-only"
            />
            <div
              class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-red-600 peer-checked:border-red-600 transition-all peer-disabled:bg-surface-hover peer-disabled:border-theme"
            ></div>
            <svg
              class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"
              />
            </svg>
          </div>
          <span
            class="font-medium text-primary transition-colors"
            [ngClass]="
              pokemonData()?.canGmax || pokemonData()?.isGmax ? 'group-hover:text-red-400' : ''
            "
            >Gigantamax</span
          >
        </label>

        <div class="w-px h-6 bg-theme"></div>

        <label
          class="flex items-center gap-3 cursor-pointer group select-none relative"
          [class.opacity-50]="!pokemonData()?.canBeAlpha"
        >
          <div class="relative flex items-center">
            <input
              type="checkbox"
              [ngModel]="isAlpha()"
              (ngModelChange)="isAlpha.set($event)"
              [disabled]="!pokemonData()?.canBeAlpha"
              class="peer sr-only"
            />
            <div
              class="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-orange-600 peer-checked:border-orange-600 transition-all peer-disabled:bg-surface-hover peer-disabled:border-theme"
            ></div>
            <svg
              class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"
              />
            </svg>
          </div>
          <span
            class="font-medium text-primary transition-colors"
            [ngClass]="pokemonData()?.canBeAlpha ? 'group-hover:text-orange-400' : ''"
            >Alpha</span
          >
        </label>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="relative group">
          <input
            type="number"
            [ngModel]="level()"
            (ngModelChange)="level.set($event)"
            min="1"
            max="100"
            class="w-full bg-surface border-2 border-theme rounded-lg px-4 py-4 text-sm text-primary focus:border-blue-500 outline-none transition-colors peer placeholder-transparent no-spinners"
            placeholder="Level"
          />
          <label
            class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
          >
            Level
          </label>
        </div>

        <div class="relative group">
          <app-custom-dropdown
            [label]="'Language'"
            [options]="languageOptions()"
            [selectedId]="originLanguage()"
            [placeholder]="'Select Language'"
            [searchable]="false"
            (valueChanged)="originLanguage.set($event)"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1.5 mb-[18px]">
        <label class="text-[10px] font-bold text-secondary uppercase pl-2 z-10">Gender</label>
        <div
          class="flex w-full h-11 bg-surface border-2 border-theme rounded-lg overflow-hidden relative shadow-sm"
        >
          <div class="absolute left-1/2 top-0 bottom-0 w-px bg-theme z-10"></div>

          <button
            (click)="
              genderState().canMale && gender() !== 'male' ? gender.set('male') : gender.set('')
            "
            [disabled]="!genderState().canMale"
            class="flex-1 flex items-center justify-center gap-2 transition-all font-bold text-sm z-0 relative"
            [ngClass]="[
              gender() === 'male'
                ? 'bg-blue-100/50 text-primary dark:bg-blue-900/30'
                : 'text-secondary hover:bg-surface-hover',
              !genderState().canMale
                ? 'opacity-40 cursor-not-allowed bg-secondary/10 hover:bg-secondary/10'
                : 'cursor-pointer',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#4285f4"
            >
              <path
                d="M797.5-797.5v235h-75V-669L558-505.5q19 28 29.25 59.66Q597.5-414.18 597.5-380q0 90.95-63.28 154.23-63.28 63.27-154.25 63.27t-154.22-63.28q-63.25-63.28-63.25-154.25t63.27-154.22Q289.05-597.5 380-597.5q33.5 0 65.5 10T505-558l164-164.5H562.5v-75h235ZM279.25-480.78q-41.75 41.73-41.75 100.75 0 59.03 41.72 100.78 41.73 41.75 100.75 41.75 59.03 0 100.78-41.72 41.75-41.73 41.75-100.75 0-59.03-41.72-100.78-41.73-41.75-100.75-41.75-59.03 0-100.78 41.72Z"
              />
            </svg>
            Male
          </button>

          <button
            (click)="
              genderState().canFemale && gender() !== 'female'
                ? gender.set('female')
                : gender.set('')
            "
            [disabled]="!genderState().canFemale"
            class="flex-1 flex items-center justify-center gap-2 transition-all font-bold text-sm z-0 relative"
            [ngClass]="[
              gender() === 'female'
                ? 'bg-pink-100/50 text-primary dark:bg-pink-900/30'
                : 'text-secondary hover:bg-surface-hover',
              !genderState().canFemale
                ? 'opacity-40 cursor-not-allowed bg-secondary/10 hover:bg-secondary/10'
                : 'cursor-pointer',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#d6428c"
            >
              <path
                d="M442.5-122.5v-80h-80v-75h80V-366q-78.5-14-129.25-74.6Q262.5-501.19 262.5-581q0-90.37 63.5-153.44 63.5-63.06 154-63.06t154 63.06q63.5 63.07 63.5 153.44 0 79.81-50.75 140.4Q596-380 517.5-366v88.5h80v75h-80v80h-75Zm138.25-356.72q41.75-41.73 41.75-100.75 0-59.03-41.72-100.78-41.73-41.75-100.75-41.75-59.03 0-100.78 41.72-41.75 41.73-41.75 100.75 0 59.03 41.72 100.78 41.73 41.75 100.75 41.75 59.03 0 100.78-41.72Z"
              />
            </svg>
            Female
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-[18px]">
        <app-custom-dropdown
          [options]="pokeballOptions()"
          [selectedId]="ball()"
          [label]="'Poké Ball'"
          [placeholder]="'Select Poké Ball'"
          (valueChanged)="ball.set($event)"
        />

        <app-custom-dropdown
          [options]="itemOptions()"
          [selectedId]="item()"
          [label]="'Held Item'"
          [placeholder]="'Select Held Item'"
          [searchable]="true"
          (valueChanged)="item.set($event)"
        />
      </div>

      <div class="flex flex-col gap-[18px]">
        <app-custom-dropdown
          [options]="ribbonOptions()"
          [selectedId]="ribbon()"
          [label]="'Ribbon'"
          [placeholder]="'Select Ribbon'"
          [searchable]="true"
          (valueChanged)="ribbon.set($event)"
        />

        <app-custom-dropdown
          [options]="markOptions()"
          [selectedId]="mark()"
          [label]="'Mark'"
          [placeholder]="'Select Mark'"
          [searchable]="true"
          (valueChanged)="mark.set($event)"
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
          <div class="relative group">
            <input
              [ngModel]="originalTrainer()"
              (ngModelChange)="originalTrainer.set($event)"
              placeholder="OT Name"
              class="w-full bg-surface border-2 border-theme rounded-lg px-3 py-3 text-sm text-primary placeholder-transparent focus:border-blue-500 outline-none transition-colors peer"
            />
            <label
              class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
            >
              OT Name
            </label>
          </div>
          <div class="relative group">
            <input
              [ngModel]="trainerId()"
              (ngModelChange)="trainerId.set($event)"
              placeholder="ID No."
              class="w-full bg-surface border-2 border-theme rounded-lg px-3 py-3 text-sm text-primary placeholder-transparent focus:border-blue-500 outline-none transition-colors peer"
            />
            <label
              class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
            >
              ID No.
            </label>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <app-custom-dropdown
            [label]="'Origin Game'"
            [options]="originGameOptions()"
            [selectedId]="originGame()"
            [placeholder]="'Select Origin Game'"
            (valueChanged)="originGame.set($event)"
          />

          <app-custom-dropdown
            [label]="'Stored In'"
            [options]="storedInOptions()"
            [selectedId]="storedIn()"
            [placeholder]="'Select Game'"
            (valueChanged)="storedIn.set($event)"
          />
        </div>
      </div>

      <div class="relative group mb-4">
        <input
          [ngModel]="nickname()"
          (ngModelChange)="nickname.set($event)"
          placeholder="Nickname"
          class="w-full bg-surface border-2 border-theme rounded-lg px-4 py-3 text-sm text-primary placeholder-transparent focus:border-blue-500 outline-none transition-colors peer"
        />
        <label
          class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
        >
          Nickname
        </label>
      </div>

      <div class="relative group">
        <textarea
          [ngModel]="notes()"
          (ngModelChange)="notes.set($event)"
          rows="2"
          class="w-full bg-surface border-2 border-theme rounded-lg px-4 py-3 text-sm text-primary placeholder-transparent focus:border-blue-500 outline-none resize-none transition-colors peer"
          placeholder="Notes"
        ></textarea>
        <label
          class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
        >
          Notes
        </label>
      </div>
    </div>
  `,
})
export class PokemonEditAttributesComponent {
  isOwned = model<boolean>(false);
  isShiny = model<boolean>(false);
  isEvent = model<boolean>(false);
  isGmax = model<boolean>(false);
  isAlpha = model<boolean>(false);
  level = model<number | undefined>();
  originLanguage = model<string>('');
  gender = model<string>('');
  ball = model<string>('');
  item = model<string>('');
  ribbon = model<string>('');
  mark = model<string>('');
  originalTrainer = model<string>('');
  trainerId = model<string>('');
  originGame = model<string>('');
  storedIn = model<string>('');
  nickname = model<string>('');
  notes = model<string>('');

  pokemonData = input<DatasetPokemon | null>(null);
  genderState = input<{ canMale: boolean; canFemale: boolean }>({ canMale: true, canFemale: true });
  currentAbilityDescription = input<string>('');
  languageOptions = input<CustomDropdownOption[]>([]);
  pokeballOptions = input<CustomDropdownOption[]>([]);
  itemOptions = input<CustomDropdownOption[]>([]);
  ribbonOptions = input<CustomDropdownOption[]>([]);
  markOptions = input<CustomDropdownOption[]>([]);
  trainerOptions = input<CustomDropdownOption[]>([]);
  originGameOptions = input<CustomDropdownOption[]>([]);
  storedInOptions = input<CustomDropdownOption[]>([]);

  trainerSelected = output<string>();
}
