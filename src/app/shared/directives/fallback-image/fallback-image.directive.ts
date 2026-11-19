import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appFallback]',
  standalone: true,
})
export class FallbackImageDirective {
  @Input() appFallback = '';

  private isApplied = false;

  constructor(private eRef: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError() {
    if (!this.isApplied) {
      this.isApplied = true;
      if (this.appFallback) {
        this.eRef.nativeElement.src = this.appFallback;
      } else {
        this.eRef.nativeElement.style.display = 'none';
      }
    }
  }
}
