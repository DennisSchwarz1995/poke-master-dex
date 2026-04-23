import {
  Component,
  input,
  output,
  signal,
  computed,
  OnInit,
  inject,
  HostListener,
  effect,
  AfterViewInit,
} from '@angular/core';
import { AVAILABLE_SPRITES } from '../../../core/constants/available-sprites.constants';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  getAvailableGamesForPokemon,
  GameDefinition,
} from '../../../shared/models/game-definitions';
import { BoxSlot, StatsMap } from '../../../shared/models/dex.model';
import { Trainer } from '../../../shared/models/trainer.model';
import {
  DatasetService,
  DatasetPokemon,
  SimplePokemon,
} from '../../../core/api/services/dataset.service';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import {
  AbilityData,
  ItemData,
  PokeballData,
  NatureData,
  MarkData,
  RibbonData,
} from '../../../shared/models/dataset.model';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../shared/components/custom-dropdown/custom-dropdown.component';
import { PokemonLanguageService } from '../../../core/services/pokemon-language.service';
import { ToastService } from '../../../core/services/toast.service';
import { getGameIconPath } from '../../../core/constants/game-data.constants';

@Component({
  selector: 'app-pokemon-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      (click)="close()"
    >
      <div
        class="bg-surface border border-theme rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        @if (pokemon(); as pkmn) {
          <div class="p-6 pb-4 relative flex-none border-b border-theme bg-surface z-20">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-6">
                <div class="flex flex-col items-center">
                  <div class="relative group">
                    <div
                      class="w-32 h-32 bg-secondary rounded-full flex items-center justify-center border-2 border-theme shadow-inner"
                    >
                      @if (localPokemonSlug() && currentSpriteUrl()) {
                        <img
                          [src]="currentSpriteUrl()"
                          [alt]="localizedName()"
                          class="w-28 h-28 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                          (error)="onImageError($event)"
                        />
                      }
                    </div>
                    @if (ball) {
                      <div
                        class="absolute bottom-0 left-0 w-7 h-7 bg-surface border border-theme rounded-full shadow flex items-center justify-center"
                      >
                        <img
                          [src]="'assets/images/pokeballs/' + ball + '.png'"
                          [alt]="ball"
                          class="w-5 h-5 object-contain"
                          style="image-rendering: pixelated"
                          (error)="onImageError($event)"
                        />
                      </div>
                    }
                    @if (localPokemonSlug()) {
                      <button
                        (click)="toggleShinyPreview()"
                        class="absolute bottom-0 right-0 p-1 bg-surface border border-theme rounded-full shadow hover:bg-surface-hover transition-colors flex items-center justify-center w-7 h-7"
                        title="Toggle Shiny Preview"
                      >
                        <img
                          src="assets/images/special_attributes/shiny-stars.png"
                          alt="Shiny"
                          class="w-5 h-5 object-contain"
                        />
                      </button>
                    }
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    @if (pokemonData()?.type1) {
                      <img
                        [src]="'assets/images/types/' + pokemonData()!.type1 + '.png'"
                        [alt]="pokemonData()!.type1"
                        class="h-5 object-contain"
                        (error)="onImageError($event)"
                      />
                    }
                    @if (pokemonData()?.type2) {
                      <img
                        [src]="'assets/images/types/' + pokemonData()!.type2 + '.png'"
                        [alt]="pokemonData()!.type2"
                        class="h-5 object-contain"
                        (error)="onImageError($event)"
                      />
                    }
                  </div>
                </div>

                <div class="flex-1">
                  <div class="mb-3">
                    <label class="block text-xs font-bold text-secondary uppercase mb-2"
                      >Pokemon</label
                    >
                    <app-custom-dropdown
                      [options]="pokemonSearchOptions()"
                      [selectedId]="localPokemonSlug() || ''"
                      [placeholder]="'Search Pokemon...'"
                      (valueChanged)="onPokemonChange($event)"
                    />
                  </div>

                  @if (localPokemonSlug()) {
                    <div class="flex flex-col gap-1 text-sm text-secondary">
                      <span class="flex items-center gap-2">
                        {{ localizedName() }}
                      </span>
                      <span class="italic">{{ pokemonGenus() }}</span>
                    </div>
                  } @else {
                    <div class="text-lg text-tertiary italic">Empty Slot</div>
                  }
                </div>
              </div>

              <button
                (click)="close()"
                class="text-secondary hover:text-primary transition-colors p-2 text-2xl leading-none block"
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="flex flex-col gap-[18px]">
                <div class="flex flex-col gap-[18px]">
                  <div
                    class="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-theme"
                  >
                    <label class="flex items-center gap-3 cursor-pointer group select-none">
                      <div class="relative flex items-center">
                        <input
                          type="checkbox"
                          [(ngModel)]="isOwned"
                          (change)="onCaughtChange()"
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
                      <span
                        class="font-medium text-primary group-hover:text-blue-400 transition-colors"
                        >Caught</span
                      >
                    </label>

                    <div class="w-px h-6 bg-theme"></div>

                    <label class="flex items-center gap-3 cursor-pointer group select-none">
                      <div class="relative flex items-center">
                        <input
                          type="checkbox"
                          [(ngModel)]="isShiny"
                          (change)="updateSpritePreview()"
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
                      <span
                        class="font-medium text-primary group-hover:text-yellow-400 transition-colors"
                        >Shiny</span
                      >
                    </label>

                    <div class="w-px h-6 bg-theme"></div>

                    <label class="flex items-center gap-3 cursor-pointer group select-none">
                      <div class="relative flex items-center">
                        <input type="checkbox" [(ngModel)]="isEvent" class="peer sr-only" />
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
                      <span
                        class="font-medium text-primary group-hover:text-purple-400 transition-colors"
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
                          [(ngModel)]="isGmax"
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
                          pokemonData()?.canGmax || pokemonData()?.isGmax
                            ? 'group-hover:text-red-400'
                            : ''
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
                          [(ngModel)]="isAlpha"
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
                        [(ngModel)]="level"
                        min="1"
                        max="100"
                        class="w-full bg-surface border-2 border-theme rounded-lg px-3 py-3 text-sm text-primary focus:border-blue-500 outline-none transition-colors peer placeholder-transparent no-spinners"
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
                        [selectedId]="originLanguage"
                        [placeholder]="'Select Language'"
                        [searchable]="false"
                        (valueChanged)="originLanguage = $event"
                      />
                    </div>
                  </div>

                  <div class="flex flex-col gap-1.5 mb-[18px]">
                    <label class="text-[10px] font-bold text-secondary uppercase pl-2 z-10"
                      >Gender</label
                    >
                    <div
                      class="flex w-full h-11 bg-surface border-2 border-theme rounded-lg overflow-hidden relative shadow-sm"
                    >
                      <div class="absolute left-1/2 top-0 bottom-0 w-px bg-theme z-10"></div>

                      <button
                        (click)="genderState().canMale ? (gender = 'male') : null"
                        [disabled]="!genderState().canMale"
                        class="flex-1 flex items-center justify-center gap-2 transition-all font-bold text-sm z-0 relative"
                        [ngClass]="[
                          gender === 'male'
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
                        (click)="genderState().canFemale ? (gender = 'female') : null"
                        [disabled]="!genderState().canFemale"
                        class="flex-1 flex items-center justify-center gap-2 transition-all font-bold text-sm z-0 relative"
                        [ngClass]="[
                          gender === 'female'
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
                      [selectedId]="ball"
                      [label]="'Poké Ball'"
                      [placeholder]="'Select Poké Ball'"
                      (valueChanged)="ball = $event"
                    />

                    <app-custom-dropdown
                      [options]="itemOptions()"
                      [selectedId]="item"
                      [label]="'Held Item'"
                      [placeholder]="'Select Held Item'"
                      (valueChanged)="item = $event"
                    />
                  </div>
                </div>

                <div class="bg-secondary/30 p-4 rounded-xl border border-theme">
                  <div
                    class="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-secondary mb-1"
                  >
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
                      [(ngModel)]="ivs.hp"
                      min="0"
                      max="31"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="HP IV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="ivs.atk"
                      min="0"
                      max="31"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="Atk IV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="ivs.def"
                      min="0"
                      max="31"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="Def IV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="ivs.spa"
                      min="0"
                      max="31"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="SpA IV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="ivs.spd"
                      min="0"
                      max="31"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="SpD IV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="ivs.spe"
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
                      [(ngModel)]="evs.hp"
                      min="0"
                      max="252"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="HP EV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="evs.atk"
                      min="0"
                      max="252"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="Atk EV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="evs.def"
                      min="0"
                      max="252"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="Def EV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="evs.spa"
                      min="0"
                      max="252"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="SpA EV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="evs.spd"
                      min="0"
                      max="252"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="SpD EV"
                    />
                    <input
                      type="number"
                      [(ngModel)]="evs.spe"
                      min="0"
                      max="252"
                      class="w-full bg-surface border border-theme rounded px-0.5 py-1 text-xs text-primary text-center focus:border-blue-500 outline-none no-spinners"
                      title="Spe EV"
                    />
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-[18px]">
                <div class="grid grid-cols-2 gap-4">
                  <div class="relative group">
                    <app-custom-dropdown
                      [label]="'Ability'"
                      [options]="abilityOptions()"
                      [selectedId]="ability"
                      [placeholder]="'Select Ability'"
                      [searchable]="false"
                      (valueChanged)="onAbilityChange($event)"
                    />
                    <p class="text-xs text-secondary mt-1 min-h-[1.25rem] truncate">
                      {{ currentAbilityDescription }}
                    </p>
                  </div>

                  <div class="relative group">
                    <app-custom-dropdown
                      [label]="'Nature'"
                      [options]="natureOptions()"
                      [selectedId]="nature"
                      [placeholder]="'Select Nature'"
                      (valueChanged)="nature = $event"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-[18px]">
                  <app-custom-dropdown
                    [options]="ribbonOptions()"
                    [selectedId]="ribbon"
                    [label]="'Ribbon'"
                    [placeholder]="'Select Ribbon'"
                    (valueChanged)="ribbon = $event"
                  />

                  <app-custom-dropdown
                    [options]="markOptions()"
                    [selectedId]="mark"
                    [label]="'Mark'"
                    [placeholder]="'Select Mark'"
                    (valueChanged)="mark = $event"
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
                        (valueChanged)="onTrainerSelect($event)"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div class="relative group">
                      <input
                        [(ngModel)]="originalTrainer"
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
                        [(ngModel)]="trainerId"
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

                  <app-custom-dropdown
                    [label]="'Origin Game'"
                    [options]="originGameOptions()"
                    [selectedId]="originGame"
                    [placeholder]="'Select Origin Game'"
                    (valueChanged)="onOriginGameChange($event)"
                  />
                </div>

                <div class="relative group">
                  <textarea
                    [(ngModel)]="notes"
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
            </div>
          </div>

          <div class="p-6 pt-4 border-t border-theme flex-none bg-surface z-10">
            <div class="flex justify-between items-center">
              <div class="text-xs text-secondary">Last updated: {{ 'Just now' }}</div>
              <div class="flex gap-3">
                <button
                  (click)="close()"
                  class="px-5 py-2 rounded-lg font-medium text-secondary hover:bg-secondary/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  (click)="save()"
                  [disabled]="saving()"
                  class="px-6 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {{ saving() ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    @if (showTrainerPromptDialog()) {
      <div
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        role="dialog"
      >
        <div
          class="bg-surface border border-theme rounded-xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4"
        >
          <h3 class="text-xl font-bold text-primary">Unbekannter Trainer</h3>
          <p class="text-secondary text-sm">
            Der Trainer "<span class="font-bold">{{ originalTrainer }}</span
            >" ist noch nicht gespeichert. Möchten Sie diesen Trainer für die Schnellauswahl
            speichern?
          </p>
          <div class="flex justify-end gap-3 mt-2">
            <button
              (click)="declineTrainerSave()"
              class="px-4 py-2 rounded-lg font-medium text-secondary hover:bg-secondary/50 transition-colors"
            >
              Nein
            </button>
            <button
              (click)="acceptTrainerSave()"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all"
            >
              Ja, Speichern
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: var(--color-border);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: var(--color-text-secondary);
      }

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
export class PokemonDetailDialogComponent implements OnInit, AfterViewInit {
  pokemon = input.required<BoxSlot>();
  dexId = input.required<string>();
  boxNumber = input.required<number>();

  closed = output<void>();
  saved = output<void>();

  localPokemonSlug = signal<string | null>(null);
  showTrainerPromptDialog = signal(false);

  private datasetService = inject(DatasetService);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);
  langService = inject(PokemonLanguageService);

  constructor() {
    effect(() => {
      const state = this.genderState();
      setTimeout(() => {
        if (!state.canMale && !state.canFemale) {
          if (this.gender !== '') this.gender = '';
        } else if (state.canMale && !state.canFemale) {
          if (this.gender !== 'male') this.gender = 'male';
        } else if (!state.canMale && state.canFemale) {
          if (this.gender !== 'female') this.gender = 'female';
        }
      });
    });
  }

  pokemonData = signal<DatasetPokemon | null>(null);
  trainers = signal<Trainer[]>([]);
  allAbilities = signal<AbilityData[]>([]);
  allPokeballs = signal<PokeballData[]>([]);
  allItems = signal<ItemData[]>([]);
  allNatures = signal<NatureData[]>([]);
  allMarks = signal<MarkData[]>([]);
  allRibbons = signal<RibbonData[]>([]);
  allPokemon = signal<SimplePokemon[]>([]);

  genderState = computed(() => {
    const data = this.pokemonData();
    if (!data) return { canMale: true, canFemale: true };

    const mRate = data.maleRate ?? -1;
    const fRate = data.femaleRate ?? -1;

    if (mRate === 0 && fRate === 0) return { canMale: false, canFemale: false };
    if (mRate === 100 && fRate === 0) return { canMale: true, canFemale: false };
    if (fRate === 100 && mRate === 0) return { canMale: false, canFemale: true };
    return { canMale: true, canFemale: true };
  });

  ribbonOptions = computed<CustomDropdownOption[]>(() => {
    return this.allRibbons()
      .map((ribbon) => ({
        id: ribbon.id,
        name: ribbon.name,
        description: ribbon.shortDesc,
        category: `Gen ${ribbon.gen}`,
        iconPath: AVAILABLE_SPRITES.ribbons.has(ribbon.id)
          ? `assets/images/ribbons/${ribbon.id}.png`
          : undefined,
      }))
      .sort((a, b) => {
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA;
        return a.name.localeCompare(b.name);
      });
  });

  markOptions = computed<CustomDropdownOption[]>(() => {
    return this.allMarks()
      .map((mark) => ({
        id: mark.id,
        name: mark.name,
        description: mark.shortDesc,
        category: `Gen ${mark.gen}`,
        iconPath: AVAILABLE_SPRITES.marks.has(mark.id)
          ? `assets/images/marks/${mark.id}.png`
          : undefined,
      }))
      .sort((a, b) => {
        const genA = parseInt(a.category.replace('Gen ', ''));
        const genB = parseInt(b.category.replace('Gen ', ''));
        if (genA !== genB) return genB - genA;
        return a.name.localeCompare(b.name);
      });
  });

  pokemonSearchOptions = computed<CustomDropdownOption[]>(() => {
    return this.allPokemon().map((p) => ({
      id: p.slug,
      name: p.name,
      description: p.nameGerman && p.nameGerman !== p.name ? p.nameGerman : '',
      searchTerms: p.allNames ? Object.values(p.allNames).filter((n) => n) : [],
    }));
  });

  abilityOptions = computed<CustomDropdownOption[]>(() => {
    return this.availableAbilities().map((abil) => ({
      id: abil.id,
      name: abil.name,
      description: abil.isHidden ? 'Hidden Ability' : 'Standard Ability',
    }));
  });

  natureOptions = computed<CustomDropdownOption[]>(() => {
    return this.allNatures().map((nat) => {
      let desc = '';
      let descHtml = '';
      if (nat.raises && nat.lowers) {
        desc = `(+${this.getNatureStatLabel(nat.raises)} -${this.getNatureStatLabel(nat.lowers)})`;
        descHtml = `(<span class="text-[#e46787] font-bold">+${this.getNatureStatLabel(nat.raises)}</span> <span class="text-[#3babdf] font-bold">-${this.getNatureStatLabel(nat.lowers)}</span>)`;
      }
      return {
        id: nat.id,
        name: nat.name,
        description: desc,
        descriptionHtml: descHtml,
      };
    });
  });

  languageOptions = computed<CustomDropdownOption[]>(() => {
    return [
      { id: '', name: 'None' },
      { id: 'ENG', name: 'ENG', description: 'English' },
      { id: 'DEU', name: 'DEU', description: 'German' },
      { id: 'JPN', name: 'JPN', description: 'Japanese' },
      { id: 'FRA', name: 'FRA', description: 'French' },
      { id: 'ITA', name: 'ITA', description: 'Italian' },
      { id: 'ESP', name: 'ESP', description: 'Spanish' },
      { id: 'KOR', name: 'KOR', description: 'Korean' },
      { id: 'CHS', name: 'CHS', description: 'Chinese (Simp)' },
      { id: 'CHT', name: 'CHT', description: 'Chinese (Trad)' },
    ];
  });

  trainerOptions = computed<CustomDropdownOption[]>(() => {
    return this.trainers().map((tr) => ({
      id: tr.id,
      name: tr.name,
      description: `(${tr.game})${!this.isTrainerCompatible(tr) ? ' — incompatible' : ''}`,
      category: !this.isTrainerCompatible(tr) ? 'Incompatible' : 'Compatible',
    }));
  });

  pokeballOptions = computed<CustomDropdownOption[]>(() => {
    const categoryLabels: Record<string, string> = {
      regular: 'Regular',
      special: 'Special',
      hisuian: 'Hisuian',
      other: 'Other',
    };
    return this.allPokeballs().map((ball) => ({
      id: ball.id,
      name: ball.name,
      description: ball.shortDesc,
      category: categoryLabels[ball.category] ?? ball.category,
      iconPath: AVAILABLE_SPRITES.pokeballs.has(ball.id)
        ? `assets/images/pokeballs/${ball.id}.png`
        : undefined,
    }));
  });

  itemOptions = computed<CustomDropdownOption[]>(() => {
    const categoryLabels: Record<string, string> = {
      ball: 'Poké Ball',
      berry: 'Berry',
      other: 'Item',
    };
    return this.allItems().map((item) => ({
      id: item.id,
      name: item.name,
      description: item.shortDesc,
      category: categoryLabels[item.category] ?? item.category,
      iconPath: AVAILABLE_SPRITES.items.has(item.id)
        ? `assets/images/items/${item.id}.png`
        : undefined,
    }));
  });

  pokemonGenus = computed(() => {
    const data = this.pokemonData();
    if (!data) return 'Pokémon';
    const lang = this.langService.currentLang();
    return data.genus?.[lang] || data.genus?.['eng'] || 'Pokémon';
  });

  localizedName = computed(() => {
    const data = this.pokemonData();
    return data ? this.langService.getName(data) : '';
  });

  availableAbilities = () => {
    const p = this.pokemonData();
    if (!p) return [];

    const abs = [];
    if (p.ability1)
      abs.push({ name: this.findAbilityName(p.ability1), id: p.ability1, isHidden: false });
    if (p.ability2)
      abs.push({ name: this.findAbilityName(p.ability2), id: p.ability2, isHidden: false });
    if (p.abilityHidden)
      abs.push({
        name: this.findAbilityName(p.abilityHidden),
        id: p.abilityHidden,
        isHidden: true,
      });

    return abs;
  };

  onAbilityChange(newAbility: string) {
    this.ability = newAbility;
    if (!newAbility) {
      this.currentAbilityDescription = '';
      return;
    }
    const match = this.allAbilities().find((ability) => ability.name === newAbility);
    this.currentAbilityDescription = match ? match.shortDesc : '';
  }

  isOwned = false;
  isEvent = false;
  isShiny = false;
  isGmax = false;
  isAlpha = false;
  level?: number;
  ball = '';
  item = '';
  originGame = '';
  originLanguage = '';
  originalTrainer = '';
  trainerId = '';
  customName = '';
  notes = '';
  ability = '';
  nature = '';
  mark = '';
  ribbon = '';
  gender = '';
  currentAbilityDescription = '';

  ivs: StatsMap = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  evs: StatsMap = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

  saving = signal(false);
  currentSpriteUrl = signal('');

  availableGames = computed(() => {
    const pokemon = this.pokemonData();
    if (!pokemon) return [];

    const validGames = new Set<string>([
      ...(pokemon.obtainableIn || []),
      ...(pokemon.eventOnlyIn || []),
    ]);

    const cannotBreed =
      pokemon.isLegendary || pokemon.isMythical || pokemon.isUltraBeast || pokemon.isParadox;
    if (!cannotBreed && pokemon.storableIn) {
      pokemon.storableIn.forEach((game) => validGames.add(game));
    }
    return getAvailableGamesForPokemon(Array.from(validGames));
  });

  availableGamesByGen = computed(() => {
    const games = this.availableGames();
    const grouped = new Map<number, GameDefinition[]>();

    games.forEach((game) => {
      if (!grouped.has(game.gen)) grouped.set(game.gen, []);
      grouped.get(game.gen)!.push(game);
    });

    return Array.from(grouped.entries())
      .sort((gameA, gameB) => (gameA[0] === 0 ? 1 : gameB[0] === 0 ? -1 : gameB[0] - gameA[0]))
      .map(([gen, games]) => ({
        gen,
        label: gen === 0 ? 'Special' : `Generation ${gen}`,
        games,
      }));
  });

  originGameOptions = computed<CustomDropdownOption[]>(() => {
    const options: CustomDropdownOption[] = [
      { id: '', name: 'None', description: 'No Origin Game selected', category: 'Options' },
    ];

    this.availableGamesByGen().forEach((group) => {
      group.games.forEach((game) => {
        options.push({
          id: game.code,
          name: game.fullName,
          category: group.label,

          iconPath: getGameIconPath(game.code) || undefined,
        });
      });
    });

    return options;
  });

  onOriginGameChange(gameCode: string) {
    this.originGame = gameCode;
  }

  isObtainableIn(gameCode: string): boolean {
    const pokemon = this.pokemonData();
    return pokemon?.obtainableIn?.includes(gameCode) || false;
  }

  ngOnInit() {
    const pkmn = this.pokemon();
    this.localPokemonSlug.set(pkmn.pokemonSlug);
    this.isOwned = pkmn.isOwned;
    this.isEvent = pkmn.isEvent || false;
    this.isShiny = pkmn.isShiny;
    this.isGmax = pkmn.isGmax || false;
    this.isAlpha = pkmn.isAlpha || false;
    this.customName = pkmn.customName || '';
    this.notes = pkmn.notes || '';
    this.level = pkmn.level;
    this.ball = pkmn.ball || '';
    this.originGame = pkmn.originGame || '';
    this.originLanguage = pkmn.originLanguage || '';
    this.originalTrainer = pkmn.originalTrainer || '';
    this.trainerId = pkmn.trainerId || '';
    this.item = pkmn.item || '';
    this.ability = pkmn.ability || '';
    this.nature = pkmn.nature || '';
    this.mark = pkmn.mark || '';
    this.ribbon = pkmn.ribbon || '';
    this.gender = pkmn.gender || '';
    if (pkmn.ivs) this.ivs = { ...pkmn.ivs };
    if (pkmn.evs) this.evs = { ...pkmn.evs };

    this.loadData();
  }

  ngAfterViewInit() {}

  loadData() {
    this.firestoreService.getUserTrainers().subscribe((t) => this.trainers.set(t));
    this.datasetService.loadAbilities().subscribe((a) => this.allAbilities.set(a));
    this.datasetService.loadPokeballs().subscribe((p) => this.allPokeballs.set(p));
    this.datasetService.loadItems().subscribe((i) => this.allItems.set(i));
    this.datasetService.loadNatures().subscribe((n) => this.allNatures.set(n));
    this.datasetService.loadMarks().subscribe((m) => this.allMarks.set(m));
    this.datasetService.loadRibbons().subscribe((r) => this.allRibbons.set(r));
    this.datasetService.getSimplePokemonList().subscribe((pokemonList) => {
      this.allPokemon.set(pokemonList);
    });

    if (this.localPokemonSlug()) {
      this.datasetService.loadPokemonBySlug(this.localPokemonSlug()!).subscribe((data) => {
        this.pokemonData.set(data);
        this.updateSpritePreview();
      });
    }
  }

  updateSpritePreview() {
    const data = this.pokemonData();
    if (!data) return;
    this.currentSpriteUrl.set(this.datasetService.getSpriteUrl(data, this.isShiny));
  }

  toggleShinyPreview() {
    this.isShiny = !this.isShiny;
    this.updateSpritePreview();
  }

  onCaughtChange() {
    if (this.isOwned) {
      if (!this.level) {
        this.level = 5;
      }
      this.onAbilityChange(this.ability);
      if (!this.originLanguage) {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('de')) {
          this.originLanguage = 'DEU';
        } else if (browserLang.startsWith('ja')) {
          this.originLanguage = 'JPN';
        } else if (browserLang.startsWith('fr')) {
          this.originLanguage = 'FRA';
        } else if (browserLang.startsWith('es')) {
          this.originLanguage = 'ESP';
        } else if (browserLang.startsWith('it')) {
          this.originLanguage = 'ITA';
        } else {
          this.originLanguage = 'ENG'; // Default to English
        }
      }
      if (!this.ability && this.pokemonData()) {
        const pokemon = this.pokemonData();
        if (pokemon?.ability1) {
          this.ability = this.findAbilityName(pokemon.ability1);
        }
        if (pokemon?.isGmax) {
          this.isGmax = true;
        }
      }
    }
  }

  findAbilityName(slug: string): string {
    const match = this.allAbilities().find((a) => a.id === slug);
    return match ? match.name : slug;
  }

  getNatureStatLabel(stat: string): string {
    const labels: Record<string, string> = {
      atk: 'Atk',
      def: 'Def',
      spa: 'SpA',
      spd: 'SpD',
      spe: 'Spe',
    };
    return labels[stat] || stat;
  }
  isTrainerCompatible(trainer: Trainer): boolean {
    if (!trainer.game) return true;
    return this.availableGames().some((g) => g.code === trainer.game);
  }

  onTrainerSelect(trainerId: string) {
    if (!trainerId) return;
    const trainer = this.trainers().find((t) => t.id === trainerId);
    if (trainer) {
      if (!this.isTrainerCompatible(trainer)) return;

      this.originalTrainer = trainer.name;
      this.trainerId = trainer.trainerId;
      if (trainer.game && this.isObtainableIn(trainer.game)) {
        this.originGame = trainer.game;
      }
    }
  }

  async save() {
    this.saving.set(true);

    if (this.originalTrainer.trim() !== '') {
      const promptDisabled = localStorage.getItem('disableAutoTrainerPrompt') === 'true';
      if (!promptDisabled) {
        const trainerExists = this.trainers().some(
          (trainer) => trainer.name.toLowerCase() === this.originalTrainer.trim().toLowerCase(),
        );
        if (!trainerExists) {
          this.saving.set(false);
          this.showTrainerPromptDialog.set(true);
          return;
        }
      }
    }

    await this.executeSave();
  }

  async acceptTrainerSave() {
    this.showTrainerPromptDialog.set(false);
    this.saving.set(true);
    try {
      await this.firestoreService.createTrainer({
        name: this.originalTrainer.trim(),
        trainerId: this.trainerId?.trim() || '',
        game: this.originGame || '',
      });
      // Trainer saved, now fetch updated list locally or wait for subscription
      this.toastService.success('Trainer saved successfully!');
    } catch (e) {
      console.error(e);
      this.toastService.error('Error saving trainer.');
    }
    await this.executeSave();
  }

  async declineTrainerSave() {
    this.showTrainerPromptDialog.set(false);
    this.toastService.info('Note: You can disable this prompt in the profile settings.');
    this.saving.set(true);
    await this.executeSave();
  }

  async executeSave() {
    try {
      const updates: any = {
        pokemonSlug: this.localPokemonSlug() || null,
        isOwned: this.isOwned,
        isEvent: this.isEvent,
        isShiny: this.isShiny,
        isGmax: this.isGmax,
        isAlpha: this.isAlpha,
        level: this.level || null,
        ball: this.ball || null,
        item: this.item || null,
        originGame: this.originGame || null,
        originLanguage: this.originLanguage || null,
        originalTrainer: this.originalTrainer || null,
        trainerId: this.trainerId || null,
        customName: this.customName || null,
        notes: this.notes || null,
        ability: this.ability || null,
        nature: this.nature || null,
        mark: this.mark || null,
        ribbon: this.ribbon || null,
        gender: this.gender || null,
        ivs: { ...this.ivs },
        evs: { ...this.evs },
      };
      Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

      await this.firestoreService.updateSlot(
        this.dexId(),
        this.boxNumber(),
        this.pokemon().position,
        updates,
      );

      this.saved.emit();
      this.close();
      this.toastService.success('Pokemon saved successfully');
    } catch (e) {
      this.toastService.error(`Error ${e} saving Pokemon`);
    } finally {
      this.saving.set(false);
    }
  }

  onPokemonChange(newPokemonSlug: string | null) {
    if (!newPokemonSlug) {
      this.pokemonData.set(null);
      this.currentSpriteUrl.set('');
      this.localPokemonSlug.set(null);
      return;
    }
    this.localPokemonSlug.set(newPokemonSlug);
    this.datasetService.loadPokemonBySlug(newPokemonSlug).subscribe((data) => {
      this.pokemonData.set(data);
      this.updateSpritePreview();
    });
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
