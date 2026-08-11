import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

type LoginStep = 'providers' | 'email-input' | 'email-sent';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div
        class="bg-surface border border-theme rounded-2xl shadow-lg p-8 max-w-md w-full relative overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
        ></div>
        <div class="text-center mb-8 pt-2">
          <img src="/favicon.ico" alt="Poke Master Dex" class="w-16 h-16 mx-auto mb-4 rounded-xl" />
          <h1 class="text-3xl font-extrabold text-primary tracking-tight mb-2">
            @switch (step()) {
              @case ('providers') {
                Welcome back
              }
              @case ('email-input') {
                Sign in with Email
              }
              @case ('email-sent') {
                Check your inbox
              }
            }
          </h1>
          <p class="text-secondary text-sm">
            @switch (step()) {
              @case ('providers') {
                Sign in to manage your Pokémon collection
              }
              @case ('email-input') {
                We'll send you a magic link to sign in
              }
              @case ('email-sent') {
                We sent a magic link to your email
              }
            }
          </p>
        </div>

        @if (loading()) {
          <div class="text-center py-8">
            <div
              class="animate-spin rounded-full h-12 w-12 border-[3px] border-[var(--color-border)] border-t-[var(--color-active)] mx-auto"
            ></div>
            <p class="mt-4 text-secondary text-sm font-medium">Signing in...</p>
          </div>
        } @else {
          @if (error()) {
            <div
              class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2"
              role="alert"
            >
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ error() }}
            </div>
          }

          @switch (step()) {
            @case ('providers') {
              <div class="flex flex-col gap-3">
                <button
                  (click)="signInWithGoogle()"
                  class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-theme bg-surface hover:bg-surface-hover transition-all font-semibold text-primary group"
                >
                  <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span class="text-sm">Continue with Google</span>
                </button>
                <button
                  (click)="signInWithGitHub()"
                  class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-theme bg-surface hover:bg-surface-hover transition-all font-semibold text-primary group"
                >
                  <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                  <span class="text-sm">Continue with GitHub</span>
                </button>
                <div class="flex items-center gap-3 my-1">
                  <div class="flex-1 h-px bg-[var(--color-border)]"></div>
                  <span class="text-xs text-secondary font-medium uppercase tracking-wider"
                    >or</span
                  >
                  <div class="flex-1 h-px bg-[var(--color-border)]"></div>
                </div>
                <button
                  (click)="goToEmailStep()"
                  class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-theme bg-surface hover:bg-surface-hover transition-all font-semibold text-primary group"
                >
                  <svg
                    class="w-5 h-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span class="text-sm">Continue with Email</span>
                </button>
              </div>

              <p class="mt-6 text-center text-xs text-secondary">
                Your data is securely stored with Firebase
              </p>
            }
            @case ('email-input') {
              <div class="flex flex-col gap-4">
                <div>
                  <label for="email" class="block text-sm font-semibold text-primary mb-1.5"
                    >Email address</label
                  >
                  <input
                    id="email"
                    type="email"
                    [(ngModel)]="emailInput"
                    placeholder="you@example.com"
                    class="w-full px-4 py-3 rounded-xl border border-theme bg-surface text-primary text-sm focus:outline-none focus:border-[var(--color-active)] focus:ring-1 focus:ring-[var(--color-active)] transition-colors placeholder:text-[var(--color-text-secondary)]"
                    (keydown.enter)="sendMagicLink()"
                  />
                </div>

                <button
                  (click)="sendMagicLink()"
                  [disabled]="!emailInput.trim()"
                  class="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all
                         bg-[var(--color-primary)] text-[var(--color-text-tertiary)]
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Magic Link
                </button>

                <button
                  (click)="goToProviders()"
                  class="text-sm text-secondary hover:text-primary transition-colors font-medium"
                >
                  ← Back to all options
                </button>
              </div>
            }
            @case ('email-sent') {
              <div class="text-center py-4">
                <div
                  class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>

                <p class="text-primary font-semibold mb-2">Magic link sent!</p>
                <p class="text-secondary text-sm mb-6">
                  We sent a sign-in link to
                  <span class="font-semibold text-primary">{{ sentToEmail() }}</span
                  >. Click the link in the email to sign in.
                </p>

                <div
                  class="bg-surface-raised border border-theme rounded-xl p-4 mb-6 text-left text-sm text-secondary"
                >
                  <p class="font-semibold text-primary mb-1">Didn't receive it?</p>
                  <ul class="list-disc list-inside space-y-1">
                    <li>Check your spam folder</li>
                    <li>Make sure you entered the correct email</li>
                    <li>
                      <button
                        (click)="goToEmailStep()"
                        class="text-[var(--color-active)] hover:underline font-medium"
                      >
                        Try again
                      </button>
                    </li>
                  </ul>
                </div>

                <button
                  (click)="goToProviders()"
                  class="text-sm text-secondary hover:text-primary transition-colors font-medium"
                >
                  ← Back to all options
                </button>
              </div>
            }
          }
        }
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  step = signal<LoginStep>('providers');
  emailInput = '';
  sentToEmail = signal('');

  async signInWithGoogle() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.authService.signInWithGoogle();
      await this.handlePostLogin(result);
    } catch (err: any) {
      this.handleAuthError(err);
    } finally {
      this.loading.set(false);
    }
  }

  async signInWithGitHub() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.authService.signInWithGitHub();
      await this.handlePostLogin(result);
    } catch (err: any) {
      this.handleAuthError(err);
    } finally {
      this.loading.set(false);
    }
  }

  goToEmailStep() {
    this.error.set(null);
    this.step.set('email-input');
  }

  goToProviders() {
    this.error.set(null);
    this.step.set('providers');
  }

  async sendMagicLink() {
    if (!this.emailInput.trim()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.sendSignInLink(this.emailInput.trim());
      this.sentToEmail.set(this.emailInput.trim());
      this.step.set('email-sent');
    } catch (err: any) {
      console.error('Magic link error:', err);
      this.error.set('Failed to send magic link. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private async handlePostLogin(result: any) {
    if (!result.user.displayName) {
      await this.router.navigate(['/auth/setup-profile']);
    } else {
      await this.router.navigate(['/home']);
    }
  }

  private handleAuthError(err: any) {
    console.error('Login error:', err);
    if (err.code === 'auth/popup-closed-by-user') {
      this.error.set('Sign in was cancelled.');
    } else if (err.code === 'auth/account-exists-with-different-credential') {
      this.error.set('An account already exists with this email using a different sign-in method.');
    } else {
      this.error.set('Sign in failed. Please try again.');
    }
  }
}
