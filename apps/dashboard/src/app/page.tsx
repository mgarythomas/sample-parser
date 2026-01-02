import { Button } from '@repo/ui';
import { Card } from '@repo/ui';
import { User, UserRole } from '@repo/shared-types';
import { formatDate, capitalize } from '@repo/shared-utils';

export default function Home() {
  // Example usage of shared types
  const currentUser: User = {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  };

  // Example usage of shared utilities
  const formattedDate = formatDate(currentUser.createdAt, 'MMMM d, yyyy');
  const userRoleDisplay = capitalize(currentUser.role);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Dashboard Application</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome to the Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            This is the dashboard micro frontend application built with Next.js, using shared
            components from the monorepo.
          </p>
          <div className="mb-4 p-4 bg-muted rounded-md">
            <p className="text-sm">
              <strong>Current User:</strong> {currentUser.name} ({currentUser.email})
            </p>
            <p className="text-sm">
              <strong>Role:</strong> {userRoleDisplay}
            </p>
            <p className="text-sm">
              <strong>Member Since:</strong> {formattedDate}
            </p>
          </div>
          <div className="flex gap-4">
            <Button>Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </Card>

        {/* Design Token Showcase */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Design Tokens Showcase</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary text-white rounded-md">
              <p className="text-sm font-semibold">Primary</p>
              <p className="text-xs">#2563eb</p>
            </div>
            <div className="p-4 bg-secondary text-white rounded-md">
              <p className="text-sm font-semibold">Secondary</p>
              <p className="text-xs">#7c3aed</p>
            </div>
            <div className="p-4 bg-accent text-white rounded-md">
              <p className="text-sm font-semibold">Accent</p>
              <p className="text-xs">#ec4899</p>
            </div>
            <div className="p-4 bg-success text-white rounded-md">
              <p className="text-sm font-semibold">Success</p>
              <p className="text-xs">#10b981</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm">
              Spacing tokens: xs, sm, md, lg, xl, <strong>2xl (new!)</strong>
            </p>
            <div className="flex gap-2xl items-center">
              <div className="w-4 h-4 bg-primary rounded"></div>
              <span className="text-sm">2xl spacing (3rem)</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Shared Components</h3>
            <p className="text-sm text-muted-foreground">
              Using Button and Card from @repo/ui package
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Shared Types</h3>
            <p className="text-sm text-muted-foreground">
              Using User and UserRole from @repo/shared-types
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Shared Utilities</h3>
            <p className="text-sm text-muted-foreground">
              Using formatDate and capitalize from @repo/shared-utils
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
