# @repo/eslint-config

Shared ESLint configurations for the monorepo.

## Configurations

### next.js

For Next.js applications. Extends Next.js core-web-vitals and TypeScript recommended rules.

**Usage:**

```js
// apps/dashboard/.eslintrc.js
module.exports = {
  root: true,
  extends: ['@repo/eslint-config/next'],
};
```

### react-internal.js

For React component packages and libraries within the monorepo.

**Usage:**

```js
// packages/ui/.eslintrc.js
module.exports = {
  root: true,
  extends: ['@repo/eslint-config/react-internal'],
};
```

### library.js

For non-React packages (utilities, types, configurations).

**Usage:**

```js
// packages/shared-utils/.eslintrc.js
module.exports = {
  root: true,
  extends: ['@repo/eslint-config/library'],
};
```

## Features

- TypeScript support with recommended rules
- React and React Hooks linting (where applicable)
- Next.js specific rules (for Next.js config)
- Prettier integration to avoid conflicts
- Consistent rules across the monorepo
- Unused variable detection with underscore prefix support

## Installation

This package is automatically available in the monorepo workspace. No separate installation needed.
