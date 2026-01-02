# @repo/ui

Shared UI component library using shadcn components for the micro frontend monorepo.

## Overview

This package contains all shared UI components built with shadcn, styled with Tailwind CSS, and using design tokens from `@repo/design-tokens`.

## Installation

This package is part of the monorepo and uses workspace dependencies:

```bash
pnpm install
```

## Usage

Import components in your Next.js applications:

```tsx
import { Button, Card } from '@repo/ui';

export default function Page() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

## Adding New Components

To add a new shadcn component:

```bash
cd packages/ui
pnpm dlx shadcn-ui@latest add <component-name>
```

Then export the component in `src/index.ts`:

```typescript
export { ComponentName } from './components/component-name';
```

## Development

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build

# Watch mode
pnpm dev
```

## Structure

```
packages/ui/
├── src/
│   ├── components/       # shadcn components
│   ├── lib/
│   │   └── utils.ts      # cn() utility
│   ├── styles/
│   │   └── globals.css   # Tailwind CSS with CSS variables
│   └── index.ts          # Public exports
├── components.json       # shadcn configuration
├── tailwind.config.ts    # Extends shared Tailwind config
├── tsconfig.json
└── package.json
```

## Dependencies

- `@repo/tailwind-config`: Shared Tailwind configuration with design tokens
- `clsx`: Utility for constructing className strings
- `tailwind-merge`: Merge Tailwind CSS classes without conflicts
- `class-variance-authority`: For component variants

## Peer Dependencies

- `react`: ^18.0.0
- `react-dom`: ^18.0.0
