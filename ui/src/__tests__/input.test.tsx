import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Input } from '../components/input';

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input correctly', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Input className="custom-input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-input');
    });

    it('should apply default classes', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('h-10');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-md');
      expect(input).toHaveClass('border');
    });
  });

  describe('Input Types', () => {
    it('should render text input by default', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      // When no type is specified, browsers default to 'text'
      expect(input).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render email input', () => {
      render(<Input type="email" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render number input', () => {
      render(<Input type="number" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render tel input', () => {
      render(<Input type="tel" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input', () => {
      render(<Input type="url" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should render search input', () => {
      render(<Input type="search" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should render date input', () => {
      render(<Input type="date" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'date');
    });
  });

  describe('Props and Attributes', () => {
    it('should handle disabled state', () => {
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('should handle readonly state', () => {
      render(<Input readOnly data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('readonly');
    });

    it('should handle required attribute', () => {
      render(<Input required data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeRequired();
    });

    it('should handle value prop', () => {
      render(<Input value="test value" onChange={() => {}} data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('test value');
    });

    it('should handle defaultValue prop', () => {
      render(<Input defaultValue="default text" data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('default text');
    });

    it('should handle name attribute', () => {
      render(<Input name="username" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should handle id attribute', () => {
      render(<Input id="test-input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('should handle maxLength attribute', () => {
      render(<Input maxLength={10} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should handle minLength attribute', () => {
      render(<Input minLength={5} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('minLength', '5');
    });

    it('should handle pattern attribute', () => {
      render(<Input pattern="[0-9]*" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should handle onChange event', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect((input as HTMLInputElement).value).toBe('test');
    });

    it('should handle onFocus event', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();
      render(<Input onFocus={handleFocus} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur event', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      render(<Input onBlur={handleBlur} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onKeyDown event', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      render(<Input onKeyDown={handleKeyDown} data-testid="input" />);

      const input = screen.getByTestId('input');
      input.focus();
      await user.keyboard('a');

      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('should not allow typing when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Input disabled onChange={handleChange} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
      expect((input as HTMLInputElement).value).toBe('');
    });

    it('should not allow typing when readonly', async () => {
      const user = userEvent.setup();
      render(<Input readOnly defaultValue="readonly" data-testid="input" />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      await user.type(input, 'test');

      expect(input.value).toBe('readonly');
    });

    it('should handle clearing input', async () => {
      const user = userEvent.setup();
      render(<Input defaultValue="initial" data-testid="input" />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      await user.clear(input);

      expect(input.value).toBe('');
    });

    it('should handle paste event', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      input.focus();
      await user.paste('pasted text');

      expect((input as HTMLInputElement).value).toBe('pasted text');
    });
  });

  describe('Validation', () => {
    it('should support HTML5 validation with required', () => {
      render(<Input required data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.validity.valid).toBe(false);
    });

    it('should validate email type', async () => {
      const user = userEvent.setup();
      render(<Input type="email" data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'invalid-email');
      expect(input.validity.valid).toBe(false);

      await user.clear(input);
      await user.type(input, 'valid@email.com');
      expect(input.validity.valid).toBe(true);
    });

    it('should validate pattern attribute', async () => {
      const user = userEvent.setup();
      render(<Input pattern="[0-9]{3}" data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'abc');
      expect(input.validity.valid).toBe(false);

      await user.clear(input);
      await user.type(input, '123');
      expect(input.validity.valid).toBe(true);
    });

    it('should validate maxLength', async () => {
      const user = userEvent.setup();
      render(<Input maxLength={5} data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, '123456789');
      expect(input.value.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Design Tokens', () => {
    it('should apply design token classes for colors', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('bg-background');
      expect(input).toHaveClass('border-input');
    });

    it('should apply design token classes for spacing', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-2');
    });

    it('should apply design token classes for border radius', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('rounded-md');
    });

    it('should apply design token classes for focus ring', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:ring-2');
      expect(input).toHaveClass('focus-visible:ring-ring');
    });

    it('should apply design token classes for typography', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('text-sm');
    });

    it('should apply design token classes for placeholder', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('placeholder:text-muted-foreground');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <label htmlFor="test-input">
          Label
          <Input id="test-input" />
        </label>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when disabled', async () => {
      const { container } = render(
        <label htmlFor="test-input">
          Label
          <Input id="test-input" disabled />
        </label>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support aria-label', () => {
      render(<Input aria-label="Username input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-label', 'Username input');
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" data-testid="input" />
          <span id="help-text">Help text</span>
        </>
      );
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should support aria-invalid', () => {
      render(<Input aria-invalid="true" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.tab();

      expect(input).toHaveFocus();
    });

    it('should have proper focus styles', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:outline-none');
      expect(input).toHaveClass('focus-visible:ring-2');
      expect(input).toHaveClass('focus-visible:ring-offset-2');
    });

    it('should work with labels', () => {
      render(
        <>
          <label htmlFor="username">Username</label>
          <Input id="username" />
        </>
      );
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });
  });
});
