import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-setup-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div
        class="bg-surface border border-theme rounded-2xl shadow-lg p-8 max-w-md w-full relative overflow-hidden"
      >
        <div class="text-center mb-8 pt-2">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--color-surface-raised)] border-2 border-theme flex items-center justify-center"
          >
            @if (displayName().trim()) {
              <span class="text-3xl font-bold text-primary">
                {{ displayName().trim().charAt(0).toUpperCase() }}
              </span>
            } @else {
              <svg
                class="w-10 h-10 text-secondary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          </div>
          <h1 class="text-2xl font-extrabold text-primary tracking-tight mb-2">
            Set up your profile
          </h1>
          <p class="text-secondary text-sm">Choose a display name that other trainers will see</p>
        </div>

        @if (error()) {
          <div
            class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
            role="alert"
          >
            {{ error() }}
          </div>
        }

        <div class="flex flex-col gap-4">
          <div>
            <label for="displayName" class="block text-sm font-semibold text-primary mb-1.5"
              >Display Name</label
            >
            <input
              id="displayName"
              type="text"
              [(ngModel)]="displayName"
              placeholder="Your trainer name"
              maxlength="30"
              class="w-full px-4 py-3 rounded-xl border border-theme bg-surface text-primary text-sm focus:outline-none focus:border-[var(--color-active)] focus:ring-1 focus:ring-[var(--color-active)] transition-colors placeholder:text-[var(--color-text-secondary)]"
              (keydown.enter)="saveDisplayName()"
            />
            <p class="mt-1.5 text-xs text-secondary">{{ displayName().length }}/30 characters</p>
          </div>

          <button
            (click)="saveDisplayName()"
            [disabled]="!displayName().trim() || saving()"
            class="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all
                   bg-[var(--color-primary)] text-[var(--color-text-tertiary)]
                   hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
          >
            @if (saving()) {
              <div
                class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"
              ></div>
              Saving...
            } @else {
              Continue
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class SetupProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  displayName = signal('');
  saving = signal(false);
  error = signal<string | null>(null);

  async saveDisplayName() {
    const name = this.displayName().trim();
    if (!name) return;

    this.saving.set(true);
    this.error.set(null);

    try {
      await this.authService.updateDisplayName(name);
      await this.router.navigate(['/home']);
    } catch (err: any) {
      console.error('Profile setup error:', err);
      this.error.set('Failed to save your display name. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
