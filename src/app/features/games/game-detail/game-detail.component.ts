import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { GameData } from '../../../shared/models/dataset.model';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="h-full flex flex-col bg-bg-secondary px-4 pb-8 sm:px-6 lg:px-8">
      <div class="max-w-[1600px] mx-auto w-full">
        <div class="z-40 bg-bg-secondary/95 pt-6 space-y-4 mb-8">
          <div class="mt-8 mb-6 animation-fade-in max-w-3xl mx-auto w-full text-center relative">
            <a
              routerLink="/games"
              class="absolute left-0 top-1 text-secondary hover:text-primary transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              Back
            </a>
            <h1 class="text-4xl font-extrabold text-primary mb-3">
              @if (isLoading()) {
                Loading...
              } @else if (game()) {
                {{ game()?.name }}
              } @else {
                Game Not Found
              }
            </h1>
            <p class="text-secondary leading-relaxed max-w-2xl mx-auto">
              @if (game()) {
                Generation {{ game()?.gen }} • Region:
                <span class="capitalize">{{ game()?.region }}</span>
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private datasetService = inject(DatasetService);

  game = signal<GameData | undefined>(undefined);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const gameId = params.get('id');
      if (gameId) {
        this.datasetService.loadGames().subscribe({
          next: (games) => {
            const foundGame = games.find((g) => g.nameSlug === gameId);
            this.game.set(foundGame);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load games', err);
            this.isLoading.set(false);
          },
        });
      } else {
        this.isLoading.set(false);
      }
    });
  }
}
