import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../../core/api/services/firestore.service';
import { DexStateService } from '../../../core/services/dex-state.service';
import { Dex, Box } from '../../../shared/models/dex.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-dex-overview',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="min-h-screen bg-secondary">
      <main class="flex flex-col gap-6 container mx-auto pt-6 pb-2 px-4">
        @if (loading()) {
          <div class="text-center py-12">
            <div
              class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"
            ></div>
            <p class="text-secondary">Loading Boxes...</p>
          </div>
        } @else {
          <div
            class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-10 gap-2"
          >
            @for (box of sortedBoxes(); track box.boxNumber) {
              <div
                (click)="openBox(box.boxNumber)"
                class="relative rounded-lg p-2 cursor-pointer transition-all hover:scale-105 border"
                [ngClass]="getBoxStatusClass(box)"
              >
                <div class="flex flex-col items-center justify-center gap-1">
                  <div
                    class="w-8 h-8 rounded flex items-center justify-center text-lg"
                    [ngClass]="getBoxIconClass(box)"
                  >
                    <app-icon name="box"> </app-icon>
                  </div>

                  <div class="text-center">
                    <div class="font-bold text-xs text-primary">{{ box.boxNumber }}</div>
                    <div
                      class="text-[12px] text-secondary font-medium truncate max-w-[60px]"
                      [title]="box.name"
                    >
                      {{ box.name }}
                    </div>
                    <div class="text-[10px] text-secondary">{{ getOwnedCount(box) }}/30</div>
                  </div>
                </div>

                @if (isBoxFull(box)) {
                  <div
                    class="absolute top-1 right-1 text-green-600 bg-green-100 rounded-full w-4 h-4 flex items-center justify-center text-[10px] border border-green-200"
                    title="Box Full"
                  >
                    ✓
                  </div>
                }
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [],
})
export class DexOverviewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private dexStateService = inject(DexStateService);

  private dexSub?: Subscription;
  private boxesSub?: Subscription;

  dexId = signal<string>('');
  dex = signal<Dex | undefined>(undefined);
  boxes = signal<Box[]>([]);
  loading = signal(true);

  sortedBoxes = signal<Box[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.dexId.set(id);
        this.loadDexData(id);
      }
    });
  }

  ngOnDestroy() {
    this.dexSub?.unsubscribe();
    this.boxesSub?.unsubscribe();
  }

  loadDexData(id: string) {
    this.loading.set(true);
    this.dexSub?.unsubscribe();
    this.boxesSub?.unsubscribe();

    this.dexSub = this.firestoreService.getDex(id).subscribe((dex) => {
      this.dex.set(dex);
      this.dexStateService.setCurrentDex(dex);
    });
    this.boxesSub = this.firestoreService.getDexBoxes(id).subscribe({
      next: (boxes) => {
        const sorted = boxes.sort((a, b) => a.boxNumber - b.boxNumber);
        this.boxes.set(boxes);
        this.sortedBoxes.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load boxes', err);
        this.loading.set(false);
      },
    });
  }

  getOwnedCount(box: Box): number {
    return (Array.isArray(box.slots) ? box.slots : Object.values(box.slots || {})).filter(
      (s: any) => s.isOwned,
    ).length;
  }

  isBoxFull(box: Box): number {
    return this.getOwnedCount(box) === 30 ? 1 : 0;
  }

  getBoxStatusClass(box: Box): string {
    const count = this.getOwnedCount(box);
    if (count === 30) {
      return 'bg-green-50 border-green-200 hover:shadow-green-100';
    } else if (count > 0) {
      return 'bg-surface border-theme hover:shadow-md';
    } else {
      return 'bg-secondary opacity-80 hover:opacity-100 hover:bg-surface border-theme';
    }
  }

  getBoxIconClass(box: Box): string {
    const count = this.getOwnedCount(box);
    if (count === 30) {
      return 'bg-green-500 text-white shadow-green-200 shadow-lg';
    } else if (count > 0) {
      return 'bg-green-100 text-green-700';
    } else {
      return 'bg-secondary text-tertiary grayscale border border-theme';
    }
  }

  openBox(boxNumber: number) {
    this.router.navigate(['/dex', this.dexId(), 'box', boxNumber]);
  }
}
