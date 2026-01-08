import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { FirestoreService } from '../../core/api/services/firestore.service';
import { CreateDexDialogComponent } from './create-dex-dialog/create-dex-dialog.component';
import { TrainerManagementDialogComponent } from './trainer-management-dialog/trainer-management-dialog.component';
import { DexCardComponent } from './dex-card/dex-card.component';
import { Dex } from '../../shared/models/dex.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CreateDexDialogComponent, TrainerManagementDialogComponent, DexCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800">Poke-Master-Dex</h1>
            
            @if (user(); as currentUser) {
              <div class="flex items-center gap-4">
                <button
                  (click)="openTrainerManagement()"
                  class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Trainer Profiles
                </button>
                <span class="text-gray-600 hidden md:inline">{{ currentUser.displayName }}</span>
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
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Your Dex Collection</h2>
          <p class="text-gray-600">Manage your Pokemon collections</p>
        </div>
        
        @if (loading()) {
          <div class="text-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
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
      <app-create-dex-dialog
        (closed)="closeDialog()"
        (dexCreated)="onDexCreated()"
      />
    }
    
    @if (showTrainerDialog()) {
      <app-trainer-management-dialog
        (closed)="closeTrainerDialog()"
      />
    }
  `,
  styles: []
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
  
  ngOnInit() {
    this.loadDexList();
  }
  
  loadDexList() {
    this.firestoreService.getUserDexList()
      .subscribe({
        next: (dexes) => {
          this.dexList.set(dexes);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load dex list:', err);
          this.loading.set(false);
        }
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
  
  async onDeleteDex(dex: Dex) {
    if (!confirm(`Delete "${dex.name}"? This will permanently delete the Dex and all 200 boxes!`)) {
      return;
    }
    
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
