# @repo/shared-types

Shared TypeScript types and interfaces used across the monorepo.

## Purpose

This package provides common type definitions that ensure type safety and consistency across all micro frontends and shared packages. It serves as a single source of truth for domain models, API contracts, and common utility types.

## Features

- ✅ Domain model types (User, Announcement, Auth)
- ✅ API request and response types
- ✅ Common utility types
- ✅ Type-safe across package boundaries
- ✅ Zero runtime overhead

## Usage

Import types in any package or application:

```typescript
import { User, UserRole, ApiResponse } from '@repo/shared-types';

const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const response: ApiResponse<User> = {
  data: user,
  status: 200,
  message: 'Success',
};
```

## Available Types

### Domain Models

#### User Types

```typescript
import { User, UserRole } from '@repo/shared-types';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}
```

#### Announcement Types

```typescript
import { Announcement, AnnouncementStatus } from '@repo/shared-types';

interface Announcement {
  id: string;
  title: string;
  content: string;
  status: AnnouncementStatus;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
```

#### Auth Types

```typescript
import { AuthToken, LoginCredentials } from '@repo/shared-types';

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}
```

### API Types

#### Response Types

```typescript
import { ApiResponse, PaginatedResponse, ApiError } from '@repo/shared-types';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}
```

#### Request Types

```typescript
import { PaginationParams, SortParams } from '@repo/shared-types';

interface PaginationParams {
  page: number;
  pageSize: number;
}

interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}
```

### Common Utility Types

```typescript
import { Nullable, Optional, ID } from '@repo/shared-types';

type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type ID = string;
```

## Adding New Types

1. Create a new file in the appropriate directory:
   - `src/models/` for domain models
   - `src/api/` for API-related types
   - `src/common/` for utility types

2. Define your types:

```typescript
// src/models/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FOOD = 'food',
}
```

3. Export from the appropriate index file:

```typescript
// src/models/index.ts
export * from './product';
```

4. The types are now available:

```typescript
import { Product, ProductCategory } from '@repo/shared-types';
```

## Best Practices

### Use Interfaces for Objects

```typescript
// ✅ Good
export interface User {
  id: string;
  name: string;
}

// ❌ Avoid
export type User = {
  id: string;
  name: string;
};
```

### Use Enums for Fixed Sets

```typescript
// ✅ Good
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// ❌ Avoid
export type UserRole = 'admin' | 'user';
```

### Document Complex Types

```typescript
/**
 * Represents a paginated API response
 * @template T The type of items in the response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### Keep Types Focused

Each file should contain related types. Don't create a single file with all types.

## Development

This package doesn't require a build step. TypeScript will use the source files directly.

### Type Checking

```bash
pnpm type-check
```

## Dependencies

This package has no runtime dependencies, only TypeScript as a dev dependency.
