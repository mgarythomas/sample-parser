import type { DesignToken, FigmaTokenExport, TypographyValue, W3CTokensFile, W3CDesignToken, W3CTypographyValue } from './types';

export class TokenValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenValidationError';
  }
}

function isTypographyValue(value: unknown): value is TypographyValue {
  if (typeof value !== 'object' || value === null) return false;
  const tv = value as Record<string, unknown>;
  return (
    typeof tv.fontFamily === 'string' &&
    typeof tv.fontSize === 'string' &&
    (typeof tv.fontWeight === 'string' || typeof tv.fontWeight === 'number') &&
    typeof tv.lineHeight === 'string' &&
    (tv.letterSpacing === undefined || typeof tv.letterSpacing === 'string')
  );
}

function isW3CTypographyValue(value: unknown): value is W3CTypographyValue {
  if (typeof value !== 'object' || value === null) return false;
  const tv = value as Record<string, unknown>;
  return (
    typeof tv.fontFamily === 'string' &&
    typeof tv.fontSize === 'number' &&
    typeof tv.fontWeight === 'number' &&
    typeof tv.lineHeight === 'number' &&
    (tv.letterSpacing === undefined || typeof tv.letterSpacing === 'number')
  );
}

function validateTokenValue(token: DesignToken): void {
  const { type, value } = token;

  switch (type) {
    case 'color':
      if (typeof value !== 'string') {
        throw new TokenValidationError(`Color token "${token.name}" must have a string value`);
      }
      // Allow token references (e.g., "{color.status.error}") or valid color formats
      if (!/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$|^rgb|^hsl|^\{[^}]+\}$/.test(value)) {
        throw new TokenValidationError(
          `Color token "${token.name}" has invalid color format: ${value}`
        );
      }
      break;

    case 'spacing':
      if (typeof value !== 'string') {
        throw new TokenValidationError(`Spacing token "${token.name}" must have a string value`);
      }
      // Allow token references (e.g., "{space.0}") or valid spacing formats
      if (!/^\d+(\.\d+)?(px|rem|em)$|^\{[^}]+\}$/.test(value)) {
        throw new TokenValidationError(
          `Spacing token "${token.name}" has invalid spacing format: ${value}`
        );
      }
      break;

    case 'typography':
      if (!isTypographyValue(value)) {
        throw new TokenValidationError(
          `Typography token "${token.name}" must have a valid typography value object`
        );
      }
      break;

    case 'shadow':
      if (typeof value !== 'string') {
        throw new TokenValidationError(`Shadow token "${token.name}" must have a string value`);
      }
      break;

    case 'borderRadius':
      if (typeof value !== 'string') {
        throw new TokenValidationError(
          `Border radius token "${token.name}" must have a string value`
        );
      }
      // Allow token references (e.g., "{border.radius.none}") or valid border radius formats
      if (!/^\d+(\.\d+)?(px|rem|em|%)$|^\{[^}]+\}$/.test(value)) {
        throw new TokenValidationError(
          `Border radius token "${token.name}" has invalid format: ${value}`
        );
      }
      break;

    default:
      throw new TokenValidationError(`Unknown token type: ${type}`);
  }
}

// Parse W3C Design Tokens format
function parseW3CTokens(data: W3CTokensFile, prefix = ''): DesignToken[] {
  const tokens: DesignToken[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key === 'version') return; // Skip version field

    const tokenName = prefix ? `${prefix}-${key}` : key;

    if (value && typeof value === 'object' && (('$value' in value && '$type' in value) || ('$value' in value && 'type' in value))) {
      // This is a token (handle both $type and type for backward compatibility)
      const token = value as W3CDesignToken & { type?: string };
      const tokenType = token.$type || token.type;
      const designToken = convertW3CToken(tokenName, { ...token, $type: tokenType });
      if (designToken) {
        tokens.push(designToken);
      }
    } else if (value && typeof value === 'object' && !('$value' in value)) {
      // This is a nested category, recurse
      tokens.push(...parseW3CTokens(value, tokenName));
    }
  });

  return tokens;
}

function convertW3CToken(name: string, token: W3CDesignToken): DesignToken | null {
  const { $value, $type, $description } = token;

  switch ($type) {
    case 'color':
      return {
        name,
        value: $value as string,
        type: 'color',
        description: $description,
      };

    case 'dimension':
    case 'spacing':
      // Convert number to rem if it's a number
      const spacingValue = typeof $value === 'number' ? `${$value / 16}rem` : $value as string;
      return {
        name,
        value: spacingValue,
        type: 'spacing',
        description: $description,
      };

    case 'typography':
      if (isW3CTypographyValue($value)) {
        const typographyValue: TypographyValue = {
          fontFamily: $value.fontFamily,
          fontSize: `${$value.fontSize / 16}rem`,
          fontWeight: $value.fontWeight,
          lineHeight: `${$value.lineHeight / 16}rem`,
          letterSpacing: $value.letterSpacing ? `${$value.letterSpacing}em` : undefined,
        };
        return {
          name,
          value: typographyValue,
          type: 'typography',
          description: $description,
        };
      }
      break;

    case 'shadow':
      return {
        name,
        value: $value as string,
        type: 'shadow',
        description: $description,
      };

    case 'borderRadius':
      const radiusValue = typeof $value === 'number' ? `${$value / 16}rem` : $value as string;
      return {
        name,
        value: radiusValue,
        type: 'borderRadius',
        description: $description,
      };

    // Handle other types that might be in the tokens but don't map to our design token types
    case 'text':
    case 'number':
      // These are individual properties, not full design tokens
      // For now, we'll skip them as they're handled differently in the current structure
      return null;
  }

  return null;
}

// Legacy Figma format parser
function parseFigmaTokens(data: FigmaTokenExport): DesignToken[] {
  const tokens: DesignToken[] = [];
  const { colors, spacing, typography, shadows, radii } = data.tokens;

  if (colors) {
    Object.entries(colors).forEach(([name, token]) => {
      tokens.push({
        name,
        value: token.value,
        type: token.type as any, // Use the actual type from the token
        description: token.description,
      });
    });
  }

  if (spacing) {
    Object.entries(spacing).forEach(([name, token]) => {
      tokens.push({
        name,
        value: token.value,
        type: token.type as any, // Use the actual type from the token
        description: token.description,
      });
    });
  }

  if (typography) {
    Object.entries(typography).forEach(([name, token]) => {
      tokens.push({
        name,
        value: token.value,
        type: token.type as any, // Use the actual type from the token
        description: token.description,
      });
    });
  }

  if (shadows) {
    Object.entries(shadows).forEach(([name, token]) => {
      tokens.push({
        name,
        value: token.value,
        type: token.type as any, // Use the actual type from the token
        description: token.description,
      });
    });
  }

  if (radii) {
    Object.entries(radii).forEach(([name, token]) => {
      tokens.push({
        name,
        value: token.value,
        type: token.type as any, // Use the actual type from the token
        description: token.description,
      });
    });
  }

  return tokens;
}

export function validateTokens(data: unknown): DesignToken[] {
  if (typeof data !== 'object' || data === null) {
    throw new TokenValidationError('Token data must be an object');
  }

  let tokens: DesignToken[] = [];

  // Recursive function to check for W3C structure
  function hasW3CTokens(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    // Check if this object has $value and ($type or type)
    if ('$value' in obj && ('$type' in obj || 'type' in obj)) return true;
    
    // Recursively check all values
    return Object.values(obj).some(value => hasW3CTokens(value));
  }

  // Check if it's W3C format (has nested structure with $value/$type)
  const hasW3CStructure = Object.entries(data).some(([key, value]) => {
    if (key === 'version') return false; // Skip version field
    return hasW3CTokens(value);
  });

  if (hasW3CStructure) {
    // Parse as W3C Design Tokens format
    tokens = parseW3CTokens(data as W3CTokensFile);
  } else {
    // Parse as legacy Figma format
    const tokenExport = data as FigmaTokenExport;
    if (!tokenExport.tokens || typeof tokenExport.tokens !== 'object') {
      throw new TokenValidationError('Token data must have a "tokens" property');
    }
    tokens = parseFigmaTokens(tokenExport);
  }

  if (tokens.length === 0) {
    throw new TokenValidationError('No valid tokens found in token data');
  }

  tokens.forEach(validateTokenValue);

  return tokens;
}
