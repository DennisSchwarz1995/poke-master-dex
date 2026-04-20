import { Component, input, output, signal, HostListener, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

export interface AutoFillOption {
  offset: number;
  label: string;
}

@Component({
  selector: 'app-box-options-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
      (click)="close()"
    >
      <div
        class="bg-surface rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-theme animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-primary">Box Options</h2>
          <button (click)="close()" class="text-secondary hover:text-primary transition-colors p-1">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block font-semibold mb-2 text-primary">Rename Box</label>
            <input
              [(ngModel)]="newName"
              type="text"
              maxlength="16"
              class="w-full px-4 py-2 bg-secondary border border-theme rounded-lg text-primary placeholder:text-tertiary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              (keyup.enter)="save()"
            />
            <p class="text-xs text-tertiary mt-1 text-right">{{ newName.length }} / 16</p>
          </div>

          <div class="h-px bg-theme w-full"></div>

          <!-- Auto-Fill Box Section -->
          <div>
            <label class="block font-semibold mb-2 text-primary">Auto-Fill Box</label>
            <div class="mb-4">
              <label class="block text-sm text-secondary mb-1">Preset Selection</label>
              <select
                [(ngModel)]="selectedAutoFillOffset"
                class="w-full px-3 py-2 bg-secondary border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500 transition-colors"
              >
                @for (opt of autoFillOptions(); track opt.offset) {
                  <option [value]="opt.offset">{{ opt.label }}</option>
                }
              </select>
            </div>

            <button
              (click)="showAutoFillConfirm.set(true)"
              class="w-full py-2.5 px-4 bg-blue-500/10 text-blue-500 border border-blue-500/50 rounded-lg hover:bg-blue-500 hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Auto-Fill Box
            </button>
            <p class="text-sm text-secondary mt-3">
              Automatically populate this box with the correct Pokemon for your "{{ typeName() }}"
              starting from Box {{ startBox() }}.
            </p>
          </div>

          <div class="h-px bg-theme w-full"></div>

          <div>
            <button
              (click)="showEmptyConfirm.set(true)"
              class="w-full py-2.5 px-4 bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear Box Data
            </button>
            <p class="text-sm text-secondary mt-3 mb-6">
              This action will unmark all Pokemon in Box {{ boxNumber() }} named
              {{ currentName() }} as owned and remove all their Data.
            </p>

            <button
              (click)="showRemoveAllConfirm.set(true)"
              class="w-full py-2.5 px-4 bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remove All Pokemon
            </button>
            <p class="text-sm text-secondary mt-3">
              This action will completely remove all Pokemon from Box {{ boxNumber() }}, leaving all
              slots completely empty.
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-theme">
          <button
            (click)="close()"
            class="px-4 py-2 font-medium text-secondary hover:text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            (click)="save()"
            [disabled]="!newName.trim() || newName === currentName()"
            class="px-5 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    @if (showAutoFillConfirm()) {
      <app-confirm-dialog
        title="Auto-Fill Box"
        message="Are you sure you want to auto-fill Box {{
          boxNumber()
        }}?&#10;Pokemon slots will be updated to match the correct sequence."
        icon="✨"
        confirmText="Auto-Fill"
        cancelText="Cancel"
        confirmButtonClass="bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
        (confirmed)="confirmAutoFill()"
        (cancelled)="showAutoFillConfirm.set(false)"
      />
    }

    @if (showEmptyConfirm()) {
      <app-confirm-dialog
        title="Clear Box Data"
        message="Are you sure you want to clear data for Box {{
          boxNumber()
        }}?&#10;All Pokemon inside will be marked as unowned."
        icon="🗑️"
        confirmText="Clear Data"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-500 shadow-red-500/20"
        (confirmed)="confirmEmptyBox()"
        (cancelled)="showEmptyConfirm.set(false)"
      />
    }

    @if (showRemoveAllConfirm()) {
      <app-confirm-dialog
        title="Remove All Pokemon"
        message="Are you sure you want to completely remove all Pokemon from Box {{
          boxNumber()
        }}?&#10;This will leave all slots empty."
        icon="⚠️"
        confirmText="Remove All"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-500 shadow-red-500/20"
        (confirmed)="confirmRemoveAll()"
        (cancelled)="showRemoveAllConfirm.set(false)"
      />
    }
  `,
  styles: [],
})
export class BoxOptionsDialogComponent implements OnInit {
  currentName = input.required<string>();
  boxNumber = input.required<number>();
  dexType = input.required<string>();
  startBox = input.required<number>();
  autoFillOptions = input<AutoFillOption[]>([]);

  typeName = computed(() => {
    switch (this.dexType()) {
      case 'STANDARD':
        return 'Standard Dex';
      case 'LIVING':
        return 'Living Dex';
      case 'SHINY_LIVING':
        return 'Shiny Living Dex';
      case 'FORM':
        return 'Form Dex';
      case 'ORIGIN':
        return 'Origin Dex';
      default:
        return 'Dex';
    }
  });

  closed = output<void>();
  nameSaved = output<string>();
  autoFillRequested = output<number>();
  emptyBoxRequested = output<void>();
  removeAllRequested = output<void>();

  newName = '';
  selectedAutoFillOffset = 0;
  showAutoFillConfirm = signal(false);
  showEmptyConfirm = signal(false);
  showRemoveAllConfirm = signal(false);

  ngOnInit() {
    this.newName = this.currentName();
    const defaultOffset = (this.boxNumber() - this.startBox() + 200) % 200;
    this.selectedAutoFillOffset = defaultOffset >= 0 ? defaultOffset : 0;
  }

  save() {
    if (this.newName.trim() && this.newName !== this.currentName() && this.newName.length <= 16) {
      this.nameSaved.emit(this.newName.trim());
    } else {
      this.close();
    }
  }

  confirmAutoFill() {
    this.showAutoFillConfirm.set(false);
    this.autoFillRequested.emit(Number(this.selectedAutoFillOffset));
  }

  confirmEmptyBox() {
    this.showEmptyConfirm.set(false);
    this.emptyBoxRequested.emit();
  }

  confirmRemoveAll() {
    this.showRemoveAllConfirm.set(false);
    this.removeAllRequested.emit();
  }

  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    if (!this.showEmptyConfirm() && !this.showRemoveAllConfirm() && !this.showAutoFillConfirm()) {
      this.close();
    }
  }
}
