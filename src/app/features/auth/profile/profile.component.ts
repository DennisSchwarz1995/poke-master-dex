import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      @if (user(); as currentUser) {
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Profil</h2>
          
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
              <h3 class="text-3xl font-bold text-gray-800">{{ currentUser.displayName }}</h3>
              <p class="text-gray-600 mt-1">{{ currentUser.email }}</p>
              @if (currentUser.emailVerified) {
                <span class="inline-block mt-2 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                  ✓ Verifiziert
                </span>
              }
            </div>
          </div>
          
          <div class="border-t pt-6">
            <h4 class="font-semibold text-gray-700 mb-3">Account-Informationen</h4>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-500">User ID</dt>
                <dd class="font-mono text-sm text-gray-800 break-all">{{ currentUser.uid }}</dd>
              </div>
            </dl>
          </div>
          
          <div class="mt-8 flex gap-4">
            <button
              (click)="goToDashboard()"
              class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Zum Dashboard
            </button>
            <button
              (click)="signOut()"
              class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              Abmelden
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
