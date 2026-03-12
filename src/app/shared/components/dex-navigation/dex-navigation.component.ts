import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainerManagementDialogComponent } from '../../../features/dashboard/trainer-management-dialog/trainer-management-dialog.component';

export type DexViewType = 'box' | 'gallery' | 'overview';

@Component({
  selector: 'app-dex-navigation',
  standalone: true,
  imports: [CommonModule, TrainerManagementDialogComponent, FormsModule],
  template: `
    <div class="bg-surface border-b border-theme shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          
          <div class="flex items-center gap-2">
            @if (isEditingName()) {
              <div class="flex items-center gap-2">
                <input 
                  #dexNameInput
                  [(ngModel)]="editNameValue"
                  type="text"
                  maxlength="30"
                  class="text-xl font-bold px-2 py-1 border-2 border-theme bg-surface text-primary rounded focus:outline-none focus:border-blue-500 w-[250px]"
                  (keyup.enter)="saveName()"
                  (keyup.escape)="cancelEdit()"
                />
                <button 
                  (click)="saveName()"
                  class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  ✓
                </button>
                <button 
                  (click)="cancelEdit()"
                  class="px-2 py-1 bg-surface-hover text-secondary rounded border border-theme text-sm"
                >
                  ✕
                </button>
              </div>
            } @else {
              <h1 class="text-xl font-bold">{{ dexName() }}</h1>
              <button 
                (click)="startEdit()"
                class="text-tertiary hover:text-blue-500 transition-colors"
                title="Rename Dex"
              >
                ✏️
              </button>
            }
          </div>
          
          
          <div class="flex items-center gap-2">
            <button
              (click)="navigateToHome()"
              class="px-4 py-2 rounded-lg transition-all font-medium"
              [class.bg-surface]="true"
              [class.text-primary]="true"
              [class.bg-surface-hover]="true"
            >
              🏠 Home
            </button>
            
            <button
              (click)="navigateToBox()"
              class="px-4 py-2 rounded-lg transition-all font-medium"
              [class.bg-blue-500]="currentView() === 'box'"
              [class.text-white]="currentView() === 'box'"
              [class.bg-surface]="currentView() !== 'box'"
              [class.text-primary]="currentView() !== 'box'"
              [class.bg-surface-hover]="currentView() !== 'box'"
            >
              📦 Box
            </button>
            
            <button
              (click)="navigateToGallery()"
              class="px-4 py-2 rounded-lg transition-all font-medium"
              [class.bg-blue-500]="currentView() === 'gallery'"
              [class.text-white]="currentView() === 'gallery'"
              [class.bg-surface]="currentView() !== 'gallery'"
              [class.text-primary]="currentView() !== 'gallery'"
              [class.bg-surface-hover]="currentView() !== 'gallery'"
            >
              🎨 Gallery
            </button>
            
            <button
              (click)="navigateToOverview()"
              class="px-4 py-2 rounded-lg transition-all font-medium"
              [class.bg-blue-500]="currentView() === 'overview'"
              [class.text-white]="currentView() === 'overview'"
              [class.bg-surface]="currentView() !== 'overview'"
              [class.text-primary]="currentView() !== 'overview'"
              [class.bg-surface-hover]="currentView() !== 'overview'"
            >
              📊 Overview
            </button>

            <button
              (click)="showTrainerDialog.set(true)"
              class="px-4 py-2 rounded-lg transition-all font-medium bg-surface text-primary bg-surface-hover"
              title="Manage Trainers"
            >
              👤 Trainers
            </button>
          </div>
        </div>
        
        
        @if (currentView() === 'box' && currentBoxNumber()) {
          <div class="flex items-center justify-center gap-4 mt-4">
            <button 
              (click)="previousBox()"
              class="px-4 py-2 bg-surface rounded bg-surface-hover"
              title="Previous Box"
            >
              ←
            </button>
            
            <span class="font-bold">
              Box {{ currentBoxNumber() }} / 200
            </span>
            
            <button 
              (click)="nextBox()"
              class="px-4 py-2 bg-surface rounded bg-surface-hover"
              title="Next Box"
            >
              →
            </button>
          </div>
        }
      </div>
    </div>

    @if (showTrainerDialog()) {
      <app-trainer-management-dialog (closed)="showTrainerDialog.set(false)" />
    }
  `,
  styles: []
})
export class DexNavigationComponent {
  dexId = input.required<string>();
  dexName = input.required<string>();
  currentView = input.required<DexViewType>();
  currentBoxNumber = input<number>();
  
  nameSaved = output<string>();
  showTrainerDialog = signal(false);
  isEditingName = signal(false);
  editNameValue = '';
  
  constructor(private router: Router) {}
  
  navigateToHome() {
    this.router.navigate(['/dashboard']);
  }
  
  navigateToBox() {
    const boxNum = this.currentBoxNumber() || 1;
    this.router.navigate(['/dex', this.dexId(), 'box', boxNum]);
  }
  
  navigateToGallery() {
    this.router.navigate(['/dex', this.dexId(), 'gallery']);
  }
  
  navigateToOverview() {
    this.router.navigate(['/dex', this.dexId()]);
  }
  
  previousBox() {
    const current = this.currentBoxNumber();
    if (!current) return;
    
    const prevBox = current === 1 ? 200 : current - 1;
    this.router.navigate(['/dex', this.dexId(), 'box', prevBox]);
  }
  
  nextBox() {
    const current = this.currentBoxNumber();
    if (!current) return;
    
    const nextBox = current === 200 ? 1 : current + 1;
    this.router.navigate(['/dex', this.dexId(), 'box', nextBox]);
  }
  
  startEdit() {
    this.editNameValue = this.dexName();
    this.isEditingName.set(true);
  }
  
  saveName() {
    if (!this.editNameValue.trim() || this.editNameValue.length > 30) {
      this.cancelEdit();
      return;
    }
    
    if (this.editNameValue.trim() !== this.dexName()) {
      this.nameSaved.emit(this.editNameValue.trim());
    }
    
    this.isEditingName.set(false);
  }
  
  cancelEdit() {
    this.editNameValue = '';
    this.isEditingName.set(false);
  }
}

