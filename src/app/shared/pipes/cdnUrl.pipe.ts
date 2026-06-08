import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'cdnUrl',
  standalone: true,
})
export class CdnUrlPipe implements PipeTransform {
  transform(fileName: string | undefined | null, subfolder: string = ''): string {
    if (!fileName) {
      return '';
    }

    const folderPath = subfolder ? `/${subfolder}` : '';

    return `${environment.cdnUrl}${folderPath}/${fileName}`;
  }
}
