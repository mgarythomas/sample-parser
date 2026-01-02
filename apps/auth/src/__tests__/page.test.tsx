import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Auth Home Page', () => {
  it('renders the auth heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /auth application/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders sign in card with correct content', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(
      screen.getByText(/authentication micro frontend using shared components/i)
    ).toBeInTheDocument();
  });

  it('renders email and password input fields', () => {
    render(<Home />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders input placeholders correctly', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('renders sign in and create account buttons', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<Home />);
    expect(screen.getByText(/shared ui components/i)).toBeInTheDocument();
    expect(screen.getByText(/consistent styling/i)).toBeInTheDocument();
  });

  it('displays information about shared packages', () => {
    render(<Home />);
    expect(
      screen.getByText(/using button, card, input, and label from @repo\/ui/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/styled with shared tailwind configuration and design tokens/i)
    ).toBeInTheDocument();
  });
});
