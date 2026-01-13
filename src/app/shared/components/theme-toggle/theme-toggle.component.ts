import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="toggleTheme()"
      class="theme-toggle"
      [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      title="{{ isDark() ? 'Switch to light mode' : 'Switch to dark mode' }}"
    >
      <span class="toggle-track">
        <span class="toggle-thumb" [class.dark]="isDark()">
          <span class="toggle-icon">{{ isDark() ? '🌙' : '☀️' }}</span>
        </span>
      </span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      outline: none;
    }
    
    .toggle-track {
      display: block;
      width: 52px;
      height: 28px;
      background: var(--color-border);
      border-radius: 14px;
      position: relative;
      transition: background 0.3s ease;
    }
    
    .theme-toggle:hover .toggle-track {
      background: var(--color-border-hover);
    }
    
    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 24px;
      height: 24px;
      background: var(--color-bg-primary);
      border-radius: 12px;
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .toggle-thumb.dark {
      transform: translateX(24px);
    }
    
    .toggle-icon {
      font-size: 14px;
      line-height: 1;
    }
  `]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);
  
  isDark() {
    return this.themeService.currentTheme() === 'dark';
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
