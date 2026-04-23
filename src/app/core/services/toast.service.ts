import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public toasts = signal<Toast[]>([]);

  private addToast(message: string, type: Toast['type'], duration: number = 3000): void {
    const toast: Toast = {
      id: Date.now().toString(),
      message,
      type,
    };
    this.toasts.update((currentToast) => [...currentToast, toast]);

    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }

  public removeToast(id: string): void {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  public success(message: string, duration: number = 3000): void {
    this.addToast(message, 'success', duration);
  }

  public error(message: string, duration: number = 3000): void {
    this.addToast(message, 'error', duration);
  }

  public info(message: string, duration: number = 3000): void {
    this.addToast(message, 'info', duration);
  }
}
