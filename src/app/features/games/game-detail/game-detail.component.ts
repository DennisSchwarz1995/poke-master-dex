import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DatasetService, SimplePokemon } from '../../../core/api/services/dataset.service';
import { GameData } from '../../../shared/models/dataset.model';
import { GameCard } from '../game-card/game-card.component';
import { CapitalizePipe } from '../../../shared/pipes/capitalize-pipe';
import { CdnUrlPipe } from "../../../shared/pipes/cdnUrl-pipe";

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, GameCard, CapitalizePipe, CdnUrlPipe],
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
                  @if (getGameIconUrl(game.id)) {
                    <img
                      [src]="getGameIconUrl(game.id) | cdnUrl: 'games'"
                      class="inline-block w-16 h-16 object-fit z-20 drop-shadow flex-shrink-0 border border-theme rounded-xl"
                      (error)="onImageError($event)"
                    />
                  }
                </div>

                <div class="space-y-4">
                  <div class="flex items-start gap-4">
                    <div class="flex items-center gap-2">
                      @if (game.codename) {
                        <h3 class="ext-xl uppercase font-bold tracking-wider text-tertiary">
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
                    <span
                      >Pokémon {{ game.name }} is a Game from Generation {{ game.gen }} which takes
                      place in the {{ game.region | capitalize }} region. It is part of the
                      {{ game.series | capitalize }} series.</span
                    >
                  </div>
                </div>

                <div class="mt-auto flex flex-wrap gap-8">
                  <div
                    class="flex flex-col items-center gap-4 rounded-xl text-sm font-bold text-secondary"
                  >
                    <span class="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h11c2.76 0 5-2.24 5-5V4c0-1.1-.9-2-2-2m-7 16h-2v2H8v-2H6v-2h2v-2h2v2h2zm3 1c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1m2-2c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1m1-5H6V5h12z"
                        />
                      </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g fill="none" stroke="currentColor" stroke-width="1.5">
                          <circle cx="11.5" cy="11.5" r="9.5" />
                          <path
                            stroke-linecap="round"
                            d="M11.5 15.5a3 3 0 0 1-3-3v-2m3 5a3 3 0 0 0 3-3v-2m-3 5v-5m3 0a3 3 0 1 0-6 0m6 0h-6m6.072 1H16m-9 0h1.5m6 2.5l1 .5m-7-.5l-1 .5m7-5.5l1-.5m-7 .5l-1-.5m11 10L22 22"
                          />
                        </g>
                      </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                        >
                          <path
                            d="M17 3v1q-.015 5.028-5.008 8.014c-3.328 1.99 3.336-2 .008-.014c-3.328 1.99-5 4.662-5.008 8.014v1"
                          />
                          <path
                            d="M17 21.014v-1q-.015-5.028-5.008-8.014c-3.328-1.99 3.336 2 .008.014C8.672 10.023 7 7.352 6.992 4V3M7 4h10M7 20h10M8 8h8m-8 8h8"
                          />
                        </g>
                      </svg>
                      <span class="text-secondary text-lg font-semibold">Forms</span>
                    </span>

                    <span class="flex text-primary text-lg font-semibold justify-center w-full">
                      {{ dexStats().forms }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="md:w-5/12 flex items-center justify-center flex-col relative min-h-[300px] bg-secondary/10 rounded-2xl md:bg-transparent"
              >
                <div class="relative w-full h-full">
                  <img
                    [src]="getGameImage(game) | cdnUrl: 'gametiles'"
                    [alt]="game.name"
                    class="w-full h-full object-cover rounded-2xl drop-shadow-xl z-10 transition-transform duration-500 hover:scale-105"
                    (error)="onImageError($event)"
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
      'the-isle-of-armor': 'the_isle_of_armor',
      'the-crown-tundra': 'the_crown_tundra',
      'the-teal-mask': 'the_teal_mask',
      'the-indigo-disk': 'the_indigo_disk',
    };

    const slug = specialCases[game.nameSlug] || game.nameSlug.replace(/-/g, '_');
    return `${slug}.webp`;
  }

  getGameIconUrl(gameCode: string): string {
    const map: Record<string, string> = {
      'rb-r': 'red.png',
      'rb-b': 'blue.png',
      y: 'yellow.png',
      'gsc-g': 'gold.png',
      'gsc-s': 'silver.png',
      'gsc-c': 'crystal.png',
      'gs-g': 'gold.png',
      'gs-s': 'silver.png',
      c: 'crystal.png',
      'rs-r': 'ruby.png',
      'rs-s': 'sapphire.png',
      e: 'emerald.png',
      'frlg-fr': 'firered.png',
      'frlg-lg': 'leafgreen.png',
      'dp-d': 'diamond.png',
      'dp-p': 'pearl.png',
      'dppt-pt': 'platin.png',
      pt: 'platin.png',
      'hgss-hg': 'heartgold.png',
      'hgss-ss': 'soulsilver.png',
      'bw-b': 'black.png',
      'bw-w': 'white.png',
      'b2w2-b2': 'black2.png',
      'b2w2-w2': 'white2.png',
      'xy-x': 'x.png',
      'xy-y': 'y.png',
      'oras-or': 'omega_ruby.png',
      'oras-as': 'alpha_sapphire.png',
      'sm-s': 'sun.png',
      'sm-m': 'moon.png',
      'usum-us': 'ultra_sun.png',
      'usum-um': 'ultra_moon.png',
      'lgpe-lgp': "let's_go_pikachu.png",
      'lgpe-lge': "let's_go_eevee.png",
      'swsh-sw': 'sword.png',
      'swsh-sh': 'shield.png',
      'bdsp-bd': 'brilliant_diamond.png',
      'bdsp-sp': 'shining_pearl.png',
      la: 'legends_arceus.png',
      pla: 'legends_arceus.png',
      'sv-s': 'scarlet.png',
      'sv-v': 'violet.png',
      lza: 'legends_z-a.png',
      go: 'go.png',
      home: 'home.png',
      bank: 'bank.png',
      xd: 'xd.png',
      colosseum: 'coloseum.png',
      col: 'coloseum.png',
    };
    const filename = map[gameCode.toLowerCase()];
    return filename ? `${filename}` : '';
  }

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

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
