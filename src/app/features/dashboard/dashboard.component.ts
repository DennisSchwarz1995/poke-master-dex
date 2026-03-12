import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { FirestoreService } from '../../core/api/services/firestore.service';
import { CreateDexDialogComponent } from './create-dex-dialog/create-dex-dialog.component';
import { TrainerManagementDialogComponent } from './trainer-management-dialog/trainer-management-dialog.component';
import { DexCardComponent } from './dex-card/dex-card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Dex } from '../../shared/models/dex.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CreateDexDialogComponent,
    TrainerManagementDialogComponent,
    DexCardComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="min-h-screen bg-secondary">
      <header class="bg-surface shadow-sm border-b border-theme">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-primary">Poke-Master-Dex</h1>

            @if (user(); as currentUser) {
              <div class="flex items-center gap-4">
                <button
                  (click)="openTrainerManagement()"
                  class="px-4 py-2 rounded-lg transition-all font-medium bg-surface text-primary bg-surface-hover"
                  title="Manage Trainers"
                >
                  👤 Trainers
                </button>
                <span class="text-secondary hidden md:inline">{{ currentUser.displayName }}</span>
                @if (currentUser.photoURL) {
                  <img
                    [src]="currentUser.photoURL"
                    [alt]="currentUser.displayName || 'User'"
                    (click)="goToProfile()"
                    class="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                  />
                }
                <button
                  (click)="goToProfile()"
                  class="text-blue-500 hover:text-blue-700 font-medium text-sm"
                >
                  Profile
                </button>
              </div>
            }
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8">
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
              class="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8 
                     hover:shadow-2xl transition-all transform hover:scale-105 text-left min-h-[200px] flex flex-col justify-center"
            >
              <div class="text-5xl mb-4">+</div>
              <h3 class="text-2xl font-bold mb-2">Create New Dex</h3>
              <p class="text-blue-100">Start a new Pokemon collection</p>
            </button>

            @for (dex of dexList(); track dex.id) {
              <app-dex-card
                [dex]="dex"
                (clicked)="openDex($event)"
                (deleteRequested)="onDeleteDex($event)"
              />
            }
          </div>
        }
      </main>
    </div>

    @if (showCreateDialog()) {
      <app-create-dex-dialog (closed)="closeDialog()" (dexCreated)="onDexCreated()" />
    }

    @if (showTrainerDialog()) {
      <app-trainer-management-dialog (closed)="closeTrainerDialog()" />
    }

    @if (dexToDelete()) {
      <app-confirm-dialog
        title="Delete Dex"
        [message]="
          'Delete \\'' +
          dexToDelete()?.name +
          '\\'?\\nThis will permanently delete the Dex and all 200 boxes!'
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
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  user = this.authService.user;
  dexList = signal<Dex[]>([]);
  loading = signal(true);
  showCreateDialog = signal(false);
  showTrainerDialog = signal(false);
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

  openTrainerManagement() {
    this.showTrainerDialog.set(true);
  }

  closeTrainerDialog() {
    this.showTrainerDialog.set(false);
  }

  onDeleteDex(dex: Dex) {
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

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
