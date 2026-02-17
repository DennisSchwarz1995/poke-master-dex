import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      @if (user(); as currentUser) {
        <div class="bg-surface rounded-xl shadow-lg p-8 border border-theme">
          <h2 class="text-2xl font-bold mb-6 text-primary">Profile</h2>
          
          <div class="flex items-center gap-6 mb-8">
            @if (currentUser.photoURL) {
              <img 
                [src]="currentUser.photoURL" 
                [alt]="currentUser.displayName || 'User'" 
                class="w-24 h-24 rounded-full border-4 border-blue-200 shadow-md"
              />
            } @else {
              <div class="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                {{ getInitials(currentUser.displayName) }}
              </div>
            }
            
            <div>
              <h3 class="text-3xl font-bold text-primary">{{ currentUser.displayName }}</h3>
              <p class="text-secondary mt-1">{{ currentUser.email }}</p>
              @if (currentUser.emailVerified) {
                <span class="inline-block mt-2 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                  ✓ Verified
                </span>
              }
            </div>
          </div>
          
          <div class="border-t border-theme pt-6 mb-6">
            <h4 class="font-semibold text-primary mb-3">Account Information</h4>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-secondary">User ID</dt>
                <dd class="font-mono text-sm text-primary break-all">{{ currentUser.uid }}</dd>
              </div>
            </dl>
          </div>
          
          <div class="border-t border-theme pt-6 mb-6">
            <h4 class="font-semibold text-primary mb-3">Settings</h4>
            <div class="flex items-center justify-between py-3">
              <div>
                <p class="font-medium text-primary">Theme</p>
                <p class="text-sm text-secondary">Switch between light and dark mode</p>
              </div>
              <app-theme-toggle />
            </div>
          </div>
          
          <div class="mt-8 flex gap-4">
            <button
              (click)="goToDashboard()"
              class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Go to Dashboard
            </button>
            <button
              (click)="signOut()"
              class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  user = this.authService.user;
  
  getInitials(name: string | null): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  async signOut() {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }
  
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
