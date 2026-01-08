import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dex, DexType } from '../../../shared/models/dex.model';

@Component({
  selector: 'app-dex-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dex(); as currentDex) {
      <div 
        (click)="onClick()"
        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <span class="text-3xl">{{ getIcon(currentDex.type) }}</span>
          </div>
          <span class="text-xs text-gray-500 font-mono">
            {{ currentDex.totalBoxes }} boxes
          </span>
        </div>
        
        <h3 class="text-xl font-bold text-gray-800 mb-2">
          {{ currentDex.name }}
        </h3>
        <p class="text-gray-600 text-sm mb-4">
          {{ currentDex.description }}
        </p>
        
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-500">
            Start: Box {{currentDex.startBox }}
          </span>
          <span 
            class="px-3 py-1 rounded-full text-xs font-medium"
            [class]="getTypeColorClass(currentDex.type)"
          >
            {{ getTypeName(currentDex.type) }}
          </span>
        </div>
      </div>
    }
  `,
  styles: []
})
export class DexCardComponent {
  dex = input.required<Dex>();
  clicked = output<Dex>();
  
  onClick() {
    this.clicked.emit(this.dex());
  }
  
  getIcon(type: DexType): string {
    const icons: Record<DexType, string> = {
      [DexType.STANDARD]: '📋',
      [DexType.LIVING]: '🌱',
      [DexType.SHINY_LIVING]: '✨',
      [DexType.FORM]: '🔄',
      [DexType.ORIGIN]: '🏆'
    };
    return icons[type] || '📋';
  }
  
  getTypeName(type: DexType): string {
    const names: Record<DexType, string> = {
      [DexType.STANDARD]: 'Standard',
      [DexType.LIVING]: 'Living',
      [DexType.SHINY_LIVING]: 'Shiny Living',
      [DexType.FORM]: 'Form',
      [DexType.ORIGIN]: 'Origin'
    };
    return names[type] || 'Standard';
  }
  
  getTypeColorClass(type: DexType): string {
    const colors: Record<DexType, string> = {
      [DexType.STANDARD]: 'bg-blue-100 text-blue-800',
      [DexType.LIVING]: 'bg-green-100 text-green-800',
      [DexType.SHINY_LIVING]: 'bg-yellow-100 text-yellow-800',
      [DexType.FORM]: 'bg-purple-100 text-purple-800',
      [DexType.ORIGIN]: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }
}
