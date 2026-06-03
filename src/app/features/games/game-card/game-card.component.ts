import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GameData } from '../../../shared/models/dataset.model';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl-pipe';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CdnUrlPipe],
  template: `
    <a
      [routerLink]="game.type === 'dlc' ? null : ['/games', game.nameSlug]"
      class="bg-surface rounded-2xl border border-theme p-5 shadow-sm group flex flex-col h-full gap-4 overflow-hidden relative"
      [class]="
        game.type === 'game'
          ? 'hover:shadow-md transition-all hover:-translate-y-1 hover:border-[var(--color-primary-hover)]'
          : ''
      "
      [class.cursor-pointer]="game.type !== 'dlc'"
      [class.cursor-default]="game.type === 'dlc'"
    >
      <div class="relative z-10 flex flex-col h-full">
        <div class="w-full flex items-center justify-center">
          <img
            [src]="getGameImage(game) | cdnUrl: 'gametiles'"
            [alt]="game.name"
            class="rounded-2xl w-full h-full object-cover select-none pointer-events-none"
            (error)="onImageError($event)"
            loading="lazy"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2 items-center">
        <h3 class="text-xl font-bold text-primary text-center">
          {{ game.name }}
        </h3>

        <div class="flex items-center text-md font-semibold text-secondary">
          <span>{{ game.releaseDate | date: 'y' }}</span>
        </div>
      </div>
    </a>
  `,
  styles: [],
})
export class GameCard {
  @Input() game!: GameData;

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
    return `${slug}.webp`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
