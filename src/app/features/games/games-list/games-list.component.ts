import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { GameData } from '../../../shared/models/dataset.model';
import { GameCard } from '../game-card/game-card.component';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule, GameCard],
  template: `
    <div class="h-full flex flex-col bg-bg-secondary px-4 pb-8 sm:px-6 lg:px-8">
      <div class="max-w-[1600px] mx-auto w-full">
        <div class="z-40 bg-bg-secondary/95 pt-6 space-y-4 mb-8">
          @if (isLoadingList()) {
            <div class="flex justify-center items-center h-64">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          } @else {
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8 pb-8"
            >
              @for (game of sortedGames(); track game.id) {
                <app-game-card [game]="game"></app-game-card>
              }
            </div>

            @if (sortedGames().length === 0) {
              <div class="text-center py-20 text-secondary">
                <p class="text-xl font-medium">No games found matching your filter.</p>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class GamesList implements OnInit {
  datasetService = inject(DatasetService);

  isLoadingList = signal<boolean>(true);
  allGames = signal<GameData[]>([]);
  selectedGame = signal<string>('');

  sortedGames = computed(() => {
    return this.allGames()
      .filter((games) => games.type === 'game')
      .sort((gameA, gameB) => {
        return (gameB.releaseDate || '').localeCompare(gameA.releaseDate || '');
      });
  });

  ngOnInit() {
    this.datasetService.loadGames().subscribe({
      next: (list: GameData[]) => {
        this.allGames.set(list);
        this.isLoadingList.set(false);
      },
      error: (err) => {
        console.error('Failed to load games', err);
        this.isLoadingList.set(false);
      },
    });
  }
}
