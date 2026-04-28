import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CustomDropdownOption {
  id: string;
  name: string;
  description?: string;
  descriptionHtml?: string;
  category?: string;
  searchTerms?: string[];
  iconPath?: string;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative group" #container>
      <div class="relative flex items-center">
        @if (selectedOption()?.iconPath) {
          <div class="absolute left-3 z-20 flex items-center pointer-events-none">
            <img
              [src]="selectedOption()!.iconPath"
              [alt]="selectedOption()!.name"
              class="w-5 h-5 object-contain image-pixelated"
              (error)="onImgError($event)"
            />
          </div>
        }

        <input
          type="text"
          [(ngModel)]="searchQuery"
          (focus)="onFocus()"
          (blur)="onBlur()"
          [placeholder]="placeholder()"
          [readonly]="!searchable()"
          class="w-full bg-surface border-2 border-theme rounded-lg px-3 py-3 text-sm text-primary placeholder-tertiary focus:border-blue-500 outline-none transition-colors peer"
          [class.cursor-pointer]="!searchable()"
          [class.pl-10]="selectedOption()?.iconPath"
          [class.pr-8]="true"
        />

        @if (label()) {
          <label
            class="absolute -top-2.5 left-2 bg-surface px-1 text-xs font-bold text-secondary uppercase z-10 transition-colors peer-focus:text-blue-500"
          >
            {{ label() }}
          </label>
        }

        <button
          type="button"
          (click)="toggleDropdown()"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary z-20"
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
          class="absolute z-50 w-full bg-surface border border-theme rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
          [class.mt-1]="dropdownDirection() === 'down'"
          [class.top-full]="dropdownDirection() === 'down'"
          [class.mb-1]="dropdownDirection() === 'up'"
          [class.bottom-full]="dropdownDirection() === 'up'"
        >
          @if (filteredOptions().length === 0) {
            <div class="px-3 py-2 text-secondary text-sm">No results found</div>
          } @else {
            @for (group of groupedOptions(); track group.label) {
              @if (group.label) {
                <div
                  class="px-3 py-2 min-h-[40px] flex items-center text-sm font-bold text-secondary bg-surface border-b border-theme sticky top-0 z-10"
                >
                  {{ group.label }}
                </div>
              }
              @for (option of group.items; track option.id) {
                <button
                  type="button"
                  (click)="selectOption(option)"
                  [disabled]="option.id === undefined"
                  class="w-full text-left px-3 py-2 transition-colors border-b border-theme last:border-b-0"
                  [ngClass]="{
                    'hover:bg-surface-hover cursor-pointer':
                      option.id !== undefined && option.id !== selectedId(),
                    'opacity-50 cursor-not-allowed bg-surface-hover': option.id === undefined,
                    'bg-blue-500/10 text-blue-500 dark:text-blue-400 font-semibold':
                      option.id !== undefined && option.id === selectedId(),
                  }"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex flex-col min-w-0">
                      <span class="font-medium text-primary truncate">{{ option.name }}</span>
                      @if (option.descriptionHtml) {
                        <span
                          class="text-xs mt-0.5 truncate"
                          [innerHTML]="option.descriptionHtml"
                        ></span>
                      } @else if (option.description) {
                        <span class="text-xs text-secondary mt-0.5 truncate">{{
                          option.description
                        }}</span>
                      }
                    </div>
                    @if (option.iconPath) {
                      <img
                        [src]="option.iconPath"
                        [alt]="option.name"
                        class="w-6 h-6 object-contain flex-shrink-0"
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
})
export class CustomDropdownComponent {
  options = input.required<CustomDropdownOption[]>();
  placeholder = input<string>('Select an option');
  selectedId = input<string>('');
  label = input<string>();
  searchable = input<boolean>(true);

  valueChanged = output<string>();

  searchQuery = signal('');
  isOpen = signal(false);
  dropdownDirection = signal<'down' | 'up'>('down');

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  selectedOption = computed(() => this.options().find((opt) => opt.id === this.selectedId()));

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query || !this.searchable()) return this.options();

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
    const groups = new Map<string, CustomDropdownOption[]>();
    const noCategory: CustomDropdownOption[] = [];

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

    const result: { label: string; items: CustomDropdownOption[] }[] = [];

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

  private calculateDirection() {
    if (!this.containerRef) return;
    const element = this.containerRef.nativeElement;
    const rect = element.getBoundingClientRect();

    let scrollParent: HTMLElement | null = element.parentElement;
    while (scrollParent) {
      const style = getComputedStyle(scrollParent);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        break;
      }
      scrollParent = scrollParent.parentElement;
    }

    const parentRect = scrollParent
      ? scrollParent.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight };

    const spaceBelow = parentRect.bottom - rect.bottom;
    const spaceAbove = rect.top - parentRect.top;

    if (spaceBelow < 250 && spaceAbove > spaceBelow) {
      this.dropdownDirection.set('up');
    } else {
      this.dropdownDirection.set('down');
    }
  }

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      this.calculateDirection();
    } else {
      const selected = this.options().find((opt) => opt.id === this.selectedId());
      this.searchQuery.set(selected?.name || '');
    }
  }

  onFocus() {
    this.calculateDirection();
    if (this.isOpen()) {
      this.isOpen.set(false);
      const selected = this.options().find((opt) => opt.id === this.selectedId());
      this.searchQuery.set(selected?.name || '');
      return;
    }
    this.isOpen.set(true);
    if (!this.searchable()) {
      const selected = this.options().find((opt) => opt.id === this.selectedId());
      this.searchQuery.set(selected?.name || '');
    } else {
      this.searchQuery.set('');
    }
  }

  onBlur() {
    setTimeout(() => {
      if (this.searchQuery().trim() === '') {
        this.valueChanged.emit('');
        this.searchQuery.set('');
      } else {
        const selected = this.options().find((opt) => opt.id === this.selectedId());
        this.searchQuery.set(selected?.name || '');
      }
    }, 200);
  }

  selectOption(option: CustomDropdownOption) {
    if (option.id === undefined) return;
    this.valueChanged.emit(option.id);
    this.searchQuery.set(option.name);
    this.isOpen.set(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent) {
    if (
      this.isOpen() &&
      this.containerRef &&
      !this.containerRef.nativeElement.contains(event.target as Node)
    ) {
      this.isOpen.set(false);
      const selected = this.options().find((opt) => opt.id === this.selectedId());
      this.searchQuery.set(selected?.name || '');
    }
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
