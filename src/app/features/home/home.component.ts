import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-bg-secondary via-surface to-primary-light/10"
    >
      <div
        class="max-w-3xl w-full text-center space-y-8 p-12 bg-surface/60 backdrop-blur-xl border border-theme rounded-3xl shadow-xl shadow-primary/5"
      >
        <img src="assets/images/logo.png" alt="" class="w-full h-full object-contain" />

        <div class="space-y-4">
          <h1
            class="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-500 pb-2"
          >
            Welcome to Poke Master Dex
          </h1>
          <p
            class="text-xl md:text-2xl text-secondary font-medium max-w-2xl mx-auto leading-relaxed"
          >
            The ultimate companion tool for managing your Pokémon collections and exploring the
            entire national dex.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6 pt-8">
          <a
            routerLink="/pokemon"
            class="group relative flex flex-col items-center p-8 bg-surface rounded-2xl border-2 border-theme hover:border-primary/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            <div
              class="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
            >
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold mb-2">Pokémons</h2>
            <p class="text-secondary text-center text-sm">
              Explore the complete database. View detailed information including base stats,
              abilities, spawn regions, and game availability.
            </p>
          </a>

          <a
            routerLink="/pokedex"
            class="group relative flex flex-col items-center p-8 bg-surface rounded-2xl border-2 border-theme hover:border-green-500/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            <div
              class="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
            >
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold mb-2">Your Pokédex</h2>
            <p class="text-secondary text-center text-sm">
              Manage your personal collections. Create Living Dexes, Form Dexes, and track your
              shiny hunting progress across all games.
            </p>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {}
