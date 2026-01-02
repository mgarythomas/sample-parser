import { render, screen } from '@testing-library/react';
import { Button } from '@repo/ui';
import { Card } from '@repo/ui';
import { User, UserRole } from '@repo/shared-types';
import { formatDate } from '@repo/shared-utils';

describe('Dashboard Integration Tests', () => {
  describe('Shared UI Components Integration', () => {
    it('renders Button component from @repo/ui', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
    });

    it('renders Button with different variants', () => {
      const { rerender } = render(<Button variant="default">Default</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders Card component from @repo/ui', () => {
      render(
        <Card>
          <div>Card Content</div>
        </Card>
      );
      expect(screen.getByText(/card content/i)).toBeInTheDocument();
    });

    it('renders nested Card components', () => {
      render(
        <Card>
          <Card>
            <div>Nested Card</div>
          </Card>
        </Card>
      );
      expect(screen.getByText(/nested card/i)).toBeInTheDocument();
    });
  });

  describe('Shared Types Integration', () => {
    it('uses User type from @repo/shared-types', () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe(UserRole.USER);
    });

    it('uses UserRole enum from @repo/shared-types', () => {
      expect(UserRole.ADMIN).toBe('admin');
      expect(UserRole.USER).toBe('user');
      expect(UserRole.GUEST).toBe('guest');
    });
  });

  describe('Shared Utils Integration', () => {
    it('uses formatDate utility from @repo/shared-utils', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date, 'YYYY-MM-DD');
      expect(formatted).toBe('2024-01-15');
    });

    it('formats dates with different patterns', () => {
      const date = new Date('2024-03-20T00:00:00Z');

      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-03-20');
      expect(formatDate(date, 'MM/DD/YYYY')).toBe('03/20/2024');
      expect(formatDate(date, 'DD-MM-YYYY')).toBe('20-03-2024');
    });
  });

  describe('Component and Type Integration', () => {
    it('renders user information with shared components and types', () => {
      const user: User = {
        id: '456',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      render(
        <Card>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <p>Role: {user.role}</p>
          <Button>View Profile</Button>
        </Card>
      );

      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
      expect(screen.getByText(`Role: ${user.role}`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view profile/i })).toBeInTheDocument();
    });
  });
});
