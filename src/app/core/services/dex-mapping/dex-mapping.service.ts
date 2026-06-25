import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DexType } from '../../../shared/models/dex.model';
import {
  DexMappingStrategy,
  FormDexStrategy,
  StandardDexStrategy,
  LivingDexStrategy,
  CombinedShinyLivingDexStrategy,
  IndexBasedDexStrategy,
} from './dex-strategies';
import { DexPokemonMapping } from '../../../shared/models/dataset.model';

@Injectable({
  providedIn: 'root',
})
export class DexMappingService {
  private http = inject(HttpClient);
  private readonly datasetBasePath = '/dataset/data';

  private getStrategy(dexType: DexType): DexMappingStrategy | null {
    switch (dexType) {
      case DexType.FORM:
      case DexType.ORIGIN_FORM:
        return new FormDexStrategy(this.http, this.datasetBasePath);

      case DexType.STANDARD:
        return new StandardDexStrategy(this.http, this.datasetBasePath);

      case DexType.LIVING:
      case DexType.ORIGIN:
        return new LivingDexStrategy(this.http, this.datasetBasePath, { isShiny: false });

      case DexType.SHINY_LIVING:
        return new LivingDexStrategy(this.http, this.datasetBasePath, { isShiny: true });

      case DexType.COMBINED_SHINY_LIVING:
        return new CombinedShinyLivingDexStrategy(this.http, this.datasetBasePath);

      default:
        return new IndexBasedDexStrategy(this.http, this.datasetBasePath, { isOrigin: true });
    }
  }

  getDexBoxNames(dexType: DexType): Observable<string[] | undefined> {
    const strategy = this.getStrategy(dexType);
    return strategy ? strategy.getBoxNames() : of(undefined);
  }

  createDexMapping(dexType: DexType): Observable<(DexPokemonMapping | null)[]> {
    const strategy = this.getStrategy(dexType);
    return strategy ? strategy.createMapping() : of([]);
  }
}
