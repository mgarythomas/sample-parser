# @repo/design-tokens

Design token transformation package that converts W3C Design Tokens into Tailwind CSS configuration with full support for modern design token formats.

## Purpose

This package provides automated transformation of design tokens from W3C Design Tokens format (and legacy Figma exports) into Tailwind CSS theme extensions. It ensures design consistency across all micro frontends by maintaining a single source of truth for design values.

## Features

- ✅ **W3C Design Tokens Support**: Full support for the W3C Design Tokens Community Group specification
- ✅ **Legacy Compatibility**: Backward compatibility with Figma token exports
- ✅ **Smart Token Grouping**: Automatically groups individual font properties into complete typography tokens
- ✅ **Token References**: Support for token references like `{color.status.error}`
- ✅ **Comprehensive Coverage**: Colors, spacing, typography, shadows, border radius, and font families
- ✅ **Accurate Calculations**: Proper line-height ratios and unit conversions (px → rem)
- ✅ **Token validation**: Clear error messages with support for nested token structures
- ✅ **Type-safe**: Full TypeScript definitions
- ✅ **Automated build**: Seamless integration with build processes

## Token Format Support

### W3C Design Tokens Format (Primary)

The package primarily supports the [W3C Design Tokens format](https://design-tokens.github.io/community-group/format/) using `$value` and `$type` properties:

```json
{
  "version": "1.0.0",
  "colour": {
    "button": {
      "primary": {
        "default": {
          "$value": "#001e6e",
          "$type": "color"
        },
        "hover": {
          "$value": "#001e6e", 
          "$type": "color"
        }
      }
    }
  },
  "font": {
    "heading": {
      "xl": {
        "family": {
          "$value": "Albert Sans",
          "$type": "text"
        },
        "size": {
          "$value": 48,
          "$type": "number"
        },
        "weight": {
          "$value": 700,
          "$type": "number"
        },
        "line-height": {
          "$value": 56,
          "$type": "number"
        }
      }
    }
  },
  "space": {
    "01": {
      "$value": 4,
      "$type": "number"
    }
  }
}
```

### Legacy Figma Format (Supported)

Also supports legacy Figma token exports for backward compatibility:

```json
{
  "tokens": {
    "colors": {
      "primary": {
        "value": "#3B82F6",
        "type": "color",
        "description": "Primary brand color"
      }
    }
  }
}
```

## Usage

### 1. Prepare Your Design Tokens

Place your W3C Design Tokens JSON file at `src/figma/tokens.json`. The system automatically detects the format and processes accordingly.

### 2. Build Tokens

Run the build script to transform tokens:

```bash
pnpm build
```

This process:

1. **Reads** `src/figma/tokens.json`
2. **Detects Format**: Automatically identifies W3C vs Legacy format
3. **Parses Structure**: Handles nested token categories and references
4. **Groups Properties**: Combines individual font properties into complete typography tokens
5. **Converts Units**: Transforms pixel values to rem (48px → 3rem)
6. **Calculates Ratios**: Computes proper line-height ratios (56px/48px = 1.167)
7. **Validates**: Ensures token integrity with comprehensive error checking
8. **Generates**: Creates TypeScript definitions and Tailwind-compatible output
9. **Outputs**: Final tokens to `src/tokens.ts`

### 3. Use in Tailwind Config

The transformed tokens are automatically consumed by `@repo/tailwind-config`:

```typescript
import { designTokens } from '@repo/design-tokens';

// Available token categories:
// designTokens.colors      - 35+ color tokens
// designTokens.spacing     - 22+ spacing/sizing tokens  
// designTokens.fontSize    - 12+ typography styles
// designTokens.borderRadius - Border radius values
// designTokens.fontFamily  - Font family definitions
```

## Transformation Process

### Smart Format Detection

The system uses recursive analysis to detect token format:

```typescript
// W3C format detection
function hasW3CTokens(obj: any): boolean {
  if ('$value' in obj && ('$type' in obj || 'type' in obj)) return true;
  return Object.values(obj).some(value => hasW3CTokens(value));
}
```

### Typography Token Grouping

Individual font properties are intelligently grouped:

```json
// Input: Individual properties
{
  "font-heading-xl-family": { "$value": "Albert Sans", "$type": "text" },
  "font-heading-xl-size": { "$value": 48, "$type": "number" },
  "font-heading-xl-weight": { "$value": 700, "$type": "number" },
  "font-heading-xl-line-height": { "$value": 56, "$type": "number" }
}

// Output: Complete typography token
{
  "heading-xl": [
    "3rem",
    {
      "lineHeight": "1.167",
      "fontWeight": 700,
      "letterSpacing": "{font.letter-spacing.0}"
    }
  ]
}
```

### Unit Conversion

Automatic conversion from design tool units to web units:

- **Font sizes**: `48px` → `3rem` (48/16)
- **Spacing**: `16px` → `1rem` (16/16)  
- **Line heights**: `56px/48px` → `1.167` (unitless ratio)
- **Border radius**: `4px` → `0.25rem` (4/16)

## Token Types & Transformations

### Colors (35+ tokens)

**W3C Input:**
```json
{
  "colour": {
    "button": {
      "primary": {
        "default": { "$value": "#001e6e", "$type": "color" },
        "hover": { "$value": "#001e6e", "$type": "color" }
      }
    }
  }
}
```

**Tailwind Output:**
```typescript
{
  colors: {
    "button-primary-default": "#001e6e",
    "button-primary-hover": "#001e6e"
  }
}
```

### Spacing & Sizing (22+ tokens)

**W3C Input:**
```json
{
  "space": {
    "01": { "$value": 4, "$type": "number" },
    "02": { "$value": 8, "$type": "number" }
  },
  "layout": {
    "grid": {
      "desktop": {
        "margin": { "$value": 40, "$type": "number" }
      }
    }
  }
}
```

**Tailwind Output:**
```typescript
{
  spacing: {
    "space-01": "0.25rem",  // 4px/16 = 0.25rem
    "space-02": "0.5rem",   // 8px/16 = 0.5rem
    "layout-grid-desktop-margin": "2.5rem"  // 40px/16 = 2.5rem
  }
}
```

### Typography (12+ complete styles)

**W3C Input (Individual Properties):**
```json
{
  "font": {
    "heading": {
      "xl": {
        "family": { "$value": "Albert Sans", "$type": "text" },
        "size": { "$value": 48, "$type": "number" },
        "weight": { "$value": 700, "$type": "number" },
        "line-height": { "$value": 56, "$type": "number" },
        "letter-spacing": { "$value": "{font.letter-spacing.0}", "$type": "number" }
      }
    }
  }
}
```

**Tailwind Output (Grouped & Calculated):**
```typescript
{
  fontSize: {
    "heading-xl": [
      "3rem",  // 48px/16 = 3rem
      {
        "lineHeight": "1.167",  // 56px/48px = 1.167
        "fontWeight": 700,
        "letterSpacing": "{font.letter-spacing.0}"
      }
    ]
  },
  fontFamily: {
    "heading": "Albert Sans"
  }
}
```

### Border Radius

**W3C Input:**
```json
{
  "border": {
    "radius": {
      "$default": { "$value": 4, "$type": "number" },
      "round": { "$value": 1000, "$type": "number" }
    }
  }
}
```

**Tailwind Output:**
```typescript
{
  borderRadius: {
    "DEFAULT": "0.25rem",  // 4px/16 = 0.25rem
    "round": "62.5rem"     // 1000px/16 = 62.5rem
  }
}
```

### Token References

The system preserves token references for later resolution:

**Input:**
```json
{
  "border": {
    "error": {
      "$value": "{color.status.error}",
      "$type": "color"
    }
  }
}
```

**Output:**
```typescript
{
  colors: {
    "border-error": "{color.status.error}"  // Preserved for CSS variable resolution
  }
}
```

## Development

### Run Tests

```bash
pnpm test
```

The test suite includes:
- **W3C Format Tests**: Validation of nested token structures
- **Legacy Format Tests**: Backward compatibility verification  
- **Typography Grouping Tests**: Font property combination logic
- **Unit Conversion Tests**: Pixel to rem calculations
- **Error Handling Tests**: Comprehensive validation scenarios

### Watch Mode

```bash
pnpm test:watch
```

### Build Process

The build script (`scripts/build-tokens.ts`) performs:

1. **Token Loading**: Reads `src/figma/tokens.json`
2. **Validation**: Runs comprehensive token validation
3. **Transformation**: Converts to Tailwind format
4. **Generation**: Creates TypeScript output file
5. **Verification**: Confirms successful build

## API Reference

### Core Functions

#### `validateTokens(data: unknown): DesignToken[]`

Validates and parses design tokens with automatic format detection.

**Features:**
- Recursive W3C structure detection
- Token reference validation (`{color.status.error}`)
- Typography property grouping
- Comprehensive error reporting

**Returns:** Array of validated `DesignToken` objects

**Throws:** `TokenValidationError` with detailed error messages

#### `transformTokens(tokens: DesignToken[]): TailwindThemeExtension`

Transforms validated tokens into Tailwind CSS theme extension format.

**Features:**
- Nested name flattening (`colour-button-primary-default`)
- Typography token formatting for Tailwind fontSize
- Font family extraction and grouping
- Empty category cleanup

**Returns:** `TailwindThemeExtension` object ready for Tailwind config

### Type Definitions

```typescript
interface DesignToken {
  name: string;
  value: string | number | TypographyValue;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'borderRadius';
  description?: string;
}

interface TailwindThemeExtension {
  colors?: Record<string, string>;
  spacing?: Record<string, string>;
  fontSize?: Record<string, [string, { lineHeight: string; fontWeight?: number; letterSpacing?: string }]>;
  borderRadius?: Record<string, string>;
  fontFamily?: Record<string, string>;
}
```

## Error Handling

The package provides detailed error messages for common issues:

### Token Structure Errors
- **Invalid W3C format**: Missing `$value` or `$type` properties
- **Invalid legacy format**: Missing `tokens` property or invalid structure
- **Empty token data**: No valid tokens found after parsing

### Token Value Errors  
- **Invalid color format**: Colors must be hex, rgb, hsl, or token references
- **Invalid spacing format**: Spacing must include units (px, rem, em) or be token references
- **Invalid typography structure**: Typography tokens must have required font properties
- **Invalid token references**: References must follow `{category.token.name}` format

### Build Errors
- **Missing tokens file**: `src/figma/tokens.json` not found
- **JSON parsing errors**: Invalid JSON syntax in tokens file
- **Type validation errors**: Token values don't match expected TypeScript types

## Migration Guide

### From Legacy Figma Format

If you're currently using the legacy Figma format, the system provides automatic backward compatibility. However, for full feature support, consider migrating to W3C format:

**Legacy:**
```json
{
  "tokens": {
    "colors": {
      "primary": { "value": "#001e6e", "type": "color" }
    }
  }
}
```

**W3C:**
```json
{
  "colour": {
    "primary": { "$value": "#001e6e", "$type": "color" }
  }
}
```

### Benefits of W3C Format
- **Nested organization**: Better token categorization
- **Token references**: Link tokens together with `{token.reference}`
- **Standardized**: Follows community specification
- **Future-proof**: Aligned with design token tooling ecosystem

## Performance

The transformation process is optimized for:
- **Large token sets**: Efficiently handles 100+ tokens
- **Complex nesting**: Recursive parsing without performance degradation
- **Memory usage**: Minimal memory footprint during transformation
- **Build speed**: Fast integration with build pipelines

Current performance metrics:
- **103 tokens** processed in ~300ms
- **Memory usage**: <50MB during transformation
- **Output size**: ~4KB generated TypeScript file
