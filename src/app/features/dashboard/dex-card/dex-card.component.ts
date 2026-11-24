import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { Dex, DexType } from '../../../shared/models/dex.model';
import { CdnUrlPipe } from '../../../shared/pipes/cdnUrl.pipe';
import { TooltipDirective } from '../../../shared/directives/tooltip/tooltip.directive';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-dex-card',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe, TooltipDirective, IconComponent],
  template: `
    @if (dex(); as currentDex) {
      <div
        class="bg-surface h-full rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all relative group min-h-[200px] flex flex-col border border-4 border-theme hover:border-[var(--color-primary-hover)]"
      >
        <div (click)="onClick()" class="cursor-pointer flex-1 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-2 w-full justify-end">
              <span class="text-xs text-secondary font-mono">
                {{ currentDex.totalBoxes }} boxes
              </span>
              <button
                (click)="onOptions($event)"
                class="p-1 hover:bg-surface-hover rounded transition-colors flex justify-center text-gray-400 hover:text-white"
                appTooltip="Dex Options"
                tooltipPosition="top"
              >
                <app-icon name="edit-dots" size="1.5em" alt="Options"></app-icon>
              </button>
            </div>
          </div>

          <h3 class="text-xl font-bold text-primary mb-4">
            {{ currentDex.name }}
          </h3>
          <p class="text-secondary text-sm flex-1 mb-4">
            {{ currentDex.description }}
          </p>

          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary"> Start: Box {{ currentDex.startBox }} </span>
            <span
              class="px-3 py-1 rounded text-xs font-medium bg-surface-raised text-primary"
              [appTooltip]="dexTypeName() + '-Dex'"
              tooltipPosition="top"
            >
              {{ dexTypeName() }}
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

  onClick(): void {
    this.clicked.emit(this.dex());
  }

  onOptions(event: Event): void {
    event.stopPropagation();
    this.optionsClicked.emit(this.dex());
  }

  dexTypeName = computed(() => {
    const type = this.dex().type;
    const names: Record<DexType, string> = {
      [DexType.STANDARD]: 'Standard',
      [DexType.LIVING]: 'Living',
      [DexType.SHINY_LIVING]: 'Shiny Living',
      [DexType.COMBINED_SHINY_LIVING]: '1',
      [DexType.FORM]: 'Form',
      [DexType.ORIGIN]: 'Origin',
      [DexType.ORIGIN_FORM]: 'Origin Form',
    };
    return names[type] || 'Standard';
  });
}
