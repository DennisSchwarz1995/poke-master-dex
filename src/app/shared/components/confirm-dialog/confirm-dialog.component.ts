import { Component, input, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="bg-surface border-2 border-theme rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-between p-4 border-b border-theme bg-secondary/30">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-primary">{{ title() }}</h2>
          </div>
          <button
            (click)="cancel()"
            class="text-secondary hover:text-primary transition-colors p-1"
            aria-label="Close dialog"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="p-6 text-primary">
          <p class="whitespace-pre-line">{{ message() }}</p>
        </div>

        <div class="p-4 border-t border-theme bg-tertiary flex justify-end gap-3">
          <button
            (click)="cancel()"
            class="px-4 py-2 rounded-lg font-medium text-secondary hover:bg-secondary/50 transition-colors"
          >
            {{ cancelText() }}
          </button>
          <button
            (click)="confirm()"
            class="px-4 py-2 rounded-lg font-bold text-white shadow-lg transition-all active:scale-95"
            [ngClass]="confirmButtonClass()"
          >
            {{ confirmText() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  title = input.required<string>();
  message = input.required<string>();
  confirmText = input<string>('Confirm');
  cancelText = input<string>('Cancel');

  confirmButtonClass = input<string>('bg-red-600 hover:bg-red-500 shadow-red-500/20');

  confirmed = output<void>();
  cancelled = output<void>();

  confirm() {
    this.confirmed.emit();
  }

  cancel() {
    this.cancelled.emit();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.cancel();
  }
}
