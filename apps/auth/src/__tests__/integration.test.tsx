import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@repo/ui';
import { Card } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { User, UserRole } from '@repo/shared-types';
import { isValidEmail } from '@repo/shared-utils';

describe('Auth Integration Tests', () => {
  describe('Shared UI Components Integration', () => {
    it('renders Button component from @repo/ui', () => {
      render(<Button>Sign In</Button>);
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders Input component from @repo/ui', () => {
      render(<Input type="email" placeholder="Enter email" />);
      expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    });

    it('renders Label component from @repo/ui', () => {
      render(
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" />
        </div>
      );
      expect(screen.getByText(/test label/i)).toBeInTheDocument();
    });

    it('renders Card component from @repo/ui', () => {
      render(
        <Card>
          <h3>Login Form</h3>
        </Card>
      );
      expect(screen.getByText(/login form/i)).toBeInTheDocument();
    });

    it('renders complete login form with all components', () => {
      render(
        <Card>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" />
          </div>
          <Button>Sign In</Button>
        </Card>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Shared Types Integration', () => {
    it('uses User type from @repo/shared-types', () => {
      const user: User = {
        id: '789',
        email: 'auth@example.com',
        name: 'Auth User',
        role: UserRole.ADMIN,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      expect(user.id).toBe('789');
      expect(user.email).toBe('auth@example.com');
      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('validates user roles with UserRole enum', () => {
      const adminUser: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const regularUser: User = {
        id: '2',
        email: 'user@example.com',
        name: 'User',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(adminUser.role).toBe('admin');
      expect(regularUser.role).toBe('user');
    });
  });

  describe('Shared Utils Integration', () => {
    it('uses isValidEmail utility from @repo/shared-utils', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@domain.co.uk')).toBe(true);
      expect(isValidEmail('')).toBe(false);
    });

    it('validates email input with shared utility', () => {
      const email = 'valid@example.com';
      const isValid = isValidEmail(email);
      expect(isValid).toBe(true);
    });
  });

  describe('Form Integration with Shared Packages', () => {
    it('renders and validates login form', async () => {
      const user = userEvent.setup();

      render(
        <Card>
          <form>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" />
            </div>
            <Button type="submit">Sign In</Button>
          </form>
        </Card>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('displays user profile with shared components and types', () => {
      const user: User = {
        id: '999',
        email: 'profile@example.com',
        name: 'Profile User',
        role: UserRole.USER,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      render(
        <Card>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <p>Role: {user.role}</p>
          <Button variant="outline">Edit Profile</Button>
          <Button variant="destructive">Logout</Button>
        </Card>
      );

      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
      expect(screen.getByText(`Role: ${user.role}`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });
});
