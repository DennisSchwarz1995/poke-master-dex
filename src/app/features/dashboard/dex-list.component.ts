import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirestoreService } from '../../core/api/services/firestore.service';
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
export class DexListComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  dexList = signal<Dex[]>([]);
  loading = signal(true);
  showCreateDialog = signal(false);
  showDexOptionsDialog = signal(false);
  selectedDexForOptions = signal<Dex | null>(null);
  dexToDelete = signal<Dex | null>(null);

  ngOnInit() {
    this.loadDexList();
  }

  loadDexList() {
    this.firestoreService.getUserDexList().subscribe({
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
}
