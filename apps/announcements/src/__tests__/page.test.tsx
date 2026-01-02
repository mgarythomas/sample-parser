import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Announcements Home Page', () => {
  it('renders the announcements heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /announcements application/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders welcome card with correct content', () => {
    render(<Home />);
    expect(screen.getByText(/welcome to announcements/i)).toBeInTheDocument();
    expect(
      screen.getByText(/this is the announcements micro frontend application/i)
    ).toBeInTheDocument();
  });

  it('renders action buttons from shared UI package', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /create announcement/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
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
