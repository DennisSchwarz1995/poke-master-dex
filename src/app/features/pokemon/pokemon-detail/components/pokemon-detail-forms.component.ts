import { Component, input, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DatasetPokemon, DatasetService } from '../../../../core/api/services/dataset.service';
import { forkJoin, catchError, of, Observable } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';
import { DatasetPokemonCardComponent } from '../../../../shared/components/dataset-pokemon-card/dataset-pokemon-card.component';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

interface EvoNode {
  speciesName: string;
  id: string;
  datasetPokemon?: DatasetPokemon;
  evolvesTo: EvoNode[];
}

@Component({
  selector: 'app-pokemon-detail-forms',
  standalone: true,
  imports: [CommonModule, DatasetPokemonCardComponent],
  template: `
    <div
      class="bg-[var(--color-bg-secondary)] rounded-3xl border border-theme p-6 sm:p-10 shadow-md flex flex-col gap-8"
    >
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-text-primary pb-2">Evolution Chain</h2>

        <div class="flex flex-wrap items-center gap-4 py-4">
          @if (flatEvoPokemons().length > 0) {
            @for (evoPkmn of flatEvoPokemons(); track evoPkmn.id) {
              <div class="w-40 sm:w-48 h-full">
                <app-dataset-pokemon-card [pokemon]="evoPkmn"></app-dataset-pokemon-card>
              </div>
            }
          } @else if (evoChainLoading()) {
            <div class="flex items-center gap-3">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <p class="text-sm text-text-tertiary italic">Loading evolution data...</p>
            </div>
          } @else {
            <p class="text-sm text-text-tertiary italic">
              There is no evolution data available for this pokemon.
            </p>
          }
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-xl font-bold text-text-primary pb-2">Forms</h2>

        <div class="flex flex-wrap items-center gap-4 py-4">
          @if (formsData().length > 0) {
            @for (formPkmn of formsData(); track formPkmn.id) {
              <div class="w-40 sm:w-48 h-full">
                <app-dataset-pokemon-card [pokemon]="formPkmn"></app-dataset-pokemon-card>
              </div>
            }
          } @else {
            <p class="text-sm text-text-tertiary italic w-full">No alternative forms available.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class PokemonDetailFormsComponent {
  datasetService = inject(DatasetService);
  http = inject(HttpClient);

  pokemon = input.required<DatasetPokemon>();

  formsData = signal<DatasetPokemon[]>([]);
  flatEvoPokemons = signal<DatasetPokemon[]>([]);
  evoChainLoading = signal<boolean>(false);

  constructor() {
    toObservable(this.pokemon)
      .pipe(takeUntilDestroyed())
      .subscribe((pkmn) => {
        if (pkmn) {
          this.loadForms(pkmn);
          this.loadEvolutionChain(pkmn);
        }
      });
  }

  loadForms(pkmn: DatasetPokemon) {
    const slugsToFetch = new Set<string>();
    if (pkmn.baseSpecies) {
      slugsToFetch.add(pkmn.baseSpecies);
    }
    if (pkmn.baseForms) {
      pkmn.baseForms.forEach((slug) => slugsToFetch.add(slug));
    }
    if (pkmn.forms) {
      pkmn.forms.forEach((slug) => slugsToFetch.add(slug));
    }
    slugsToFetch.delete(pkmn.id);

    if (slugsToFetch.size > 0) {
      const fetchers = Array.from(slugsToFetch).map((slug) =>
        this.datasetService.loadPokemonBySlug(slug).pipe(take(1)),
      );
      forkJoin(fetchers).subscribe((data) => {
        this.formsData.set(data);
      });
    } else {
      this.formsData.set([]);
    }
  }

  loadEvolutionChain(pkmn: DatasetPokemon) {
    this.flatEvoPokemons.set([]);
    const pkApiId = pkmn.refs?.pkApiId;
    // IDs >= 10000 are form variants (Mega, Alola, etc.) and have no own species entry
    if (!pkApiId || Number(pkApiId) >= 10000) return;

    this.evoChainLoading.set(true);
    this.http
      .get<any>(`https://pokeapi.co/api/v2/pokemon-species/${pkApiId}/`)
      .pipe(
        catchError(() => {
          this.evoChainLoading.set(false);
          return of(null);
        }),
      )
      .subscribe((speciesRes) => {
        if (!speciesRes) return;
        const chainUrl = speciesRes.evolution_chain?.url;
        if (chainUrl) {
          this.http
            .get<any>(chainUrl)
            .pipe(
              catchError(() => {
                this.evoChainLoading.set(false);
                return of(null);
              }),
            )
            .subscribe((chainRes) => {
              if (chainRes && chainRes.chain) {
                const rootNode = this.parseEvoChain(chainRes.chain);
                this.resolveDatasetPokemonsForChain(rootNode, pkmn);
              } else {
                this.evoChainLoading.set(false);
              }
            });
        } else {
          this.evoChainLoading.set(false);
        }
      });
  }

  private parseEvoChain(chainNode: any): EvoNode {
    const urlParts = chainNode.species.url.split('/').filter(Boolean);
    const speciesId = urlParts[urlParts.length - 1];

    return {
      speciesName: chainNode.species.name,
      id: speciesId,
      evolvesTo: (chainNode.evolves_to || []).map((node: any) => this.parseEvoChain(node)),
    };
  }

  private resolveDatasetPokemonsForChain(rootNode: EvoNode, pkmn: DatasetPokemon) {
    const names: string[] = [];
    this.collectSpeciesSlugs(rootNode, names);

    // Extract suffix from current pokemon if it's a form
    let suffix = '';
    const currentBaseInChain = names.find((n) => pkmn.id === n || pkmn.id.startsWith(n + '-'));
    if (currentBaseInChain && pkmn.id.length > currentBaseInChain.length) {
      suffix = pkmn.id.substring(currentBaseInChain.length);
    }

    const fetchers = names.map((slug) =>
      this.datasetService.loadPokemonBySlug(slug).pipe(
        take(1),
        catchError(() => of(null)),
        switchMap((basePkmn) => {
          if (!basePkmn) return of([]);
          const toFetch: Observable<DatasetPokemon | null>[] = [];

          if (slug === currentBaseInChain) {
            toFetch.push(of(pkmn));
          } else {
            if (suffix && suffix !== '') {
              toFetch.push(
                this.datasetService.loadPokemonBySlug(slug + suffix).pipe(
                  take(1),
                  catchError(() => of(basePkmn)),
                ),
              );
              toFetch.push(of(basePkmn));
            } else {
              toFetch.push(of(basePkmn));
              const femaleForm = basePkmn.forms?.find((f) => f.endsWith('-f'));
              if (femaleForm) {
                toFetch.push(
                  this.datasetService.loadPokemonBySlug(femaleForm).pipe(
                    take(1),
                    catchError(() => of(null)),
                  ),
                );
              }
            }
          }

          return forkJoin(toFetch).pipe(
            map((results) => {
              const valids = results.filter((pkmn): pkmn is DatasetPokemon => pkmn !== null);
              const unique: DatasetPokemon[] = [];
              const ids = new Set<string>();
              for (const pkmn of valids) {
                if (!ids.has(pkmn.id)) {
                  ids.add(pkmn.id);
                  unique.push(pkmn);
                }
              }
              return unique;
            }),
          );
        }),
      ),
    );

    forkJoin(fetchers).subscribe((pokemonArrays) => {
      const validPokemons = pokemonArrays.reduce((acc, curr) => acc.concat(curr), []);
      this.flatEvoPokemons.set(validPokemons);
      this.evoChainLoading.set(false);
    });
  }

  private collectSpeciesSlugs(node: EvoNode, names: string[]) {
    names.push(node.speciesName);
    node.evolvesTo.forEach((child) => this.collectSpeciesSlugs(child, names));
  }
}
