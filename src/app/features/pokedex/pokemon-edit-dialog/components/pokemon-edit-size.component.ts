import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-pokemon-edit-size',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  template: `
    <div class="flex flex-col gap-1.5 relative group">
      <label class="text-[12px] font-bold text-secondary uppercase pl-2 z-10"> Size </label>

      <div
        class="flex w-full h-12 bg-surface border-2 border-theme rounded-xl overflow-hidden relative shadow-sm h-[56px]"
      >
        @for (option of sizeOptions; track option.value; let i = $index) {
          @if (i > 0) {
            <div class="w-px bg-theme self-stretch"></div>
          }
          <button
            type="button"
            (click)="selectSize(option.value)"
            class="flex-1 flex items-center justify-center gap-1 transition-all font-bold text-sm relative"
            [appTooltip]="option.description"
            [tooltipPosition]="'top'"
            [ngClass]="{
              'bg-blue-500 text-white shadow-inner': selectedSize() === option.value,
              'text-secondary hover:text-primary hover:bg-surface-hover':
                selectedSize() !== option.value,
            }"
          >
            <span class="text-base">{{ option.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class PokemonEditSizeComponent {
  selectedSize = input<string>('');

  sizeChanged = output<string>();

  sizeOptions = [
    { value: 'xs', label: 'XS', description: 'Extra Small' },
    { value: 's', label: 'S', description: 'Small' },
    { value: 'm', label: 'M', description: 'Medium' },
    { value: 'l', label: 'L', description: 'Large' },
    { value: 'xl', label: 'XL', description: 'Extra Large' },
  ];

  selectSize(value: string) {
    if (this.selectedSize() === value) {
      this.sizeChanged.emit('');
    } else {
      this.sizeChanged.emit(value);
    }
  }
}
