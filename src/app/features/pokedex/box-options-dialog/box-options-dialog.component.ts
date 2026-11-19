import { Component, input, output, signal, HostListener, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  CustomDropdownComponent,
  CustomDropdownOption,
} from '../../../shared/components/custom-dropdown/custom-dropdown.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

export interface AutoFillOption {
  offset: number;
  label: string;
}

@Component({
  selector: 'app-box-options-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialogComponent,
    CustomDropdownComponent,
    IconComponent,
  ],
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
            <app-icon name="close"></app-icon>
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
            <p class="text-xs text-secondary mt-1 text-right">{{ newName.length }} / 16</p>
          </div>

          <div class="h-px bg-theme w-full"></div>

          <div class="flex flex-col gap-4">
            <label class="block font-semibold mb-2 text-primary">Auto-Fill Box</label>
            <div class="mb-4">
              <app-custom-dropdown
                [options]="dropdownOptions()"
                [selectedId]="String(selectedAutoFillOffset)"
                placeholder="Select a preset"
                label="Preset Selection"
                (valueChanged)="onAutoFillOptionChanged($event)"
              />
            </div>

            <button (click)="showAutoFillConfirm.set(true)" class="btn btn-save w-full">
              <app-icon name="stack"></app-icon>
              Auto-Fill Box
            </button>
            <p class="text-sm text-secondary mt-1">
              Automatically populate this box with the correct Pokemon for your "{{ typeName() }}"
              starting from Box {{ startBox() }}.
            </p>
          </div>

          <div class="h-px bg-theme w-full"></div>

          <div>
            <button (click)="showEmptyConfirm.set(true)" class="btn btn-delete w-full">
              <app-icon name="clear"></app-icon>
              Clear Box Data
            </button>
            <p class="text-sm text-secondary mt-3 mb-6">
              This action will unmark all Pokemon in Box {{ boxNumber() }} named
              {{ currentName() }} as owned and remove all their Data.
            </p>

            <button (click)="showRemoveAllConfirm.set(true)" class="btn btn-delete w-full">
              <app-icon name="remove-pokemon"></app-icon>
              Remove All Pokemon
            </button>
            <p class="text-sm text-secondary mt-3">
              This action will completely remove all Pokemon from Box {{ boxNumber() }}, leaving all
              slots completely empty.
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-theme">
          <button (click)="close()" class="btn btn-secondary">
            <app-icon name="cancel" size="1.25em"></app-icon>Cancel
          </button>
          <button
            (click)="save()"
            [disabled]="!newName.trim() || newName === currentName()"
            class="btn btn-save"
          >
            <app-icon name="save" size="1.25em"></app-icon>
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

  newName: string = '';
  selectedAutoFillOffset: number = 0;
  String = String;

  dropdownOptions = computed<CustomDropdownOption[]>(() =>
    this.autoFillOptions().map((opt) => ({
      id: String(opt.offset),
      name: opt.label,
    })),
  );
  showAutoFillConfirm = signal<boolean>(false);
  showEmptyConfirm = signal<boolean>(false);
  showRemoveAllConfirm = signal<boolean>(false);

  ngOnInit(): void {
    this.newName = this.currentName();
    const defaultOffset = (this.boxNumber() - this.startBox() + 200) % 200;
    this.selectedAutoFillOffset = defaultOffset >= 0 ? defaultOffset : 0;
  }

  save(): void {
    if (this.isValidName) {
      this.nameSaved.emit(this.newName.trim());
    } else {
      this.close();
    }
  }

  get isValidName(): boolean {
    const trimmedName = this.newName.trim();
    return !!trimmedName && trimmedName !== this.currentName() && trimmedName.length <= 16;
  }

  onAutoFillOptionChanged(id: string): void {
    this.selectedAutoFillOffset = Number(id);
  }

  confirmAutoFill(): void {
    this.showAutoFillConfirm.set(false);
    this.autoFillRequested.emit(Number(this.selectedAutoFillOffset));
  }

  confirmEmptyBox(): void {
    this.showEmptyConfirm.set(false);
    this.emptyBoxRequested.emit();
  }

  confirmRemoveAll(): void {
    this.showRemoveAllConfirm.set(false);
    this.removeAllRequested.emit();
  }

  close(): void {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (!this.showEmptyConfirm() && !this.showRemoveAllConfirm() && !this.showAutoFillConfirm()) {
      this.close();
    }
  }
}
