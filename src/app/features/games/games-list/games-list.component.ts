import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { GameData } from '../../../shared/models/dataset.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
                <a
                  [routerLink]="['/games', game.nameSlug]"
                  class="bg-surface rounded-2xl border border-theme p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-[var(--color-primary-hover)] group flex flex-col h-full gap-4 cursor-pointer overflow-hidden relative"
                >
                  <div class="relative z-10 flex flex-col h-full">
                    <div class="w-full flex items-center justify-center">
                      <img
                        [src]="getGameImage(game)"
                        [alt]="game.name"
                        class="rounded-2xl w-full h-full object-cover select-none pointer-events-none"
                        (error)="onImageError($event)"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 items-center">
                    <h3 class="text-xl font-bold text-primary">
                      {{ game.name }}
                    </h3>

                    <div class="flex items-center text-md font-semibold text-secondary">
                      <span>{{ game.releaseDate | date: 'y' }}</span>
                    </div>
                  </div>
                </a>
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

  getGameImage(game: GameData): string {
    const specialCases: Record<string, string> = {
      'legends-za': 'legends_z-a',
      'letsgo-eevee': "let's_go_eevee",
      'letsgo-pikachu': "let's_go_pikachu",
      'omega-ruby': 'omega_ruby',
      'alpha-sapphire': 'alpha_sapphire',
      heartgold: 'heartgold',
      soulsilver: 'soulsilver',
      'brilliant-diamond': 'brilliant_diamond',
      'shining-pearl': 'shining_pearl',
      'ultra-sun': 'ultra_sun',
      'ultra-moon': 'ultra_moon',
      black2: 'black2',
      white2: 'white2',
      'legends-arceus': 'legends_arceus',
      'legends-za-megadimension': 'mega_dimension',
    };

    const slug = specialCases[game.nameSlug] || game.nameSlug.replace(/-/g, '_');
    return `assets/images/gametiles/${slug}.webp`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
