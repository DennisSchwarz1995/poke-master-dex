import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatasetService, DatasetPokemon } from '../../../core/api/services/dataset.service';
import { PokemonDetailHeaderComponent } from './components/pokemon-detail-header.component';
import { PokemonDetailInfoComponent } from './components/pokemon-detail-info.component';
import { PokemonDetailFormsComponent } from './components/pokemon-detail-forms.component';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PokemonDetailHeaderComponent,
    PokemonDetailInfoComponent,
    PokemonDetailFormsComponent,
  ],
  template: `
    <div class="flex flex-col bg-bg-secondary min-h-screen p-4 sm:p-6 lg:p-8">
      <div class="max-w-5xl mx-auto w-full space-y-6">
        @if (isLoading()) {
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        } @else if (pokemon(); as pkmn) {
          <div class="flex flex-col gap-6 w-full">
            <app-pokemon-detail-header [pokemon]="pkmn"></app-pokemon-detail-header>
            <app-pokemon-detail-info [pokemon]="pkmn"></app-pokemon-detail-info>
            <app-pokemon-detail-forms [pokemon]="pkmn"></app-pokemon-detail-forms>
          </div>
        } @else {
          <div class="text-center py-12 text-secondary bg-surface rounded-3xl border border-theme">
            <p class="text-xl">Pokémon details could not be found.</p>
          </div>
        }

        <nav class="flex items-center justify-center gap-4">
          <a
            routerLink="/pokemon"
            class="flex items-center gap-2 text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme px-3 py-1.5 rounded-xl border border-theme hover:shadow-sm"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span class="hidden sm:inline">Back to Pokémon</span>
          </a>
        </nav>
      </div>
    </div>
  `,
})
export class PokemonDetailComponent implements OnInit {
  private datasetService = inject(DatasetService);
  private route = inject(ActivatedRoute);

  pokemon = signal<DatasetPokemon | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.datasetService.loadPokemonBySlug(slug).subscribe({
          next: (data) => {
            this.pokemon.set(data);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load pokemon details', err);
            this.isLoading.set(false);
          },
        });
      } else {
        this.isLoading.set(false);
      }
    });
  }
}
