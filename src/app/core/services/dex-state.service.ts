import { Injectable, signal } from '@angular/core';
import { Dex } from '../../shared/models/dex.model';

@Injectable({
  providedIn: 'root',
})
export class DexStateService {
  currentDex = signal<Dex | null>(null);

  setCurrentDex(dex: Dex | null) {
    this.currentDex.set(dex);
  }
}
