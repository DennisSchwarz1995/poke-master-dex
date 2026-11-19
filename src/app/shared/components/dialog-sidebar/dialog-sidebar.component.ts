import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-dialog-sidebar',
  standalone: true,
  imports: [CommonModule, IconComponent, TooltipDirective],
  template: `
    <div
      class="w-20 sm:w-24 flex-none border-r border-theme bg-surface z-10 flex flex-col items-center justify-center py-4 gap-4 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)] h-full"
    >
      <button
        (click)="tabChange.emit(0)"
        class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all gap-1"
        [ngClass]="
          activeTabIndex() === 0
            ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
            : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
        "
        [appTooltip]="'General'"
        tooltipPosition="right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-info size-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        <span class="text-sm">General</span>
      </button>
      <button
        (click)="tabChange.emit(1)"
        class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all gap-1"
        [ngClass]="
          activeTabIndex() === 1
            ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
            : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
        "
        [appTooltip]="'Moves'"
        tooltipPosition="right"
      >
        <app-icon name="moves" size="1.25em"></app-icon>
        <span class="text-sm">Moves</span>
      </button>
      <button
        (click)="tabChange.emit(2)"
        class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all gap-1"
        [ngClass]="
          activeTabIndex() === 2
            ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
            : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
        "
        [appTooltip]="'Stats'"
        tooltipPosition="right"
      >
        <app-icon name="radar-chart" size="1.25em"></app-icon>
        <span class="text-sm">Stats</span>
      </button>
      <button
        (click)="tabChange.emit(3)"
        class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all gap-1"
        [ngClass]="
          activeTabIndex() === 3
            ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
            : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
        "
        [appTooltip]="'Origin'"
        tooltipPosition="right"
      >
        <app-icon name="pin" size="1.25em"></app-icon>
        <span class="text-sm">Origin</span>
      </button>
      <button
        (click)="tabChange.emit(4)"
        class="w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all gap-1"
        [ngClass]="
          activeTabIndex() === 4
            ? 'bg-[--color-surface-hover] hover:bg-[--color-bg-tertiary]'
            : 'text-secondary hover:bg-surface-hover hover:text-primary opacity-100 hover:opacity-100'
        "
        [appTooltip]="'Ribbons & Marks'"
        tooltipPosition="right"
      >
        <app-icon name="ribbon"></app-icon>
        <span class="text-sm">Ribbons</span>
      </button>
    </div>
  `,
  styles: [],
})
export class DialogSidebarComponent {
  activeTabIndex = input.required<number>();
  tabChange = output<number>();
}
