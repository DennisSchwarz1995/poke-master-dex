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
import { CustomDropdownOption } from '../../../../shared/components/custom-dropdown/custom-dropdown.component';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { FallbackImageDirective } from '../../../../shared/directives/fallback-image/fallback-image.directive';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-pokemon-edit-ribbons',
  standalone: true,
  imports: [CommonModule, FormsModule, CdnUrlPipe, FallbackImageDirective, IconComponent],
  template: `
    <section class="flex flex-col gap-8">
      <div>
        @if (selectedRibbons().length > 0) {
          <div class="flex flex-col gap-2 mb-4">
            @for (ribbonId of selectedRibbons(); track ribbonId) {
              <div
                class="flex items-center gap-3 px-3 py-2 bg-tertiary border border-theme rounded-lg group"
              >
                @if (getRibbonOption(ribbonId); as opt) {
                  @if (opt.iconPath) {
                    <img
                      [src]="opt.iconPath | cdnUrl: opt.cdnFolder"
                      [alt]="opt.name"
                      class="w-7 h-7 object-contain flex-shrink-0"
                      appFallback
                    />
                  }
                  <span class="flex-1 font-medium text-primary text-sm truncate">{{
                    opt.name
                  }}</span>
                } @else {
                  <span class="flex-1 font-medium text-primary text-sm truncate">{{
                    ribbonId
                  }}</span>
                }
                <button
                  type="button"
                  (click)="removeRibbon(ribbonId)"
                  class="text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
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
              </div>
            }
          </div>
        } @else {
          <p class="text-secondary text-sm italic mb-4">No ribbons selected</p>
        }

        <div class="relative" #ribbonContainer>
          <button
            type="button"
            (click)="toggleRibbonDropdown()"
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-theme text-secondary hover:text-primary hover:border-blue-500 transition-all text-sm font-medium w-full justify-center"
          >
            <app-icon name="plus" size="1em"></app-icon>
            Add Ribbon
          </button>

          @if (ribbonDropdownOpen()) {
            <div
              class="absolute z-50 w-full mt-1 bg-surface border border-theme rounded-lg shadow-xl flex flex-col max-h-64 overflow-hidden"
            >
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
                  #ribbonSearchInput
                  type="text"
                  [(ngModel)]="ribbonSearchQuery"
                  placeholder="Search ribbons..."
                  class="w-full bg-surface pl-9 pr-3 py-2 text-sm text-primary placeholder-tertiary outline-none transition-colors border-b border-theme"
                  (click)="$event.stopPropagation()"
                />
              </div>
              <div class="flex-1 overflow-y-auto custom-scrollbar">
                @for (option of filteredRibbonOptions(); track option.id) {
                  <button
                    type="button"
                    (click)="addRibbon(option.id)"
                    class="w-full text-left px-3 py-2.5 transition-colors border-b border-theme last:border-b-0 hover:bg-surface-hover cursor-pointer"
                  >
                    <div class="flex items-center gap-2">
                      @if (option.iconPath) {
                        <img
                          [src]="option.iconPath | cdnUrl: option.cdnFolder"
                          [alt]="option.name"
                          class="w-6 h-6 object-contain flex-shrink-0"
                          appFallback
                        />
                      }
                      <span class="font-medium text-primary text-sm">{{ option.name }}</span>
                    </div>
                  </button>
                } @empty {
                  <div class="px-3 py-3 text-secondary text-sm text-center">No results found</div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <div>
        <h3
          class="text-sm font-bold text-secondary uppercase tracking-wider border-b border-theme pb-2 mb-4"
        >
          Marks
        </h3>

        @if (selectedMarks().length > 0) {
          <div class="flex flex-col gap-2 mb-4">
            @for (markId of selectedMarks(); track markId) {
              <div
                class="flex items-center gap-3 px-3 py-2 bg-tertiary border border-theme rounded-lg group"
              >
                @if (getMarkOption(markId); as opt) {
                  @if (opt.iconPath) {
                    <img
                      [src]="opt.iconPath | cdnUrl: opt.cdnFolder"
                      [alt]="opt.name"
                      class="w-7 h-7 object-contain flex-shrink-0"
                      appFallback
                    />
                  }
                  <span class="flex-1 font-medium text-primary text-sm truncate">{{
                    opt.name
                  }}</span>
                } @else {
                  <span class="flex-1 font-medium text-primary text-sm truncate">{{ markId }}</span>
                }
                <button
                  type="button"
                  (click)="removeMark(markId)"
                  class="text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
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
              </div>
            }
          </div>
        } @else {
          <p class="text-secondary text-sm italic mb-4">No marks selected</p>
        }

        <div class="relative" #markContainer>
          <button
            type="button"
            (click)="toggleMarkDropdown()"
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-theme text-secondary hover:text-primary hover:border-blue-500 transition-all text-sm font-medium w-full justify-center"
          >
            <app-icon name="plus" size="1em"></app-icon>
            Add Mark
          </button>

          @if (markDropdownOpen()) {
            <div
              class="absolute z-50 w-full mt-1 bg-surface border border-theme rounded-lg shadow-xl flex flex-col max-h-64 overflow-hidden"
            >
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
                  #markSearchInput
                  type="text"
                  [(ngModel)]="markSearchQuery"
                  placeholder="Search marks..."
                  class="w-full bg-surface pl-9 pr-3 py-2 text-sm text-primary placeholder-tertiary outline-none transition-colors border-b border-theme"
                  (click)="$event.stopPropagation()"
                />
              </div>
              <div class="flex-1 overflow-y-auto custom-scrollbar">
                @for (option of filteredMarkOptions(); track option.id) {
                  <button
                    type="button"
                    (click)="addMark(option.id)"
                    class="w-full text-left px-3 py-2.5 transition-colors border-b border-theme last:border-b-0 hover:bg-surface-hover cursor-pointer"
                  >
                    <div class="flex items-center gap-2">
                      @if (option.iconPath) {
                        <img
                          [src]="option.iconPath | cdnUrl: option.cdnFolder"
                          [alt]="option.name"
                          class="w-6 h-6 object-contain flex-shrink-0"
                          appFallback
                        />
                      }
                      <span class="font-medium text-primary text-sm">{{ option.name }}</span>
                    </div>
                  </button>
                } @empty {
                  <div class="px-3 py-3 text-secondary text-sm text-center">No results found</div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class PokemonEditRibbonsComponent {
  ribbonOptions = input<CustomDropdownOption[]>([]);
  markOptions = input<CustomDropdownOption[]>([]);
  selectedRibbons = input<string[]>([]);
  selectedMarks = input<string[]>([]);

  ribbonsChanged = output<string[]>();
  marksChanged = output<string[]>();

  ribbonDropdownOpen = signal(false);
  markDropdownOpen = signal(false);
  ribbonSearchQuery = signal('');
  markSearchQuery = signal('');

  @ViewChild('ribbonContainer') ribbonContainerRef!: ElementRef;
  @ViewChild('markContainer') markContainerRef!: ElementRef;
  @ViewChild('ribbonSearchInput') ribbonSearchInputRef!: ElementRef;
  @ViewChild('markSearchInput') markSearchInputRef!: ElementRef;

  filteredRibbonOptions = computed(() => {
    const query = this.ribbonSearchQuery().toLowerCase();
    const selected = new Set(this.selectedRibbons());
    let options = this.ribbonOptions().filter((o) => !selected.has(o.id));
    if (query) {
      options = options.filter(
        (o) => o.name.toLowerCase().includes(query) || o.id.toLowerCase().includes(query),
      );
    }
    return options;
  });

  filteredMarkOptions = computed(() => {
    const query = this.markSearchQuery().toLowerCase();
    const selected = new Set(this.selectedMarks());
    let options = this.markOptions().filter((o) => !selected.has(o.id));
    if (query) {
      options = options.filter(
        (o) => o.name.toLowerCase().includes(query) || o.id.toLowerCase().includes(query),
      );
    }
    return options;
  });

  getRibbonOption(id: string): CustomDropdownOption | undefined {
    return this.ribbonOptions().find((o) => o.id === id);
  }

  getMarkOption(id: string): CustomDropdownOption | undefined {
    return this.markOptions().find((o) => o.id === id);
  }

  toggleRibbonDropdown() {
    this.ribbonDropdownOpen.set(!this.ribbonDropdownOpen());
    this.markDropdownOpen.set(false);
    if (this.ribbonDropdownOpen()) {
      this.ribbonSearchQuery.set('');
      setTimeout(() => this.ribbonSearchInputRef?.nativeElement?.focus(), 50);
    }
  }

  toggleMarkDropdown() {
    this.markDropdownOpen.set(!this.markDropdownOpen());
    this.ribbonDropdownOpen.set(false);
    if (this.markDropdownOpen()) {
      this.markSearchQuery.set('');
      setTimeout(() => this.markSearchInputRef?.nativeElement?.focus(), 50);
    }
  }

  addRibbon(id: string) {
    const current = [...this.selectedRibbons()];
    if (!current.includes(id)) {
      current.push(id);
      this.ribbonsChanged.emit(current);
    }
    this.ribbonDropdownOpen.set(false);
    this.ribbonSearchQuery.set('');
  }

  removeRibbon(id: string) {
    const current = this.selectedRibbons().filter((r) => r !== id);
    this.ribbonsChanged.emit(current);
  }

  addMark(id: string) {
    const current = [...this.selectedMarks()];
    if (!current.includes(id)) {
      current.push(id);
      this.marksChanged.emit(current);
    }
    this.markDropdownOpen.set(false);
    this.markSearchQuery.set('');
  }

  removeMark(id: string) {
    const current = this.selectedMarks().filter((m) => m !== id);
    this.marksChanged.emit(current);
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent) {
    if (
      this.ribbonDropdownOpen() &&
      this.ribbonContainerRef &&
      !this.ribbonContainerRef.nativeElement.contains(event.target as Node)
    ) {
      this.ribbonDropdownOpen.set(false);
      this.ribbonSearchQuery.set('');
    }
    if (
      this.markDropdownOpen() &&
      this.markContainerRef &&
      !this.markContainerRef.nativeElement.contains(event.target as Node)
    ) {
      this.markDropdownOpen.set(false);
      this.markSearchQuery.set('');
    }
  }
}
