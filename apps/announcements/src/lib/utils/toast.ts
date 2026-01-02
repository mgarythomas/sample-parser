/**
 * Simple toast notification system
 * 
 * Provides a minimal toast notification implementation for displaying
 * success and error messages to users.
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}

export interface Toast extends ToastOptions {
  id: string;
  timestamp: number;
}

type ToastListener = (toasts: Toast[]) => void;

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<ToastListener> = new Set();
  private idCounter = 0;

  /**
   * Subscribe to toast updates
   */
  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of toast updates
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  /**
   * Add a toast notification
   */
  private addToast(options: ToastOptions): string {
    const id = `toast-${++this.idCounter}`;
    const toast: Toast = {
      ...options,
      id,
      timestamp: Date.now(),
    };

    this.toasts.push(toast);
    this.notify();

    // Auto-remove after duration
    const duration = options.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }

    return id;
  }

  /**
   * Remove a toast by ID
   */
  removeToast(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  /**
   * Show a success toast
   */
  success(message: string, duration?: number): string {
    return this.addToast({ type: 'success', message, duration });
  }

  /**
   * Show an error toast
   */
  error(message: string, duration?: number): string {
    return this.addToast({ type: 'error', message, duration });
  }

  /**
   * Show an info toast
   */
  info(message: string, duration?: number): string {
    return this.addToast({ type: 'info', message, duration });
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration?: number): string {
    return this.addToast({ type: 'warning', message, duration });
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toasts = [];
    this.notify();
  }

  /**
   * Get current toasts
   */
  getToasts(): Toast[] {
    return [...this.toasts];
  }
}

// Singleton instance
export const toastManager = new ToastManager();

// Convenience exports
export const toast = {
  success: (message: string, duration?: number) => toastManager.success(message, duration),
  error: (message: string, duration?: number) => toastManager.error(message, duration),
  info: (message: string, duration?: number) => toastManager.info(message, duration),
  warning: (message: string, duration?: number) => toastManager.warning(message, duration),
};
