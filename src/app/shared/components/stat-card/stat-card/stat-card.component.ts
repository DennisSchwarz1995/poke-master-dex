import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="card-raised">
      <div
        class="text-[12px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5 min-h-[32px]"
      >
        @if (label()) {
          {{ label() }}
        }
        <ng-content select="[slot=label]"></ng-content>
      </div>
      <div class="flex justify-end font-bold text-[16px] text-primary w-1/2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  label = input<string>();
}
