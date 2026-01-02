/**
 * Tests for toast notification system
 */

import { toastManager, toast } from '../toast';

describe('toast', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    toastManager.clear();
  });

  describe('toastManager', () => {
    it('should add a success toast', () => {
      const id = toastManager.success('Success message');
      const toasts = toastManager.getToasts();

      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        id,
        type: 'success',
        message: 'Success message',
      });
    });

    it('should add an error toast', () => {
      const id = toastManager.error('Error message');
      const toasts = toastManager.getToasts();

      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        id,
        type: 'error',
        message: 'Error message',
      });
    });

    it('should add an info toast', () => {
      const id = toastManager.info('Info message');
      const toasts = toastManager.getToasts();

      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        id,
        type: 'info',
        message: 'Info message',
      });
    });

    it('should add a warning toast', () => {
      const id = toastManager.warning('Warning message');
      const toasts = toastManager.getToasts();

      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        id,
        type: 'warning',
        message: 'Warning message',
      });
    });

    it('should remove a toast by id', () => {
      const id = toastManager.success('Test message');
      expect(toastManager.getToasts()).toHaveLength(1);

      toastManager.removeToast(id);
      expect(toastManager.getToasts()).toHaveLength(0);
    });

    it('should handle multiple toasts', () => {
      toastManager.success('Message 1');
      toastManager.error('Message 2');
      toastManager.info('Message 3');

      const toasts = toastManager.getToasts();
      expect(toasts).toHaveLength(3);
    });

    it('should clear all toasts', () => {
      toastManager.success('Message 1');
      toastManager.error('Message 2');
      expect(toastManager.getToasts()).toHaveLength(2);

      toastManager.clear();
      expect(toastManager.getToasts()).toHaveLength(0);
    });

    it('should notify subscribers when toasts change', () => {
      const listener = jest.fn();
      const unsubscribe = toastManager.subscribe(listener);

      toastManager.success('Test message');
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'success',
            message: 'Test message',
          }),
        ])
      );

      unsubscribe();
    });

    it('should auto-remove toast after duration', (done) => {
      toastManager.success('Test message', 100);
      expect(toastManager.getToasts()).toHaveLength(1);

      setTimeout(() => {
        expect(toastManager.getToasts()).toHaveLength(0);
        done();
      }, 150);
    });

    it('should not auto-remove toast with duration 0', (done) => {
      toastManager.success('Test message', 0);
      expect(toastManager.getToasts()).toHaveLength(1);

      setTimeout(() => {
        expect(toastManager.getToasts()).toHaveLength(1);
        done();
      }, 100);
    });
  });

  describe('toast convenience functions', () => {
    it('should call toastManager.success', () => {
      const _id = toast.success('Success');
      const toasts = toastManager.getToasts();

      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe('success');
    });

    it('should call toastManager.error', () => {
      const _id = toast.error('Error');
      const toasts = toastManager.getToasts();

      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe('error');
    });

    it('should call toastManager.info', () => {
      const _id = toast.info('Info');
      const toasts = toastManager.getToasts();

      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe('info');
    });

    it('should call toastManager.warning', () => {
      const _id = toast.warning('Warning');
      const toasts = toastManager.getToasts();

      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe('warning');
    });
  });
});
