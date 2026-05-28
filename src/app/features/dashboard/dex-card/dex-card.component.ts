import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { Dex, DexType } from '../../../shared/models/dex.model';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl-pipe';

@Component({
  selector: 'app-dex-card',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe],
  template: `
    @if (dex(); as currentDex) {
      <div
        class="bg-surface h-full rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all relative group min-h-[200px] flex flex-col border border-4 border-theme hover:border-[var(--color-primary-hover)]"
      >
        <div (click)="onClick()" class="cursor-pointer flex-1 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div>
              <span class="text-3xl">{{ getIcon(currentDex.type) }}</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-secondary font-mono">
                {{ currentDex.totalBoxes }} boxes
              </span>
              <button
                (click)="onOptions($event)"
                class="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                title="Dex Options"
              >
                <img
                  [src]="
                    (themeService.currentTheme() === 'dark'
                      ? 'options-white.png'
                      : 'options-black.png'
                    ) | cdnUrl: 'icons'
                  "
                  class="w-5 h-5 opacity-70 hover:opacity-100"
                  alt="Options"
                />
              </button>
            </div>
          </div>

          <h3 class="text-xl font-bold text-primary mb-2">
            {{ currentDex.name }}
          </h3>
          <p class="text-secondary text-sm flex-1">
            {{ currentDex.description }}
          </p>

          <div class="mb-4">
            <span class="text-xs text-secondary font-medium">Type: </span>
            <span class="text-sm font-semibold text-primary pl-1">{{
              getTypeName(currentDex.type)
            }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary"> Start: Box {{ currentDex.startBox }} </span>
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-surface-raised text-primary">
              {{ getTypeName(currentDex.type) }}
            </span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [],
})
export class DexCardComponent {
  themeService = inject(ThemeService);

  dex = input.required<Dex>();
  clicked = output<Dex>();
  optionsClicked = output<Dex>();

  onClick() {
    this.clicked.emit(this.dex());
  }

  onOptions(event: Event) {
    event.stopPropagation();
    this.optionsClicked.emit(this.dex());
  }

  getIcon(type: DexType): string {
    const icons: Record<DexType, string> = {
      [DexType.STANDARD]: '📋',
      [DexType.LIVING]: '🌱',
      [DexType.SHINY_LIVING]: '✨',
      [DexType.FORM]: '🔄',
      [DexType.ORIGIN]: '🏆',
    };
    return icons[type] || '📋';
  }

  getTypeName(type: DexType): string {
    const names: Record<DexType, string> = {
      [DexType.STANDARD]: 'Standard',
      [DexType.LIVING]: 'Living',
      [DexType.SHINY_LIVING]: 'Shiny Living',
      [DexType.FORM]: 'Form',
      [DexType.ORIGIN]: 'Origin',
    };
    return names[type] || 'Standard';
  }
}
