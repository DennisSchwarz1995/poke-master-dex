import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../core/api/services/firestore.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { DemoSeedService } from '../../core/services/demo-seed.service';
import { CreateDexDialogComponent } from './create-dex-dialog/create-dex-dialog.component';
import { DexCardComponent } from './dex-card/dex-card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DexOptionsDialogComponent } from './dex-options-dialog/dex-options-dialog.component';
import { Dex } from '../../shared/models/dex.model';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-dex-list',
  standalone: true,
  imports: [
    CommonModule,
    CreateDexDialogComponent,
    DexCardComponent,
    ConfirmDialogComponent,
    DexOptionsDialogComponent,
  ],
  template: `
    <div class="bg-secondary">
      <main class="container mx-auto max-w-5xl py-6">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-primary mb-2">Your Dex Collection</h2>
          <p class="text-secondary">Manage your Pokemon collections</p>
        </div>

        @if (isDemoUser()) {
          <div
            class="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div class="flex items-start gap-3">
              <span
                class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/25 shrink-0 mt-0.5"
              >
                Live Demo
              </span>
              <p class="text-sm text-primary">
                You are exploring an isolated demo session with pre-filled sample data. Feel free
                to edit Pokémon, test Quick-Edit tools, or create boxes — everything is cleared on
                exit.
              </p>
            </div>
            <button
              type="button"
              (click)="exitDemo()"
              [disabled]="exitingDemo()"
              class="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border border-theme bg-surface hover:bg-surface-hover text-primary transition-colors disabled:opacity-50"
            >
              {{ exitingDemo() ? 'Exiting...' : 'Exit Demo' }}
            </button>
          </div>
        }

        @if (loading()) {
          <div class="text-center py-12">
            <div
              class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"
            ></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              (click)="openCreateDexDialog()"
              class="bg-surface text-primary rounded-xl shadow-lg p-8 
                     hover:shadow-2xl transition-all transform hover:scale-105 text-left min-h-[200px] border border-4 border-theme flex flex-col justify-center hover:border-green-500"
            >
              <div class="text-5xl mb-4">+</div>
              <h3 class="text-2xl font-bold mb-2">Create New Dex</h3>
              <p class="text-secondary">Start a new Pokemon collection</p>
            </button>

            @for (dex of dexList(); track dex.id) {
              <app-dex-card
                [dex]="dex"
                (clicked)="openDex($event)"
                (optionsClicked)="openDexOptions($event)"
              />
            }
          </div>
        }
      </main>
    </div>

    @if (showCreateDialog()) {
      <app-create-dex-dialog (closed)="closeDialog()" (dexCreated)="onDexCreated()" />
    }

    @if (showDexOptionsDialog() && selectedDexForOptions()) {
      <app-dex-options-dialog
        [currentName]="selectedDexForOptions()!.name"
        (closed)="closeDexOptionsDialog()"
        (nameSaved)="onDexNameSavedFromDialog($event)"
        (deleteRequested)="onDeleteRequestedFromDialog()"
      />
    }

    @if (dexToDelete()) {
      <app-confirm-dialog
        title="Delete Dex"
        [message]="
          'Delete ' +
          dexToDelete()?.name +
          '? This will permanently delete the Dex and all 200 boxes!'
        "
        icon="🗑️"
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="confirmDeleteDex()"
        (cancelled)="cancelDeleteDex()"
      />
    }
  `,
  styles: [],
})
export class DexListComponent implements OnInit, OnDestroy {
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private demoSeedService = inject(DemoSeedService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  private dexListSub?: Subscription;
  isDemoUser = this.authService.isDemoUser;
  exitingDemo = signal(false);
  dexList = signal<Dex[]>([]);
  loading = signal(true);
  showCreateDialog = signal(false);
  showDexOptionsDialog = signal(false);
  selectedDexForOptions = signal<Dex | null>(null);
  dexToDelete = signal<Dex | null>(null);

  ngOnInit() {
    this.loadDexList();
  }

  ngOnDestroy() {
    this.dexListSub?.unsubscribe();
  }

  loadDexList() {
    this.dexListSub?.unsubscribe();
    this.dexListSub = this.firestoreService.getUserDexList().subscribe({
      next: (dexes) => {
        this.dexList.set(dexes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dex list:', err);
        this.loading.set(false);
      },
    });
  }

  openCreateDexDialog() {
    this.showCreateDialog.set(true);
  }

  closeDialog() {
    this.showCreateDialog.set(false);
  }

  onDexCreated() {
    this.loadDexList();
  }

  openDexOptions(dex: Dex) {
    this.selectedDexForOptions.set(dex);
    this.showDexOptionsDialog.set(true);
  }

  closeDexOptionsDialog() {
    this.showDexOptionsDialog.set(false);
    this.selectedDexForOptions.set(null);
  }

  async onDexNameSavedFromDialog(newName: string) {
    const dex = this.selectedDexForOptions();
    if (!dex) return;

    this.closeDexOptionsDialog();

    try {
      await this.firestoreService.updateDexName(dex.id, newName);
      this.loadDexList(); // Refresh the list to show the new name
    } catch (err) {
      console.error('Failed to rename Dex:', err);
      // Optional: show user error message
    }
  }

  onDeleteRequestedFromDialog() {
    const dex = this.selectedDexForOptions();
    if (!dex) return;

    // Close options, open confirm dialog
    this.closeDexOptionsDialog();
    this.dexToDelete.set(dex);
  }

  cancelDeleteDex() {
    this.dexToDelete.set(null);
  }

  async confirmDeleteDex() {
    const dex = this.dexToDelete();
    if (!dex) return;

    this.dexToDelete.set(null);
    this.loading.set(true);

    try {
      await this.firestoreService.deleteDex(dex.id);
      this.loadDexList();
    } catch (err) {
      console.error('Failed to delete Dex:', err);
      alert('Failed to delete Dex. Please try again.');
      this.loading.set(false);
    }
  }

  openDex(dex: Dex) {
    this.router.navigate(['/dex', dex.id, 'box', 1]);
  }

  async exitDemo() {
    if (this.exitingDemo()) return;
    this.exitingDemo.set(true);
    try {
      this.authService.prepareSignOut();
      await this.demoSeedService.cleanupDemoAccount();
      await this.authService.signOutAndCleanup();
      await this.router.navigate(['/home']);
    } finally {
      this.exitingDemo.set(false);
    }
  }
}
