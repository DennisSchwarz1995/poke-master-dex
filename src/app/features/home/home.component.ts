import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonMarqueeComponent } from './components/pokemon-marquee/pokemon-marquee.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CdnUrlPipe } from '../../shared/pipes/cdnUrl.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, PokemonMarqueeComponent, IconComponent, CdnUrlPipe],
  template: `
    <section
      class="min-h-[calc(100vh-4rem)] flex items-center justify-center pt-12 overflow-hidden bg-secondary w-full"
    >
      <div class="flex flex-col gap-4 relative w-full text-center">
        <img src="assets/images/logo.png" alt="logo" class="w-48 h-48 mx-auto" />
        <h1
          class="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black leading-[1.1] tracking-tight text-primary mb-6 max-w-[1000px] mx-auto"
        >
          Track, Collect & Complete Your Pokédex
        </h1>

        <p
          class="text-base sm:text-lg md:text-xl text-secondary leading-relaxed max-w-[600px] mx-auto mb-6"
        >
          The ultimate tool for Pokémon collectors. Manage your Living Dex, track shiny hunts,
          explore every generation — all in one beautifully crafted app.
        </p>

        <section
          class="relative w-full overflow-hidden flex flex-col gap-3 sm:gap-4 mb-10 max-w-[1920px] mx-auto"
        >
          <div class="flex w-max gap-8">
            <app-pokemon-marquee></app-pokemon-marquee>
          </div>
        </section>

        <div class="flex items-center justify-center gap-4 flex-wrap mb-12">
          <a routerLink="/pokedex" class="btn btn-primary">
            Start collecting now <app-icon name="pokeball" size="1em"></app-icon
          ></a>

          <a routerLink="/pokemon" class="btn btn-secondary">
            Explore Pokémon
            <app-icon name="next" size="1em"></app-icon>
          </a>
        </div>

        <div
          class="flex items-center justify-center gap-4 sm:gap-8 py-6 px-6 sm:px-10 bg-surface border border-theme rounded-[20px] shadow-md w-fit mx-auto"
        >
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl font-extrabold text-primary tracking-tight">1025+</span>
            <span class="text-xs font-medium text-secondary uppercase tracking-wider">Pokémon</span>
          </div>
          <div class="w-px h-8 border-r border-theme"></div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl font-extrabold text-primary tracking-tight">9</span>
            <span class="text-xs font-medium text-secondary uppercase tracking-wider"
              >Generations</span
            >
          </div>
          <div class="w-px h-8 border-r border-theme"></div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl font-extrabold text-primary tracking-tight">120+</span>
            <span class="text-xs font-medium text-secondary uppercase tracking-wider">Games</span>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 max-w-[1200px] mx-auto">
      <div class="text-center mb-20">
        <h2 class="text-3xl md:text-5xl font-extrabold text-primary tracking-tight mb-4">
          Everything you need to catch 'em all
        </h2>
        <p class="text-lg text-secondary max-w-[560px] mx-auto leading-relaxed">
          Built by collectors, for collectors. Every feature is designed to make your Pokémon
          journey seamless and enjoyable.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-10 md:gap-16 items-center mb-24">
        <div class="order-2 md:order-1">
          <h3 class="text-2xl font-extrabold text-primary mb-3 tracking-tight">
            Complete Pokémon Database
          </h3>
          <p class="text-base text-secondary leading-relaxed mb-6">
            Browse through every Pokémon ever created. View detailed stats, abilities, type
            matchups, spawn locations, and game availability — all in a beautifully designed
            interface.
          </p>
          <ul class="flex flex-col gap-2.5">
            <li class="flex items-center gap-2.5 text-[0.95rem] font-medium text-primary">
              <app-icon name="stat-chart" size="1em"></app-icon>
              Base stats, abilities type charts
            </li>
            <li class="flex items-center gap-2.5 text-[0.95rem] font-medium text-primary">
              <app-icon name="filter" size="1em"></app-icon>
              Filter by generation, type more
            </li>
            <li class="flex items-center gap-2.5 text-[0.95rem] font-medium text-primary">
              <app-icon name="gamepad" size="1em"></app-icon>
              Game availability per Pokémon
            </li>
          </ul>
        </div>

        <div class="order-1 md:order-2 relative">
          <div
            class="bg-surface border border-theme rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500"
          >
            <div class="flex gap-1.5 py-3 px-4 bg-surface-raised border-b border-theme">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            </div>
            <div class="p-5 min-h-[280px]">
              <div
                class="flex items-center gap-2 py-2.5 px-3.5 rounded-xl bg-secondary border border-theme text-tertiary text-sm mb-4"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>Search Pokémon...</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                @for (pokemon of mockPokemonList; track pokemon.name) {
                  <div
                    class="bg-secondary border border-theme rounded-xl py-3 px-2 text-center hover:-translate-y-0.5 hover:shadow-md transition-all border-t-[3px]"
                    [style.borderTopColor]="pokemon.color"
                  >
                    <div class="text-3xl mb-1 leading-none">{{ pokemon.emoji }}</div>
                    <div class="text-[0.75rem] font-bold text-primary mb-0.5">
                      {{ pokemon.name }}
                    </div>
                    <div class="text-[0.65rem] text-tertiary font-medium">#{{ pokemon.id }}</div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-10 md:gap-16 items-center mb-24">
        <div class="order-2 md:order-2">
          <h3 class="text-2xl font-extrabold text-primary mb-3 tracking-tight">
            Living Dex Tracker
          </h3>
          <p class="text-base text-secondary leading-relaxed mb-6">
            Create and manage your personal Living Dex collections. Track which Pokémon you've
            caught, organize them in PC-style boxes, and watch your completion rate grow.
          </p>
          <ul class="flex flex-col gap-2.5">
            <li class="flex items-center gap-2.5 text-[0.95rem] font-medium text-primary">
              <app-icon name="box-list" size="1em"></app-icon>
              PC box-style organization
            </li>
            <li class="flex items-center gap-2.5 text-[0.95rem] font-medium text-primary">
              <img class="w-4 h-4" [src]="'shiny.png' | cdnUrl: 'special_attributes'" alt="shiny" />
              Track normal shiny Pokémon
            </li>
            <li class="flex items-center gap-2.5 text-[0.95rem] font-medium text-primary">
              <app-icon name="progress" size="1em"></app-icon>
              Visual progress tracking
            </li>
          </ul>
        </div>

        <div class="order-1 md:order-1 relative">
          <div
            class="bg-surface border border-theme rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500"
          >
            <div class="flex gap-1.5 py-3 px-4 bg-surface-raised border-b border-theme">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            </div>
            <div class="p-5 min-h-[280px]">
              <div class="mb-4">
                <div class="text-[0.95rem] font-bold text-primary mb-2">Living Dex — Gen 1</div>
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-[1500ms]"
                      style="width: 72%"
                    ></div>
                  </div>
                  <span class="text-sm font-semibold text-green-500 whitespace-nowrap"
                    >109 / 151</span
                  >
                </div>
              </div>
              <div>
                <div class="text-sm font-semibold text-secondary mb-2">Box 1</div>
                <div class="grid grid-cols-5 md:grid-cols-6 gap-1.5">
                  @for (slot of mockBoxSlots; track $index) {
                    <div
                      class="aspect-square rounded-lg flex items-center justify-center text-lg transition-all"
                      [class]="
                        slot.caught
                          ? slot.shiny
                            ? 'bg-amber-500/10 border border-solid border-amber-500/30 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)]'
                            : 'bg-green-500/10 border border-solid border-green-500/30'
                          : 'bg-secondary border border-dashed border-theme'
                      "
                    >
                      @if (slot.caught) {
                        <span>{{ slot.emoji }}</span>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-10 md:gap-16 items-center mb-24">
        <div class="order-2 md:order-1">
          <h3 class="text-2xl font-extrabold text-primary mb-3 tracking-tight">
            Game Library Dex Management
          </h3>
          <p class="text-base text-secondary leading-relaxed mb-6">
            Every mainline game at your fingertips. Create dedicated Pokédex collections per game,
            track regional dex completion, and manage multiple trainers with ease.
          </p>
          <ul class="flex flex-col gap-2.5">
            <li class="flex items-center gap-2.5 text-[0.95rem] font-medium text-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-green-500 shrink-0"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              All mainline Pokémon games
            </li>
            <li class="flex items-center gap-2.5 text-[0.95rem] font-medium text-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-green-500 shrink-0"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Per-game regional dex tracking
            </li>
            <li class="flex items-center gap-2.5 text-[0.95rem] font-medium text-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-green-500 shrink-0"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Multi-trainer management
            </li>
          </ul>
        </div>

        <div class="order-1 md:order-2 relative">
          <div
            class="bg-surface border border-theme rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500"
          >
            <div class="flex gap-1.5 py-3 px-4 bg-surface-raised border-b border-theme">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            </div>
            <div class="p-5 min-h-[280px]">
              <div class="flex flex-col gap-2.5">
                @for (game of mockGames; track game.name) {
                  <div
                    class="flex items-center gap-3.5 py-3.5 px-4 rounded-xl bg-secondary border border-theme border-l-4 hover:translate-x-1 transition-all"
                    [style.borderLeftColor]="game.color"
                  >
                    <div
                      class="text-2xl w-10 h-10 flex items-center justify-center rounded-lg"
                      [style.backgroundColor]="game.color + '1f'"
                    >
                      {{ game.emoji }}
                    </div>
                    <div class="flex flex-col">
                      <div class="text-sm font-bold text-primary">{{ game.name }}</div>
                      <div class="text-[0.75rem] text-tertiary font-medium">{{ game.gen }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 px-6 text-center">
      <div
        class="max-w-[600px] mx-auto py-16 px-6 sm:px-12 bg-surface border border-theme rounded-3xl relative overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
        ></div>

        <h2 class="text-2xl md:text-3xl font-extrabold text-primary mb-4 tracking-tight">
          Ready to complete your Pokédex?
        </h2>
        <p class="text-base text-secondary leading-relaxed mb-8">
          Join thousands of trainers already tracking their collections. It's free, fast, and
          beautifully designed.
        </p>
        <a
          routerLink="/pokedex"
          class="inline-flex items-center gap-2.5 py-4 px-10 rounded-2xl text-lg font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_4px_14px_rgba(59,130,246,0.35)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 transition-all duration-300"
        >
          Start collecting now
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M3 12a9 9 0 1 1 18 0a9 9 0 0 1-18 0m2.07 1a7.002 7.002 0 0 0 13.86 0h-4.1a3.001 3.001 0 0 1-5.66 0zm13.86-2a7.001 7.001 0 0 0-13.86 0h4.1a3.001 3.001 0 0 1 5.66 0zM12 13a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </section>
  `,
  styles: [],
})
export class HomeComponent {
  mockPokemonList = [
    { name: 'Bulbasaur', id: '001', emoji: '🌿', color: '#78C850' },
    { name: 'Charmander', id: '004', emoji: '🔥', color: '#F08030' },
    { name: 'Squirtle', id: '007', emoji: '💧', color: '#6890F0' },
    { name: 'Pikachu', id: '025', emoji: '⚡', color: '#F8D030' },
    { name: 'Eevee', id: '133', emoji: '🦊', color: '#A8A878' },
    { name: 'Gengar', id: '094', emoji: '👻', color: '#705898' },
    { name: 'Dragonite', id: '149', emoji: '🐉', color: '#7038F8' },
    { name: 'Snorlax', id: '143', emoji: '😴', color: '#A8A878' },
  ];

  mockBoxSlots = [
    { caught: true, shiny: false, emoji: '🌿' },
    { caught: true, shiny: false, emoji: '🌸' },
    { caught: true, shiny: true, emoji: '🔥' },
    { caught: true, shiny: false, emoji: '🐢' },
    { caught: true, shiny: false, emoji: '💧' },
    { caught: false, shiny: false, emoji: '' },
    { caught: true, shiny: false, emoji: '🐛' },
    { caught: true, shiny: false, emoji: '🦋' },
    { caught: false, shiny: false, emoji: '' },
    { caught: true, shiny: true, emoji: '⚡' },
    { caught: true, shiny: false, emoji: '🐭' },
    { caught: true, shiny: false, emoji: '🦊' },
    { caught: false, shiny: false, emoji: '' },
    { caught: true, shiny: false, emoji: '🐍' },
    { caught: true, shiny: false, emoji: '👻' },
    { caught: false, shiny: false, emoji: '' },
    { caught: true, shiny: false, emoji: '🐉' },
    { caught: true, shiny: true, emoji: '🌟' },
  ];

  mockGames = [
    { name: 'Pokémon Scarlet', gen: 'Generation IX', emoji: '🟥', color: '#dc2626' },
    { name: 'Pokémon Violet', gen: 'Generation IX', emoji: '🟪', color: '#7c3aed' },
    { name: 'Legends: Arceus', gen: 'Generation VIII', emoji: '⭐', color: '#eab308' },
    { name: 'Sword & Shield', gen: 'Generation VIII', emoji: '⚔️', color: '#2563eb' },
    { name: 'Brilliant Diamond', gen: 'Generation IV (Remake)', emoji: '💎', color: '#06b6d4' },
  ];
}
