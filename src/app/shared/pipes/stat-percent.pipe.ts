import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statPercent',
  standalone: true,
})
export class StatPercentPipe implements PipeTransform {
  transform(stat: number): number {
    if (stat === undefined || stat === null) return 0;

    return Math.min(100, Math.max(0, (stat / 200) * 100));
  }
}
