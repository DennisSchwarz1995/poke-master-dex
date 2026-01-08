import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800">⚡ Poke-Master-Dex</h1>
            
            @if (user(); as currentUser) {
              <div class="flex items-center gap-4">
                <span class="text-gray-600">{{ currentUser.displayName }}</span>
                @if (currentUser.photoURL) {
                  <img 
                    [src]="currentUser.photoURL" 
                    [alt]="currentUser.displayName || 'User'"
                    (click)="goToProfile()"
                    class="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                  />
                }
                <button
                  (click)="goToProfile()"
                  class="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Profil
                </button>
              </div>
            }
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-xl shadow-lg p-8 text-center">
          <div class="text-6xl mb-4">📦</div>
          <h2 class="text-3xl font-bold text-gray-800 mb-4">
            Willkommen im Dashboard!
          </h2>
          <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
            Hier wird später deine Pokémon-Box-Ansicht erscheinen. 
            Du kannst dann deine gesamte Sammlung von bis zu 6000 Pokémon 
            (200 Boxen × 30 pro Box) verwalten.
          </p>
          
          @if (user(); as currentUser) {
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 max-w-2xl mx-auto">
              <p class="text-blue-800">
                <strong>Angemeldet als:</strong> {{ currentUser.email }}
              </p>
            </div>
          }
          
          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div class="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
              <div class="text-4xl mb-2">🔴</div>
              <h3 class="font-bold text-gray-800 mb-2">Living Dex</h3>
              <p class="text-sm text-gray-600">Ein Pokémon jeder Art</p>
              <p class="text-2xl font-bold text-red-600 mt-2">0 / 1025</p>
            </div>
            
            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
              <div class="text-4xl mb-2">✨</div>
              <h3 class="font-bold text-gray-800 mb-2">Shiny Dex</h3>
              <p class="text-sm text-gray-600">Schillernde Sammlung</p>
              <p class="text-2xl font-bold text-yellow-600 mt-2">0 / 1025</p>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div class="text-4xl mb-2">🏆</div>
              <h3 class="font-bold text-gray-800 mb-2">Origin Dex</h3>
              <p class="text-sm text-gray-600">Original-Trainer</p>
              <p class="text-2xl font-bold text-blue-600 mt-2">0 / 1025</p>
            </div>
          </div>
          
          <div class="mt-8">
            <p class="text-gray-500 text-sm">
              🚧 Features werden in den nächsten Schritten implementiert 🚧
            </p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  user = this.authService.user;
  
  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
