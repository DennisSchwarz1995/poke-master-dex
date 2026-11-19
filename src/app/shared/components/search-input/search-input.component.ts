import { Component, model, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, TooltipDirective],
  template: `
    <div class="relative flex-1">
      <input
        type="text"
        [ngModel]="value()"
        (ngModelChange)="onValueChange($event)"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
        class="w-full pl-11 pr-10 py-2.5 bg-surface text-text-primary border border-theme rounded-3xl shadow-sm focus:border-[var(--color-active)] outline-none transition-all placeholder:text-text-tertiary font-medium bg-surface-hover"
      />
      <svg
        class="absolute left-4 top-3 w-5 h-5 text-text-tertiary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      @if (value()) {
        <button
          (click)="clear()"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-secondary transition-colors"
          [appTooltip]="'Clear Search'"
          tooltipPosition="top"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      }
    </div>
  `,
})
export class SearchInputComponent {
  value = model<string>('');
  placeholder = input<string>('Search Pokémon...');
  searchChange = output<string>();

  onValueChange(newValue: string) {
    this.value.set(newValue);
    this.searchChange.emit(newValue);
  }

  clear() {
    this.value.set('');
    this.searchChange.emit('');
  }
}
