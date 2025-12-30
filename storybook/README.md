# Storybook

Component documentation and development environment for the shared UI component library.

## Overview

This Storybook application provides an interactive environment for developing, testing, and documenting the shared UI components from `@repo/ui`. It uses the same Tailwind configuration and design tokens as the micro frontend applications, ensuring visual consistency.

## Getting Started

### Development

Run Storybook in development mode:

```bash
pnpm dev
```

This will start Storybook on [http://localhost:6006](http://localhost:6006).

### Build

Build a static version of Storybook:

```bash
pnpm build
```

The static site will be generated in the `storybook-static` directory.

## Features

- **Component Documentation**: All shared UI components are documented with interactive examples
- **Design Token Integration**: Uses the same Tailwind configuration and design tokens as the apps
- **Interactive Controls**: Modify component props in real-time using Storybook controls
- **Multiple Variants**: Each component showcases all available variants and states
- **Accessibility**: Components can be tested for accessibility compliance

## Structure

```
apps/storybook/
├── .storybook/          # Storybook configuration
│   ├── main.ts          # Main configuration
│   └── preview.ts       # Global decorators and parameters
├── stories/             # Component stories
│   ├── Button.stories.tsx
│   ├── Card.stories.tsx
│   └── Input.stories.tsx
└── styles/
    └── globals.css      # Tailwind CSS imports
```

## Adding New Stories

To add a story for a new component:

1. Create a new file in the `stories/` directory: `ComponentName.stories.tsx`
2. Import the component from `@repo/ui`
3. Define the story metadata and variants

Example:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from '@repo/ui';

const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

## Scripts

- `pnpm dev` - Start Storybook development server
- `pnpm build` - Build static Storybook site
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
