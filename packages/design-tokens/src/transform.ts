import type { DesignToken, TailwindThemeExtension, TypographyValue } from './types';

// Token reference resolution map for missing or undefined references
const TOKEN_REFERENCE_MAP: Record<string, string | number> = {
  '{font.letter-spacing.0}': '0',
  '{border.width.none}': '0',
  '{border.radius.none}': '0',
  '{space.0}': '0',
  '{color.status.error}': '#e90932', // Reference to existing token
};

function resolveTokenReference(value: string | number, tokenMap: Map<string, DesignToken>): string | number {
  if (typeof value !== 'string') return value;
  
  // Check if it's a token reference
  const referenceMatch = value.match(/^\{(.+)\}$/);
  if (!referenceMatch) return value;
  
  const referencePath = referenceMatch[1];
  
  // First check our hardcoded reference map
  if (TOKEN_REFERENCE_MAP[value]) {
    return TOKEN_REFERENCE_MAP[value];
  }
  
  // Try to find the referenced token in our token map
  const referencedToken = tokenMap.get(referencePath);
  if (referencedToken) {
    // Recursively resolve in case the referenced token also has references
    return resolveTokenReference(referencedToken.value, tokenMap);
  }
  
  // If we can't resolve it, return the original value (this will show the issue)
  console.warn(`⚠️  Could not resolve token reference: ${value}`);
  return value;
}

export function transformTokens(tokens: DesignToken[]): TailwindThemeExtension {
  const theme: TailwindThemeExtension = {
    colors: {},
    spacing: {},
    fontSize: {},
    boxShadow: {},
    borderRadius: {},
    fontFamily: {},
  };

  // Create a map for token reference resolution
  const tokenMap = new Map<string, DesignToken>();
  tokens.forEach(token => {
    tokenMap.set(token.name, token);
  });

  tokens.forEach((token) => {
    switch (token.type) {
      case 'color':
        if (theme.colors && typeof token.value === 'string') {
          // Handle nested color names (e.g., "colour-border-default" -> "border-default")
          const colorName = token.name.replace(/^colour?[-_]/, '').replace(/[-_]/g, '-');
          const resolvedValue = resolveTokenReference(token.value, tokenMap);
          theme.colors[colorName] = resolvedValue as string;
        }
        break;

      case 'spacing':
        if (theme.spacing && typeof token.value === 'string') {
          // Handle nested spacing names
          const spacingName = token.name.replace(/^spacing[-_]/, '').replace(/[-_]/g, '-');
          const resolvedValue = resolveTokenReference(token.value, tokenMap);
          theme.spacing[spacingName] = resolvedValue as string;
        }
        break;

      case 'typography':
        if (theme.fontSize && typeof token.value === 'object') {
          const typographyValue = token.value as TypographyValue;
          // Handle nested typography names (e.g., "font-heading-xl" -> "heading-xl")
          const fontName = token.name.replace(/^font[-_]/, '').replace(/[-_]/g, '-');
          
          // Resolve letter spacing reference
          const resolvedLetterSpacing = resolveTokenReference(typographyValue.letterSpacing, tokenMap);
          
          theme.fontSize[fontName] = [
            typographyValue.fontSize,
            {
              lineHeight: typographyValue.lineHeight,
              fontWeight: typographyValue.fontWeight,
              letterSpacing: resolvedLetterSpacing as string,
            },
          ];

          // Also add font family if not already present
          if (theme.fontFamily && typographyValue.fontFamily) {
            const familyKey = fontName.split('-')[0] || fontName;
            if (!theme.fontFamily[familyKey]) {
              theme.fontFamily[familyKey] = typographyValue.fontFamily;
            }
          }
        }
        break;

      case 'shadow':
        if (theme.boxShadow && typeof token.value === 'string') {
          const shadowName = token.name.replace(/^shadow[-_]/, '').replace(/[-_]/g, '-');
          const resolvedValue = resolveTokenReference(token.value, tokenMap);
          theme.boxShadow[shadowName] = resolvedValue as string;
        }
        break;

      case 'borderRadius':
        if (theme.borderRadius && typeof token.value === 'string') {
          let radiusName = token.name.replace(/^(border-?radius|radii)[-_]/, '').replace(/[-_]/g, '-');
          // Handle special case for $default key
          if (radiusName === '$default') {
            radiusName = 'DEFAULT';
          }
          const resolvedValue = resolveTokenReference(token.value, tokenMap);
          theme.borderRadius[radiusName] = resolvedValue as string;
        }
        break;
    }
  });

  // Remove empty objects
  if (Object.keys(theme.colors || {}).length === 0) delete theme.colors;
  if (Object.keys(theme.spacing || {}).length === 0) delete theme.spacing;
  if (Object.keys(theme.fontSize || {}).length === 0) delete theme.fontSize;
  if (Object.keys(theme.boxShadow || {}).length === 0) delete theme.boxShadow;
  if (Object.keys(theme.borderRadius || {}).length === 0) delete theme.borderRadius;
  if (Object.keys(theme.fontFamily || {}).length === 0) delete theme.fontFamily;

  return theme;
}
