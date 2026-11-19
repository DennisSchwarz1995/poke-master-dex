import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DatasetService } from '../../../core/api/services/dataset.service';
import { GameData } from '../../../shared/models/dataset.model';
import { GameCard } from '../game-card/game-card.component';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';
import { GameDataService } from '../../../core/services/game-data.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { FallbackImageDirective } from '../../../shared/directives/fallback-image/fallback-image.directive';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, GameCard, CdnUrlPipe, IconComponent, FallbackImageDirective],
  template: `
    <div class="flex flex-col bg-bg-secondary p-4 sm:p-6 lg:p-8">
      <div class="max-w-5xl mx-auto w-full space-y-6">
        @if (isLoading()) {
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        } @else if (game(); as game) {
          <div class="flex flex-col gap-6 w-full">
            <div
              class="bg-[var(--color-bg-secondary)] rounded-3xl border border-theme p-6 sm:p-10 shadow-md relative overflow-hidden flex flex-col md:flex-row gap-8"
            >
              <div class="flex-1 flex flex-col z-10 gap-6">
                <div class="flex flex-col gap-6">
                  <h1 class="text-4xl sm:text-4xl font-extrabold tracking-tight mb-2">
                    Pokémon {{ game.name }}
                  </h1>
                  @if (gameIconPath()) {
                    <img
                      [src]="gameIconPath() | cdnUrl: 'games'"
                      class="inline-block w-16 h-16 object-fit z-20 drop-shadow flex-shrink-0 border border-theme rounded-xl"
                      appFallback
                    />
                  }
                </div>

                <div class="space-y-4">
                  <div class="flex items-start gap-4">
                    <div class="flex items-center gap-2">
                      @if (game.codename) {
                        <h3 class="ext-xl uppercase font-bold tracking-wider text-secondary">
                          Codename:
                        </h3>
                        <h3 class="text-xl uppercase font-bold tracking-wider text-primary">
                          {{ game.codename }}
                        </h3>
                      }
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="space-y-1">
                      <h3 class="text-lg uppercase font-bold tracking-wider text-primary">
                        Released on {{ (game.releaseDate | date: 'longDate') || 'TBA' }}
                      </h3>
                    </div>
                  </div>

                  <div class="flex items-center text-xl font-small text-primary">
                    <span>
                      {{ gameDescription() }}
                    </span>
                  </div>
                </div>

                <div class="mt-auto flex flex-wrap gap-8">
                  <div
                    class="flex flex-col items-center gap-4 rounded-xl text-sm font-bold text-secondary"
                  >
                    <span class="flex items-center gap-2">
                      <app-icon name="gameboy"></app-icon>
                      <span class="text-secondary text-lg font-semibold">Platform</span>
                    </span>

                    <span class="flex text-primary text-lg font-semibold justify-center w-full">
                      {{ platform() }}
                    </span>
                  </div>

                  <div
                    class="flex flex-col items-center gap-4 rounded-xl text-sm font-bold text-secondary"
                  >
                    <span class="flex items-center gap-2">
                      <app-icon name="species"></app-icon>
                      <span class="text-secondary text-lg font-semibold">Species</span>
                    </span>

                    <span class="flex text-primary text-lg font-semibold justify-center w-full">
                      {{ dexStats().species }}
                    </span>
                  </div>
                  <div
                    class="flex flex-col items-center gap-4 rounded-xl text-sm font-bold text-secondary"
                  >
                    <span class="flex items-center gap-2">
                      <app-icon name="forms"></app-icon>
                      <span class="text-secondary text-lg font-semibold">Forms</span>
                    </span>

                    <span class="flex text-primary text-lg font-semibold justify-center w-full">
                      {{ dexStats().forms }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="md:w-5/12 flex items-center justify-center flex-col relative min-h-[300px] bg-tertiary rounded-2xl md:bg-transparent"
              >
                <div class="relative w-full h-full">
                  <img
                    [src]="gameIconPath() | cdnUrl: 'gametiles'"
                    [alt]="game.name"
                    class="w-full h-full object-cover rounded-2xl drop-shadow-xl z-10 transition-transform duration-500 hover:scale-105"
                    appFallback
                    draggable="false"
                  />
                </div>
              </div>
            </div>

            @if (relatedGames().length > 0) {
              <div
                class="bg-[var(--color-bg-secondary)] rounded-3xl border border-theme p-6 sm:p-10 shadow-md"
              >
                <h2 class="text-xl font-bold text-text-primary pb-2">Other games in this series</h2>
                <p class="text-sm text-text-secondary mb-6">Counterparts and related releases.</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  @for (rel of relatedGames(); track rel.id) {
                    <app-game-card [game]="rel"></app-game-card>
                  }
                </div>
              </div>
            }

            @if (dlcs().length > 0) {
              <div
                class="bg-[var(--color-bg-secondary)] rounded-3xl border border-theme p-6 sm:p-10 shadow-md"
              >
                <h2 class="text-xl font-bold text-text-primary pb-2">DLCs</h2>
                <p class="text-sm text-text-secondary mb-6">
                  Free and paid downloadable expansions.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  @for (dlc of dlcs(); track dlc.id) {
                    <app-game-card [game]="dlc"></app-game-card>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-12 text-secondary bg-surface rounded-3xl border border-theme">
            <p class="text-xl mb-4">Game details could not be found.</p>
            <a
              routerLink="/games"
              class="px-5 py-2.5 bg-blue-500/10 text-blue-500 hover:text-blue-400 rounded-xl font-bold transition-all hover:bg-blue-500/20"
              >Go back to games list</a
            >
          </div>
        }

        <nav class="flex items-center justify-center gap-4">
          <a
            routerLink="/games"
            class="flex items-center gap-2 text-secondary hover:text-primary transition-all font-semibold bg-surface-hover hover:bg-theme px-3 py-1.5 rounded-xl border border-theme hover:shadow-sm"
          >
            <app-icon name="previous" size="1.25em"></app-icon>
            <span class="hidden sm:inline">Back to Games</span>
          </a>
        </nav>
      </div>
    </div>
  `,
})
export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private datasetService = inject(DatasetService);
  private gameDataService = inject(GameDataService);

  game = signal<GameData | undefined>(undefined);
  allGames = signal<GameData[]>([]);
  isLoading = signal<boolean>(true);
  dexStats = signal<{ species: number; forms: number }>({ species: 0, forms: 0 });

  relatedGames = computed(() => {
    const list = this.allGames();
    const current = this.game();
    if (!current) return [];

    return list.filter(
      (game) =>
        game.id !== current.id &&
        game.type !== 'dlc' &&
        ((game.gameSet &&
          (game.gameSet === current.gameSet || game.gameSet === current.gameSuperSet)) ||
          (game.gameSuperSet &&
            (game.gameSuperSet === current.gameSuperSet ||
              game.gameSuperSet === current.gameSet)) ||
          (!current.gameSet &&
            !current.gameSuperSet &&
            game.series === current.series &&
            current.series !== 'spinoff' &&
            game.gen === current.gen &&
            game.type === current.type)),
    );
  });

  dlcs = computed(() => {
    const list = this.allGames();
    const current = this.game();
    if (!current) return [];

    return list.filter(
      (game) =>
        game.type === 'dlc' &&
        ((game.gameSet &&
          (game.gameSet === current.gameSet || game.gameSet === current.gameSuperSet)) ||
          (game.gameSuperSet &&
            (game.gameSuperSet === current.gameSuperSet || game.gameSuperSet === current.gameSet))),
    );
  });

  platform = computed(() => {
    const platformsMap: Record<string, string> = {
      gb: 'Game Boy',
      gbc: 'Game Boy Color',
      gba: 'Game Boy Advance',
      nds: 'DS',
      '3ds': '3DS',
      switch: 'Switch',
      switch2: 'Switch 2',
      ngc: 'GameCube',
      wii: 'Wii',
      mobile: 'Mobile',
    };

    return this.game()?.platforms
      ? this.game()!.platforms.map((platform) => platformsMap[platform] || platform)[0]
      : '';
  });

  gameIconPath = computed(() => {
    const game = this.game();
    if (!game) return '';
    return this.gameDataService.getGameIconPath(game.id);
  });

  gameDescription = computed(() => {
    const current = this.game();
    if (!current) return '';

    const gameId = current.nameSlug?.toLowerCase() || current.id?.toLowerCase();

    const customDesc = this.gameDataService.getGameCustomDescription(gameId || '');
    if (customDesc) {
      return customDesc;
    }

    const capitalize = (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');

    const genText = current.gen > 0 ? ` from Generation ${current.gen}` : '';
    const regionText =
      current.region && current.region !== 'unknown'
        ? ` which takes place in the ${capitalize(current.region)} region`
        : '';

    return `Pokémon ${current.name} is a Game${genText}${regionText}. It is part of the ${capitalize(current.series)} series.`;
  });

  ngOnInit() {
    this.datasetService.loadGames().subscribe({
      next: (games) => {
        this.allGames.set(games);
        this.route.paramMap.subscribe((params) => {
          const gameId = params.get('id');
          if (gameId) {
            const foundGame = games.find((g) => g.nameSlug === gameId);

            if (foundGame && foundGame.type === 'dlc') {
              this.router.navigate(['/games']);
              return;
            }

            this.game.set(foundGame);

            if (foundGame && foundGame.pokedexes && foundGame.pokedexes.length > 0) {
              this.datasetService.getPokedexesStats(foundGame.pokedexes).subscribe((stats) => {
                this.dexStats.set(stats);
              });
            } else {
              this.dexStats.set({ species: 0, forms: 0 });
            }
          }
          this.isLoading.set(false);
          window.scrollTo(0, 0);
        });
      },
      error: (err) => {
        console.error('Failed to load games', err);
        this.isLoading.set(false);
      },
    });
  }
}
