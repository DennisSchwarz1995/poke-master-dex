import { Pipe, PipeTransform } from '@angular/core';
import { CapitalizePipe } from './capitalize.pipe';

@Pipe({
  name: 'formatAbility',
})
export class FormatAbilityPipe implements PipeTransform {
  private capitalizePipe = new CapitalizePipe();

  transform(value: string | undefined): string {
    if (!value) return '';
    return value
      .split('-')
      .map((word) => this.capitalizePipe.transform(word))
      .join(' ');
  }
}
