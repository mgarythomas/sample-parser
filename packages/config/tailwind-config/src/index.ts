import type { Config } from 'tailwindcss';
import baseConfig from './base';

// Import design tokens
// Note: This requires the design-tokens package to be built first
// Run: pnpm --filter @repo/design-tokens build
let designTokens: Record<string, any> = {};

try {
  // Dynamic import to handle cases where tokens haven't been generated yet
  const tokens = require('@repo/design-tokens/tokens');
  designTokens = tokens.designTokens || {};
} catch (error) {
  console.warn(
    '⚠️  Design tokens not found. Run "pnpm --filter @repo/design-tokens build" to generate them.'
  );
}

/**
 * Shared Tailwind CSS configuration with design tokens
 *
 * This configuration merges the base Tailwind config with design tokens
 * from the @repo/design-tokens package.
 *
 * Usage in applications:
 * ```typescript
 * import baseConfig from '@repo/tailwind-config';
 *
 * export default {
 *   ...baseConfig,
 *   content: [
 *     './src/**\/*.{js,ts,jsx,tsx}',
 *     '../../packages/ui/src/**\/*.{js,ts,jsx,tsx}',
 *   ],
 * } satisfies Config;
 * ```
 */
const config: Omit<Config, 'content'> = {
  ...baseConfig,
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      ...designTokens,
    },
  },
};

export default config;

/**
 * Helper function to merge additional theme extensions with the base config
 * This allows applications to add their own custom theme values
 */
export function withTheme(themeExtensions: Record<string, any>): Omit<Config, 'content'> {
  return {
    ...config,
    theme: {
      ...config.theme,
      extend: {
        ...config.theme?.extend,
        ...themeExtensions,
      },
    },
  };
}
