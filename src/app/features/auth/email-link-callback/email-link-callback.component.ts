import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-email-link-callback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div
        class="bg-surface border border-theme rounded-2xl shadow-lg p-8 max-w-md w-full relative overflow-hidden"
      >
        @if (loading()) {
          <div class="text-center py-8 pt-4">
            <div
              class="animate-spin rounded-full h-12 w-12 border-[3px] border-[var(--color-border)] border-t-[var(--color-active)] mx-auto"
            ></div>
            <p class="mt-4 text-secondary text-sm font-medium">Verifying your sign-in link...</p>
          </div>
        } @else if (needsEmail()) {
          <div class="pt-2">
            <div class="text-center mb-6">
              <h1 class="text-2xl font-extrabold text-primary tracking-tight mb-2">
                Confirm your email
              </h1>
              <p class="text-secondary text-sm">
                It looks like you opened this link on a different device. Please enter the email
                address you used to request the sign-in link.
              </p>
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
              <input
                type="email"
                [(ngModel)]="emailInput"
                placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-xl border border-theme bg-surface text-primary text-sm focus:outline-none focus:border-[var(--color-active)] focus:ring-1 focus:ring-[var(--color-active)] transition-colors placeholder:text-[var(--color-text-secondary)]"
                (keydown.enter)="confirmWithEmail()"
              />
              <button
                (click)="confirmWithEmail()"
                [disabled]="!emailInput.trim()"
                class="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all
                       bg-[var(--color-primary)] text-[var(--color-text-tertiary)]
                       hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Sign In
              </button>
            </div>
          </div>
        } @else if (error()) {
          <div class="text-center py-4 pt-2">
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p class="text-primary font-semibold mb-2">Sign in failed</p>
            <p class="text-secondary text-sm mb-6">{{ error() }}</p>
            <a
              href="/login"
              class="inline-block py-2.5 px-6 rounded-xl font-semibold text-sm transition-all
                     bg-[var(--color-primary)] text-[var(--color-text-tertiary)] hover:opacity-90"
            >
              Back to Sign In
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class EmailLinkCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  needsEmail = signal(false);
  emailInput = '';

  ngOnInit() {
    this.handleEmailLink();
  }

  private async handleEmailLink() {
    const currentUrl = window.location.href;

    if (!this.authService.isEmailSignInLink(currentUrl)) {
      this.loading.set(false);
      this.error.set('This link is invalid or has expired. Please request a new sign-in link.');
      return;
    }

    const storedEmail = this.authService.getStoredEmail();

    if (!storedEmail) {
      // User opened link on a different device
      this.loading.set(false);
      this.needsEmail.set(true);
      return;
    }

    await this.completeSignIn(storedEmail);
  }

  async confirmWithEmail() {
    if (!this.emailInput.trim()) return;

    this.loading.set(true);
    this.error.set(null);
    this.needsEmail.set(false);

    await this.completeSignIn(this.emailInput.trim());
  }

  private async completeSignIn(email: string) {
    try {
      const result = await this.authService.completeSignInWithLink(email, window.location.href);

      if (!result.user.displayName) {
        await this.router.navigate(['/auth/setup-profile']);
      } else {
        await this.router.navigate(['/home']);
      }
    } catch (err: any) {
      console.error('Email link sign-in error:', err);
      this.loading.set(false);

      if (err.code === 'auth/invalid-action-code') {
        this.error.set('This link has expired or has already been used. Please request a new one.');
      } else if (err.code === 'auth/invalid-email') {
        this.error.set('The email address does not match. Please try again.');
        this.needsEmail.set(true);
      } else {
        this.error.set('Sign in failed. Please try again.');
      }
    }
  }
}
