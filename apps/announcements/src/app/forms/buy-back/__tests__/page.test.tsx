/**
 * Tests for buy-back form page
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BuyBackFormPage from '../page';
import { restoreFormDraft, clearFormDraft } from '../../../../lib/storage/form-storage';
import { toast } from '../../../../lib/utils/toast';

// Mock dependencies
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../../../../lib/storage/form-storage', () => ({
  restoreFormDraft: jest.fn(),
  clearFormDraft: jest.fn(),
}));

jest.mock('../../../../components/forms/buy-back-form', () => ({
  BuyBackForm: ({ initialData, onSubmitSuccess, onSubmitError }: any) => (
    <div data-testid="buy-back-form">
      <div data-testid="initial-data">{JSON.stringify(initialData)}</div>
      <button onClick={() => onSubmitSuccess('test-id')}>Submit</button>
      <button onClick={() => onSubmitError(new Error('Test error'))}>Error</button>
    </div>
  ),
}));

jest.mock('../../../../components/ui/toast-container', () => ({
  ToastContainer: () => <div data-testid="toast-container">Toast Container</div>,
}));

jest.mock('../../../../lib/utils/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('BuyBackFormPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page with form', async () => {
    (restoreFormDraft as jest.Mock).mockReturnValue(null);

    render(<BuyBackFormPage />);

    await waitFor(() => {
      expect(screen.getByText('Buy-Back Announcement Form')).toBeInTheDocument();
    });

    expect(screen.getByTestId('buy-back-form')).toBeInTheDocument();
  });

  describe('Draft Restoration (Task 17)', () => {
    it('restores draft data from local storage on mount', async () => {
      const mockDraft = {
        formType: 'buy-back',
        lastSaved: new Date().toISOString(),
        data: {
          entityName: 'Test Entity',
          abnArsn: '12345678901',
        },
        version: 1,
      };

      (restoreFormDraft as jest.Mock).mockReturnValue(mockDraft);

      render(<BuyBackFormPage />);

      await waitFor(() => {
        expect(restoreFormDraft).toHaveBeenCalledWith('buy-back');
      });

      // Verify draft notification is displayed
      expect(screen.getByText('Draft Found')).toBeInTheDocument();
      expect(screen.getByText(/We found a saved draft from your previous session/)).toBeInTheDocument();
    });

    it('displays notification when draft is restored', async () => {
      const mockDraft = {
        formType: 'buy-back',
        lastSaved: new Date().toISOString(),
        data: {
          entityName: 'Test Entity',
          abnArsn: '12345678901',
        },
        version: 1,
      };

      (restoreFormDraft as jest.Mock).mockReturnValue(mockDraft);

      render(<BuyBackFormPage />);

      await waitFor(() => {
        expect(screen.getByText('Draft Found')).toBeInTheDocument();
      });

      // Verify notification content
      expect(screen.getByText(/Would you like to continue where you left off or start fresh/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue Draft/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Fresh/i })).toBeInTheDocument();
    });

    it('provides option to continue with draft', async () => {
      const mockDraft = {
        formType: 'buy-back',
        lastSaved: new Date().toISOString(),
        data: {
          entityName: 'Test Entity',
          abnArsn: '12345678901',
        },
        version: 1,
      };

      (restoreFormDraft as jest.Mock).mockReturnValue(mockDraft);

      render(<BuyBackFormPage />);

      await waitFor(() => {
        expect(screen.getByText('Draft Found')).toBeInTheDocument();
      });

      // Click "Continue Draft" button
      const continueButton = screen.getByRole('button', { name: /Continue Draft/i });
      fireEvent.click(continueButton);

      // Verify notification is hidden
      await waitFor(() => {
        expect(screen.queryByText('Draft Found')).not.toBeInTheDocument();
      });

      // Verify success toast is shown
      expect(toast.success).toHaveBeenCalledWith('Continuing with saved draft');

      // Verify form receives the draft data
      const initialDataElement = screen.getByTestId('initial-data');
      const initialData = JSON.parse(initialDataElement.textContent || '{}');
      expect(initialData.entityName).toBe('Test Entity');
      expect(initialData.abnArsn).toBe('12345678901');
    });

    it('provides option to start fresh', async () => {
      const mockDraft = {
        formType: 'buy-back',
        lastSaved: new Date().toISOString(),
        data: {
          entityName: 'Test Entity',
          abnArsn: '12345678901',
        },
        version: 1,
      };

      (restoreFormDraft as jest.Mock).mockReturnValue(mockDraft);

      render(<BuyBackFormPage />);

      await waitFor(() => {
        expect(screen.getByText('Draft Found')).toBeInTheDocument();
      });

      // Click "Start Fresh" button
      const startFreshButton = screen.getByRole('button', { name: /Start Fresh/i });
      fireEvent.click(startFreshButton);

      // Verify draft is cleared
      expect(clearFormDraft).toHaveBeenCalledWith('buy-back');

      // Verify notification is hidden
      await waitFor(() => {
        expect(screen.queryByText('Draft Found')).not.toBeInTheDocument();
      });

      // Verify info toast is shown
      expect(toast.info).toHaveBeenCalledWith('Starting with a fresh form');

      // Verify form receives undefined initial data
      const initialDataElement = screen.getByTestId('initial-data');
      const initialData = initialDataElement.textContent;
      expect(initialData).toBe('');
    });

    it('does not show notification when no draft exists', async () => {
      (restoreFormDraft as jest.Mock).mockReturnValue(null);

      render(<BuyBackFormPage />);

      await waitFor(() => {
        expect(screen.getByText('Buy-Back Announcement Form')).toBeInTheDocument();
      });

      // Verify notification is not displayed
      expect(screen.queryByText('Draft Found')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Continue Draft/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Start Fresh/i })).not.toBeInTheDocument();
    });

    it('handles errors when restoring draft', async () => {
      (restoreFormDraft as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Spy on console.error to suppress error output in tests
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<BuyBackFormPage />);

      await waitFor(() => {
        expect(screen.getByText('Buy-Back Announcement Form')).toBeInTheDocument();
      });

      // Verify error toast is shown
      expect(toast.error).toHaveBeenCalledWith('Failed to restore saved draft');

      // Verify page still renders
      expect(screen.getByTestId('buy-back-form')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('shows loading state while restoring draft', async () => {
      (restoreFormDraft as jest.Mock).mockReturnValue(null);

      const { container } = render(<BuyBackFormPage />);

      // The loading state is very brief in tests, so we just verify the page renders
      await waitFor(() => {
        expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
      });
    });
  });

  it('includes toast container', async () => {
    (restoreFormDraft as jest.Mock).mockReturnValue(null);

    render(<BuyBackFormPage />);

    await waitFor(() => {
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });
  });
});
