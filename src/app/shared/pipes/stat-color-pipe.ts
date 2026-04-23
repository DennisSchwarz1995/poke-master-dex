import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statColor',
  standalone: true,
})
export class StatColorPipe implements PipeTransform {
  transform(stat: number): string {
    if (stat === undefined || stat === null) return '#ccc';

    if (stat < 80) return '#fa2d37';
    if (stat <= 99) return '#ff6a00';
    if (stat <= 129) return '#7ccf00';

    return '#00baa8';
  }
}
