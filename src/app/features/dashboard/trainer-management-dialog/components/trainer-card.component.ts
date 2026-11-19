import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trainer } from '../../../../shared/models/trainer.model';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { GameDataService } from '../../../../core/services/game-data.service';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-trainer-card',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe, TooltipDirective],
  template: `
    <div
      class="flex flex-row items-center gap-6 px-4 py-2 bg-secondary rounded-lg hover:bg-surface border border-theme cursor-pointer transition-colors"
      (click)="cardClick.emit()"
    >
      <div class="flex-shrink-0 flex items-center justify-center rounded bg-surface shadow-sm">
        @if (trainer().game) {
          <img
            [src]="gameIcon() | cdnUrl: 'games'"
            [alt]="trainer().game"
            class="w-12 h-12 object-contain drop-shadow-sm"
            [appTooltip]="gameName()"
            tooltipPosition="top"
          />
        } @else {
          <span class="text-tertiary text-2xl font-bold">?</span>
        }
      </div>
      <div class="grid grid-cols-[80px_1fr] gap-x-4 gap-y-1.5 text-sm flex-1">
        <div class="font-semibold text-secondary">OT</div>
        <div class="font-bold text-primary">{{ trainer().name }}</div>

        <div class="font-semibold text-secondary">TID</div>
        <div class="text-primary font-medium tracking-wide">{{ trainer().trainerId }}</div>

        @if (trainer().secretId) {
          <div class="font-semibold text-secondary">SID</div>
          <div class="text-primary font-medium tracking-wide">{{ trainer().secretId }}</div>
        }

        @if (trainer().gender) {
          <div class="font-semibold text-secondary">Gender</div>
          <div class="text-primary">
            @if (trainer().gender === 'male') {
              <span class="text-blue-500 font-bold text-base">♂</span>
            } @else if (trainer().gender === 'female') {
              <span class="text-pink-500 font-bold text-base">♀</span>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class TrainerCardComponent {
  private gameDataService = inject(GameDataService);
  trainer = input.required<Trainer>();
  cardClick = output<void>();

  gameIcon = computed(() => {
    const gameId = this.trainer().game;
    return gameId ? this.gameDataService.getGameIconPath(gameId) : '';
  });

  gameName = computed(() => {
    const gameId = this.trainer().game;
    return gameId ? this.gameDataService.getFullGameName(gameId) : '';
  });
}
