import { Component, computed, input } from '@angular/core';

import { CommonModule } from '@angular/common';

import { CdnUrlPipe } from '../../pipes/cdnUrl.pipe';

import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';

export type MoveViewSlot = { index: number } & (
  | { status: 'empty' }
  | { status: 'unconfigured'; fallbackName: string }
  | {
      status: 'configured';
      name: string;
      type: string;
      typeLabel: string;
      power: string | number;
      accuracy: string | number;
      pp: number;
      category?: string;
    }
);

@Component({
  selector: 'app-move-card',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe, TooltipDirective],
  template: `
    @if (move(); as move) {
      <div
        class="flex items-center bg-[--color-surface-raised] h-14 overflow-hidden rounded-lg shadow-lg w-full"
      >
        @if (move.status === 'configured') {
          <div class="flex items-center w-1/2 h-full min-w-0">
            <div
              class="flex flex-col items-center justify-center w-14 h-full bg-[--color-bg-tertiary] flex-shrink-0"
            >
              <img
                [src]="move.type + '.png' | cdnUrl: 'types'"
                [alt]="move.type"
                class="w-full h-full object-contain rounded-l-lg"
                [appTooltip]="move.typeLabel"
                tooltipPosition="top"
              />
            </div>
            <div class="flex items-center px-4 flex-1 min-w-0">
              <span class="font-bold text-primary truncate text-base">{{ move.name }}</span>
            </div>
          </div>

          <div class="flex items-center h-full w-1/2 flex-shrink-0 p-1">
            <div class="flex items-center justify-center h-full w-1/4">
              @if (move.category) {
                <img
                  [src]="moveCategory().name + '.png' | cdnUrl: 'moves'"
                  [alt]="moveCategory().label"
                  class="w-10 h-10 object-contain"
                  [appTooltip]="moveCategory().label"
                  tooltipPosition="top"
                />
              }
            </div>

            <div
              class="flex flex-col items-center justify-center h-full w-1/4 px-1 rounded-lg"
              [appTooltip]="'Power'"
              tooltipPosition="top"
            >
              <span class="text-[10px] text-secondary font-bold uppercase leading-none mb-1"
                >Power</span
              >
              <span class="text-sm font-bold text-primary">{{ move.power }}</span>
            </div>
            <div
              class="flex flex-col items-center justify-center h-full w-1/4 px-1"
              [appTooltip]="'Accuracy'"
              tooltipPosition="top"
            >
              <span class="text-[10px] text-secondary font-bold uppercase leading-none mb-1"
                >Acc</span
              >
              <span class="text-sm font-bold text-primary">{{ move.accuracy }}</span>
            </div>
            <div
              class="flex flex-col items-center justify-center h-full w-1/4 px-1"
              [appTooltip]="'Power Points'"
              tooltipPosition="top"
            >
              <span class="text-[10px] text-secondary font-bold uppercase leading-none mb-1"
                >PP</span
              >
              <span class="text-sm font-bold text-primary">{{ move.pp }}</span>
            </div>
          </div>
        } @else if (move.status === 'unconfigured') {
          <div
            class="flex items-center justify-center w-12 h-full bg-[--color-bg-tertiary] border-r border-theme flex-shrink-0"
          >
            <span class="text-secondary opacity-50">-</span>
          </div>
          <div class="flex items-center px-3 flex-1 min-w-0">
            <span class="font-bold text-primary truncate text-base">{{ move.fallbackName }}</span>
          </div>
        } @else {
          <div
            class="p-4 text-sm text-secondary italic text-center flex-1 flex items-center justify-center"
          >
            Empty Move Slot
          </div>
        }
      </div>
    }
  `,
})
export class MoveCardComponent {
  move = input.required<MoveViewSlot>();

  moveCategory = computed(() => {
    const slot = this.move();

    switch (slot.status) {
      case 'configured':
        return {
          name: slot.category ? slot.category.toLowerCase() : '',
          label: slot.category
            ? slot.category.charAt(0).toUpperCase() + slot.category.slice(1)
            : '',
        };
      case 'unconfigured':
        return {
          name: slot.fallbackName,
          label: 'Unbekannt',
        };
      case 'empty':
        return {
          name: 'Empty',
          label: '-',
        };
    }
  });
}
