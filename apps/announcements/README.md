# Announcements Application

This is the announcements micro frontend application built with Next.js 14 and the App Router.

## Features

- Built with Next.js 15 App Router
- Uses shared UI components from `@repo/ui`
- Styled with Tailwind CSS using shared configuration
- TypeScript for type safety
- Shared types from `@repo/shared-types`
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

The development server runs on port 3001 by default.

## Dependencies

This application depends on the following shared packages:

- `@repo/ui` - Shared UI components
- `@repo/tailwind-config` - Shared Tailwind configuration
- `@repo/typescript-config` - Shared TypeScript configuration
- `@repo/eslint-config` - Shared ESLint configuration
- `@repo/shared-types` - Shared TypeScript types
- `@repo/shared-utils` - Shared utility functions
