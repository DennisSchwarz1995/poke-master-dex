import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchableOption {
  id: string;
  name: string;
  description?: string;
  category?: string;
  searchTerms?: string[];
  iconPath?: string;
}

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="relative flex items-center gap-2">
        @if (selectedOption()?.iconPath) {
          <img
            [src]="selectedOption()!.iconPath"
            [alt]="selectedOption()!.name"
            class="w-5 h-5 object-contain flex-shrink-0 image-pixelated"
            (error)="onImgError($event)"
          />
        }
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

      @if (isOpen()) {
        <div
          class="absolute z-50 w-full mt-1 bg-surface border border-theme rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
        >
          @if (filteredOptions().length === 0) {
            <div class="px-3 py-2 text-secondary text-sm">No results found</div>
          } @else {
            @for (group of groupedOptions(); track group.label) {
              @if (group.label) {
                <div
                  class="px-3 py-1 text-xs font-bold text-secondary bg-secondary/10 sticky top-0 backdrop-blur-sm"
                >
                  {{ group.label }}
                </div>
              }
              @for (option of group.items; track option.id) {
                <button
                  type="button"
                  (click)="selectOption(option)"
                  class="w-full text-left px-3 py-2 hover:bg-surface-hover transition-colors border-b border-theme last:border-b-0"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex flex-col min-w-0">
                      <span class="font-medium text-primary truncate">{{ option.name }}</span>
                      @if (option.description) {
                        <span class="text-xs text-secondary mt-0.5 truncate">{{
                          option.description
                        }}</span>
                      }
                    </div>
                    @if (option.iconPath) {
                      <img
                        [src]="option.iconPath"
                        [alt]="option.name"
                        class="w-6 h-6 object-contain flex-shrink-0 image-pixelated"
                        (error)="onImgError($event)"
                      />
                    }
                  </div>
                </button>
              }
            }
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .image-pixelated {
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }
    `,
  ],
})
export class SearchableDropdownComponent {
  options = input.required<SearchableOption[]>();
  placeholder = input<string>('Select an option');
  selectedId = input<string>('');

  valueChanged = output<string>();

  searchQuery = signal('');
  isOpen = signal(false);

  selectedOption = computed(() => this.options().find((opt) => opt.id === this.selectedId()));

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

  groupedOptions = computed(() => {
    const options = this.filteredOptions();
    const groups = new Map<string, SearchableOption[]>();
    const noCategory: SearchableOption[] = [];

    options.forEach((opt) => {
      if (opt.category) {
        if (!groups.has(opt.category)) {
          groups.set(opt.category, []);
        }
        groups.get(opt.category)!.push(opt);
      } else {
        noCategory.push(opt);
      }
    });

    const result: { label: string; items: SearchableOption[] }[] = [];

    if (noCategory.length > 0) {
      result.push({ label: '', items: noCategory });
    }

    groups.forEach((items, label) => {
      result.push({ label, items });
    });

    return result;
  });

  constructor() {
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
      const selected = this.options().find((opt) => opt.id === this.selectedId());
      this.searchQuery.set(selected?.name || '');
    }
  }

  onFocus() {
    this.isOpen.set(true);
    this.searchQuery.set('');
  }

  onBlur() {
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

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
