# @repo/tailwind-config

Shared Tailwind CSS configuration package that provides consistent styling across all micro frontends.

## Purpose

This package provides a centralised Tailwind CSS configuration that:

- Extends Tailwind's default theme with design tokens
- Ensures consistent styling across all applications
- Simplifies Tailwind configuration in individual apps
- Automatically integrates with design tokens from `@repo/design-tokens`

## Usage

### In Next.js Applications

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import baseConfig from '@repo/tailwind-config';

const config: Config = {
  ...baseConfig,
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'],
};

export default config;
```

### In Shared Packages

```typescript
// packages/ui/tailwind.config.ts
import type { Config } from 'tailwindcss';
import baseConfig from '@repo/tailwind-config';

const config: Config = {
  ...baseConfig,
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
};

export default config;
```

## What's Included

### Design Tokens

All design tokens from `@repo/design-tokens` are automatically included:

- Colors
- Spacing
- Typography
- Shadows
- Border radius

### Base Configuration

The base configuration includes:

- Tailwind CSS defaults
- Design token extensions
- Common plugins (if any)

## Content Paths

When using this config, always include the UI package in your content paths to ensure Tailwind can purge unused styles correctly:

```typescript
content: [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
  '../../packages/ui/src/**/*.{js,ts,jsx,tsx}', // Important!
],
```

## Customisation

You can extend or override the base configuration in your app:

```typescript
import baseConfig from '@repo/tailwind-config';

const config: Config = {
  ...baseConfig,
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      // Your custom extensions
      colors: {
        ...baseConfig.theme?.extend?.colors,
        custom: '#FF0000',
      },
    },
  },
};

export default config;
```

## Design Token Updates

When design tokens are updated:

1. Rebuild the design-tokens package:

   ```bash
   pnpm --filter design-tokens build
   ```

2. Rebuild this package:

   ```bash
   pnpm --filter tailwind-config build
   ```

3. Rebuild dependent packages:
   ```bash
   pnpm turbo build --filter=...tailwind-config
   ```

All applications will automatically use the updated tokens.

## Development

This package doesn't require a build step unless you're making changes to the base configuration structure.

## Dependencies

- `@repo/design-tokens` - Design token source
- `tailwindcss` - Tailwind CSS framework
