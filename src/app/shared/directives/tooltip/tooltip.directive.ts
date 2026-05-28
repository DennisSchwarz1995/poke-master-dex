import {
  Directive,
  Input,
  ElementRef,
  HostListener,
  Renderer2,
  OnDestroy,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipTitle: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  private tooltip: HTMLElement | null = null;
  private offset = 10;
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltip && this.tooltipTitle && this.tooltipTitle.trim() !== '') {
      this.show();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hide();
  }

  private show() {
    this.tooltip = this.renderer.createElement('div');
    if (this.tooltip) {
      this.renderer.appendChild(this.tooltip, this.renderer.createText(this.tooltipTitle));

      this.renderer.addClass(this.tooltip, 'app-custom-tooltip');
      this.renderer.addClass(this.tooltip, `tooltip-${this.tooltipPosition}`);

      this.renderer.setStyle(this.tooltip, 'position', 'absolute');
      this.renderer.setStyle(this.tooltip, 'visibility', 'hidden');
      this.renderer.setStyle(this.tooltip, 'top', '0px');
      this.renderer.setStyle(this.tooltip, 'left', '0px');

      this.renderer.appendChild(document.body, this.tooltip);

      const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
      const tooltipPos = this.tooltip.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (this.tooltipPosition) {
        case 'top':
          top = hostPos.top - tooltipPos.height - this.offset;
          left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
          break;
        case 'bottom':
          top = hostPos.bottom + this.offset;
          left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
          break;
        case 'left':
          top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
          left = hostPos.left - tooltipPos.width - this.offset;
          break;
        case 'right':
          top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
          left = hostPos.right + this.offset;
          break;
      }

      this.renderer.setStyle(this.tooltip, 'top', `${Math.round(top + window.scrollY)}px`);
      this.renderer.setStyle(this.tooltip, 'left', `${Math.round(left + window.scrollX)}px`);

      this.renderer.setStyle(this.tooltip, 'visibility', 'visible');
    }
  }

  private hide() {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }
  }

  ngOnDestroy() {
    this.hide();
  }
}
