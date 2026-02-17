import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchableOption {
  id: string;
  name: string;
  description?: string;
  category?: string;
  searchTerms?: string[]; // Additional search terms (e.g., names in other languages)
}

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <!-- Selected Value Display / Search Input -->
      <div class="relative">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (focus)="onFocus()"
          (blur)="onBlur()"
          [placeholder]="placeholder()"
          class="input-theme w-full px-3 py-2 rounded-lg border-2 transition-colors pr-8"
          [class.border-blue-500]="isOpen()"
        />
        <button
          type="button"
          (click)="toggleDropdown()"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
        >
          <svg
            class="w-4 h-4 transition-transform"
            [class.rotate-180]="isOpen()"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <!-- Dropdown List -->
      @if (isOpen()) {
        <div
          class="absolute z-50 w-full mt-1 bg-surface border border-theme rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
        >
          @if (filteredOptions().length === 0) {
            <div class="px-3 py-2 text-secondary text-sm">No results found</div>
          } @else {
            @for (option of filteredOptions(); track option.id) {
              <button
                type="button"
                (click)="selectOption(option)"
                class="w-full text-left px-3 py-2 hover:bg-surface-hover transition-colors border-b border-theme last:border-b-0"
              >
                <div class="font-medium text-primary">{{ option.name }}</div>
                @if (option.description) {
                  <div class="text-xs text-secondary mt-0.5">{{ option.description }}</div>
                }
                @if (option.category) {
                  <div class="text-xs text-tertiary mt-0.5">{{ option.category }}</div>
                }
              </button>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [],
})
export class SearchableDropdownComponent {
  options = input.required<SearchableOption[]>();
  placeholder = input<string>('Select an option');
  selectedId = input<string>('');

  valueChanged = output<string>();

  searchQuery = signal('');
  isOpen = signal(false);

  // Computed filtered options based on search
  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.options();

    return this.options().filter(
      (opt) =>
        opt.name.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query) ||
        opt.id.toLowerCase().includes(query) ||
        opt.searchTerms?.some((term) => term.toLowerCase().includes(query)),
    );
  });

  constructor() {
    // Update search query to show selected option name
    effect(() => {
      const selected = this.options().find((opt) => opt.id === this.selectedId());
      if (selected && !this.isOpen()) {
        this.searchQuery.set(selected.name);
      } else if (!this.selectedId() && !this.isOpen()) {
        this.searchQuery.set('');
      }
    });
  }

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
    if (!this.isOpen()) {
      // Restore selected value when closing
      const selected = this.options().find((opt) => opt.id === this.selectedId());
      this.searchQuery.set(selected?.name || '');
    }
  }

  onFocus() {
    this.isOpen.set(true);
    // Clear search on focus to allow typing
    this.searchQuery.set('');
  }

  onBlur() {
    // Delay to allow click on option
    setTimeout(() => {
      this.isOpen.set(false);
      const selected = this.options().find((opt) => opt.id === this.selectedId());
      this.searchQuery.set(selected?.name || '');
    }, 200);
  }

  selectOption(option: SearchableOption) {
    this.valueChanged.emit(option.id);
    this.searchQuery.set(option.name);
    this.isOpen.set(false);
  }
}
