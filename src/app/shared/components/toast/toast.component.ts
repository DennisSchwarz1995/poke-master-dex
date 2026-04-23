import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [],
  template: `
    <div class="toast-wrapper">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type">
          <span class="message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-wrapper {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      z-index: 9999;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 500;
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 250px;
      animation:
        slideIn 0.3s ease-out,
        fadeOut 0.3s ease-in 2.7s forwards;
    }

    .toast.success {
      background-color: var(--color-success);
    }
    .toast.error {
      background-color: var(--color-error);
    }
    .toast.info {
      background-color: var(--color-warning);
      color: var(--color-text-primary);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
})
export class Toast {
  toastService = inject(ToastService);
}
