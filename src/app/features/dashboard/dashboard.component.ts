import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/auth/services/auth.service';
import { PokeapiService } from '../../core/api/services/pokeapi.service';
import { PokemonCardComponent } from '../../shared/components/pokemon-card/pokemon-card.component';
import { Pokemon } from '../../shared/models/pokemon.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800">Poke-Master-Dex</h1>
            
            @if (user(); as currentUser) {
              <div class="flex items-center gap-4">
                <span class="text-gray-600 hidden md:inline">{{ currentUser.displayName }}</span>
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
                  class="text-blue-500 hover:text-blue-700 font-medium text-sm"
                >
                  Profile
                </button>
              </div>
            }
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-8">
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Pokemon Collection Demo</h2>
          <p class="text-gray-600">Showcasing PokeAPI integration with first 12 Pokemon</p>
        </div>
        
        @if (loading()) {
          <div class="text-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p class="mt-4 text-gray-600">Loading Pokemon from PokeAPI...</p>
          </div>
        } @else if (error()) {
          <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p class="font-bold">Error</p>
            <p>{{ error() }}</p>
            <button 
              (click)="loadPokemon()"
              class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            @for (pokemon of pokemonList(); track pokemon.id) {
              <app-pokemon-card 
                [pokemon]="pokemon"
                (clicked)="onPokemonClick($event)"
              />
            }
          </div>
          
          <div class="mt-8 text-center text-gray-500 text-sm">
            <p>Showing 12 of 1025 Pokemon available via PokeAPI</p>
            <p class="mt-1">Full Box View implementation coming next</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private pokeapiService = inject(PokeapiService);
  private router = inject(Router);
  
  user = this.authService.user;
  pokemonList = signal<Pokemon[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  ngOnInit() {
    this.loadPokemon();
  }
  
  loadPokemon() {
    this.loading.set(true);
    this.error.set(null);
    
    this.pokeapiService.getPokemonList(12)
      .pipe(
        switchMap(list => {
          const requests = list.map(item => 
            this.pokeapiService.getPokemonById(item.id)
          );
          return forkJoin(requests);
        })
      )
      .subscribe({
        next: (pokemon) => {
          this.pokemonList.set(pokemon);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load Pokemon:', err);
          this.error.set('Failed to load Pokemon from PokeAPI. Please check your internet connection.');
          this.loading.set(false);
        }
      });
  }
  
  onPokemonClick(pokemon: Pokemon) {
    console.log('Clicked Pokemon:', pokemon.name, pokemon);
  }
  
  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
