'use client';

import { useState } from 'react';
import { Button } from '@repo/ui';
import { Card } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { UserRole, CreateUserInput } from '@repo/shared-types';
import { isValidEmail, isEmpty } from '@repo/shared-utils';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Example usage of shared types and utilities
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (isEmpty(email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (isEmpty(password)) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = () => {
    if (validateForm()) {
      // Example: Create user input type
      const userInput: CreateUserInput = {
        email,
        name: email.split('@')[0],
        role: UserRole.USER,
      };
      console.log('Sign in with:', userInput);
      // In a real app, this would call an API
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-md w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Auth Application</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
          <p className="text-muted-foreground mb-6">
            Authentication micro frontend using shared components, types, and utilities
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="w-full" onClick={handleSignIn}>
                Sign In
              </Button>
            </div>

            <div className="text-center">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Shared UI Components</h3>
            <p className="text-sm text-muted-foreground">
              Using Button, Card, Input, and Label from @repo/ui
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Shared Types</h3>
            <p className="text-sm text-muted-foreground">
              Using User and CreateUserInput from @repo/shared-types
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Shared Utilities</h3>
            <p className="text-sm text-muted-foreground">
              Using isValidEmail and isEmpty from @repo/shared-utils
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
