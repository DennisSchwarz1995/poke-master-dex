import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      class="app-icon"
      aria-hidden="true"
      [class.current-color]="!originalColor"
      [style.width]="size"
      [style.height]="size"
    >
      <use [attr.href]="'/assets/icons/sprite/sprite.svg#icon-' + name"></use>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      .app-icon {
        transition:
          fill 0.2s ease-in-out,
          stroke 0.2s ease-in-out;
      }

      .current-color {
        fill: currentColor;
        stroke: currentColor;
      }
    `,
  ],
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input({ transform: booleanAttribute }) originalColor: boolean = false;

  @Input() size: string = '1.5em';
}
