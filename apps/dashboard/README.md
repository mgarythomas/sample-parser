# Dashboard Application

This is the dashboard micro frontend application built with Next.js 14 and the App Router.

## Features

- Built with Next.js 14 App Router
- Uses shared UI components from `@repo/ui`
- Styled with Tailwind CSS using shared configuration
- TypeScript with shared type definitions
- Shared utilities from `@repo/shared-utils`

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type check
pnpm type-check
```

## Dependencies

- `@repo/ui` - Shared UI component library
- `@repo/tailwind-config` - Shared Tailwind CSS configuration
- `@repo/shared-types` - Shared TypeScript types
- `@repo/shared-utils` - Shared utility functions
- `@repo/typescript-config` - Shared TypeScript configuration
- `@repo/eslint-config` - Shared ESLint configuration

## Port

The dashboard application runs on port 3000 by default.
