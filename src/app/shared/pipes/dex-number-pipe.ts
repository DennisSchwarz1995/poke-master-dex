import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dexNumber',
})
export class DexNumberPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return '';

    return (
      '#' +
      value
        .split('-')
        .map((number) => number.charAt(0).toUpperCase() + number.slice(1))
        .join('-')
    );
  }
}
