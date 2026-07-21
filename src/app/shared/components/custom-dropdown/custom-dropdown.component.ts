import {
  Component,
  input,
  output,
  signal,
  computed,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdnUrlPipe } from '../../pipes/cdnUrl.pipe';
import { IconComponent } from '../icon/icon.component';

export interface CustomDropdownOption {
  id: string;
  name: string;
  description?: string;
  descriptionHtml?: string;
  category?: string;
  active?: boolean;
  searchTerms?: string[];
  iconPath?: string;
  cdnFolder?: string;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, CdnUrlPipe, IconComponent],
  template: `
    <div class="relative group" #container>
      <div class="relative flex items-center">
        @if (selectedOption()?.iconPath) {
          <div class="absolute z-20 flex items-center pointer-events-none" [style.right.px]="28">
            <img
              [src]="selectedOption()!.iconPath | cdnUrl: selectedOption()!.cdnFolder"
              [alt]="selectedOption()!.name"
              class="w-6 h-6 object-contain"
              (error)="onImgError($event)"
              loading="lazy"
            />
          </div>
        }

        <input
          type="text"
          [value]="selectedOption() ? selectedOption()!.name : ''"
          [placeholder]="placeholder()"
          readonly
          class="w-full bg-surface border-2 rounded-lg px-4 pr-8 py-4 text-sm text-primary placeholder-tertiary outline-none transition-colors peer cursor-pointer"
          style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"
          [class.border-[var(--color-active)]]="isOpen()"
          [class.border-theme]="!isOpen()"
          (click)="toggleDropdown()"
          (keydown.space)="$event.preventDefault(); toggleDropdown()"
          (keydown.enter)="$event.preventDefault(); toggleDropdown()"
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
          <app-icon
            name="dropdown-arrow"
            size="1em"
            class="transition-transform"
            [class.rotate-180]="isOpen()"
          ></app-icon>
        </button>
      </div>

      @if (isOpen()) {
        <div
          class="absolute z-50 w-full bg-surface border border-theme rounded-lg shadow-xl flex flex-col max-h-80 overflow-hidden"
          [class.mt-1]="dropdownDirection() === 'down'"
          [class.top-full]="dropdownDirection() === 'down'"
          [class.mb-1]="dropdownDirection() === 'up'"
          [class.bottom-full]="dropdownDirection() === 'up'"
        >
          @if (searchable()) {
            <div class="relative flex items-center">
              <div class="absolute left-3 flex items-center pointer-events-none text-secondary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                #searchInput
                type="text"
                [(ngModel)]="searchQuery"
                [placeholder]="'Search...'"
                class="w-full bg-surface pl-9 pr-8 py-2 text-sm text-primary placeholder-tertiary outline-none transition-colors border-b border-theme"
                (click)="$event.stopPropagation()"
              />
              @if (searchQuery()) {
                <button
                  type="button"
                  (click)="searchQuery.set(''); $event.stopPropagation(); searchInput.focus()"
                  class="absolute right-3 text-secondary hover:text-primary"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              }
            </div>
          }
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            @if (filteredOptions().length === 0) {
              <div class="px-3 py-3 text-secondary text-sm text-center">No results found</div>
            } @else {
              @for (group of groupedOptions(); track group.label) {
                @if (group.label) {
                  <div
                    class="px-3 py-2 min-h-[40px] flex items-center text-sm font-bold text-secondary bg-secondary/10 border-b border-theme"
                  >
                    {{ group.label }}
                  </div>
                }
                @for (option of group.items; track option.id) {
                  <button
                    type="button"
                    (click)="selectOption(option)"
                    [disabled]="option.id === undefined"
                    class="w-full text-left px-3 py-2.5 transition-colors border-b border-theme last:border-b-0"
                    [ngClass]="{
                      'hover:bg-surface-hover cursor-pointer':
                        option.id !== undefined && option.id !== selectedId() && !option.active,

                      'opacity-50 cursor-not-allowed bg-surface-hover': option.id === undefined,

                      'bg-blue-500/10 text-blue-500 dark:text-blue-400 font-semibold':
                        option.id !== undefined && (option.id === selectedId() || option.active),
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
                          [src]="option.iconPath | cdnUrl: option.cdnFolder"
                          [alt]="option.name"
                          class="w-6 h-6 object-contain flex-shrink-0"
                          (error)="onImgError($event)"
                          loading="lazy"
                        />
                      }
                    </div>
                  </button>
                }
              }
            }
          </div>

          <div class="py-2.5 px-1.5 border-t border-theme bg-secondary/5 flex-shrink-0 flex">
            <button
              type="button"
              (click)="clearSelection($event)"
              [disabled]="!hasSelection()"
              class="flex items-center gap-1.5 px-1.5 py-1.5 text-xs font-semibold rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:text-red-500 enabled:hover:bg-surface-hover"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear Selection
            </button>
          </div>
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
  searchable = input<boolean>(false);

  valueChanged = output<string>();

  searchQuery = signal('');
  isOpen = signal(false);
  dropdownDirection = signal<'down' | 'up'>('down');

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  selectedOption = computed(() => this.options().find((option) => option.id === this.selectedId()));

  hasSelection = computed(() => {
    const selected = this.selectedOption();
    if (selected && selected.name !== 'ALL') return true;
    return this.options().some((opt) => opt.active);
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query || !this.searchable()) return this.options();

    return this.options().filter(
      (option) =>
        option.name.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query) ||
        option.id.toLowerCase().includes(query) ||
        option.searchTerms?.some((term) => term.toLowerCase().includes(query)),
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
      this.searchQuery.set('');
      setTimeout(() => {
        this.searchInputRef?.nativeElement?.focus();
      }, 50);
    } else {
      this.searchQuery.set('');
    }
  }

  selectOption(option: CustomDropdownOption) {
    if (option.id === undefined) return;
    this.valueChanged.emit(option.id);
    this.searchQuery.set('');
    this.isOpen.set(false);
  }

  clearSelection(event: MouseEvent) {
    event.stopPropagation();
    this.valueChanged.emit('');
    this.searchQuery.set('');
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
      this.searchQuery.set('');
    }
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
