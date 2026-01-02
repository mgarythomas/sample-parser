import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Dashboard Home Page', () => {
  it('renders the dashboard heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /dashboard application/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders welcome card with correct content', () => {
    render(<Home />);
    expect(screen.getByText(/welcome to the dashboard/i)).toBeInTheDocument();
    expect(
      screen.getByText(/this is the dashboard micro frontend application/i)
    ).toBeInTheDocument();
  });

  it('renders buttons from shared UI package', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /shared components/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /design tokens/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /type safety/i })).toBeInTheDocument();
  });

  it('displays information about shared packages', () => {
    render(<Home />);
    expect(screen.getByText(/using components from @repo\/ui package/i)).toBeInTheDocument();
    expect(screen.getByText(/styled with shared tailwind configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/typescript types from @repo\/shared-types/i)).toBeInTheDocument();
  });
});
