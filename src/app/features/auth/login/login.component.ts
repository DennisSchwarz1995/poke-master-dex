import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">
            ⚡ Poke-Master-Dex
          </h1>
          <p class="text-gray-600">
            Verwalte deine Pokémon-Sammlung wie ein Champion
          </p>
        </div>
        
        @if (loading()) {
          <div class="text-center py-8">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p class="mt-4 text-gray-600">Anmeldung läuft...</p>
          </div>
        } @else {
          @if (error()) {
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6" role="alert">
              <p class="font-bold">Fehler</p>
              <p class="text-sm">{{ error() }}</p>
            </div>
          }
          
          <button
            (click)="signInWithGoogle()"
            class="w-full bg-white border-2 border-gray-300 rounded-lg py-4 px-6 
                   flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-blue-400
                   transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg
                   group"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              Mit Google anmelden
            </span>
          </button>
          
          <div class="mt-6 text-center text-sm text-gray-500">
            <p>Deine Daten werden sicher mit Firebase gespeichert</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loading = signal(false);
  error = signal<string | null>(null);
  
  async signInWithGoogle() {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      await this.authService.signInWithGoogle();
      await this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error('Login error:', err);
      this.error.set(
        err.code === 'auth/popup-closed-by-user' 
          ? 'Login abgebrochen' 
          : 'Login fehlgeschlagen. Bitte versuche es erneut.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
