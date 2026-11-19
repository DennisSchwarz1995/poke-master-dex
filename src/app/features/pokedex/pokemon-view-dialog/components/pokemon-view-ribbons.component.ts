import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxSlot } from '../../../../shared/models/dex.model';
import { CdnUrlPipe } from '../../../../shared/pipes/cdnUrl.pipe';
import { TooltipDirective } from '../../../../shared/directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-pokemon-view-ribbons',
  standalone: true,
  imports: [CommonModule, CdnUrlPipe, TooltipDirective],
  host: { class: 'flex flex-col min-h-full gap-6' },
  template: `
    <section class="flex flex-col flex-1 gap-4">
      <h3 class="text-sm font-bold text-secondary uppercase tracking-wider shrink-0">Ribbons</h3>
      <div
        class="min-h-[128px] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 border border-theme rounded-xl p-6"
      >
        @if (equippedRibbons() && equippedRibbons().length > 0) {
          @for (ribbon of equippedRibbons(); track ribbon.id) {
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center justify-center">
                <img
                  [src]="ribbon.spriteUrl | cdnUrl: 'ribbons'"
                  [alt]="ribbon.name"
                  class="w-10 h-10 object-contain drop-shadow-md"
                  [appTooltip]="ribbon.name"
                />
              </div>
              <span class="font-semibold text-xs text-center text-secondary leading-tight">{{
                ribbon.name
              }}</span>
            </div>
          }
        } @else {
          <p class="text-secondary text-sm italic col-span-full">No Ribbons equipped</p>
        }
      </div>
    </section>

    <section class="flex flex-col flex-1 gap-4">
      <h3 class="text-sm font-bold text-secondary uppercase tracking-wider shrink-0">Marks</h3>
      <div
        class="min-h-[128px] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 border border-theme rounded-xl p-6"
      >
        @if (equippedMarks() && equippedMarks().length > 0) {
          @for (mark of equippedMarks(); track mark.id) {
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center justify-center">
                <img
                  [src]="mark.spriteUrl | cdnUrl: 'marks'"
                  [alt]="mark.name"
                  class="w-10 h-10 object-contain drop-shadow-md"
                  [appTooltip]="mark.name"
                />
              </div>
              <span
                class="font-semibold text-xs text-center text-secondary text-primary leading-tight"
                >{{ mark.name }}</span
              >
            </div>
          }
        } @else {
          <p class="text-secondary text-sm italic col-span-full">No Marks equipped</p>
        }
      </div>
    </section>
  `,
})
export class PokemonViewRibbonsComponent {
  pokemon = input.required<BoxSlot>();
  equippedRibbons = input<{ id: string; name: string; spriteUrl: string }[]>([]);
  equippedMarks = input<{ id: string; name: string; spriteUrl: string }[]>([]);
}
