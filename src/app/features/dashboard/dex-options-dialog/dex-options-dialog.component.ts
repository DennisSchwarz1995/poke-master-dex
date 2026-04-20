import { Component, input, output, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dex-options-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          <h2 class="text-2xl font-bold text-primary">Dex Options</h2>
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
            <label class="block font-semibold mb-2 text-primary">Rename Dex</label>
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

          <div>
            <button
              (click)="onDeleteClicked()"
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
              Delete Dex
            </button>
            <p class="text-sm text-secondary mt-3">
              This action will permanently delete the Dex "{{ currentName() }}" and all its 200
              boxes.
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
  `,
  styles: [],
})
export class DexOptionsDialogComponent implements OnInit {
  currentName = input.required<string>();

  closed = output<void>();
  nameSaved = output<string>();
  deleteRequested = output<void>();

  newName = '';

  ngOnInit() {
    this.newName = this.currentName();
  }

  save() {
    if (this.newName.trim() && this.newName !== this.currentName() && this.newName.length <= 16) {
      this.nameSaved.emit(this.newName.trim());
    } else {
      this.close();
    }
  }

  onDeleteClicked() {
    this.deleteRequested.emit();
  }

  close() {
    this.closed.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
