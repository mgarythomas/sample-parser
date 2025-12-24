import type { DesignToken, TailwindThemeExtension, TypographyValue } from './types';

export function transformTokens(tokens: DesignToken[]): TailwindThemeExtension {
  const theme: TailwindThemeExtension = {
    colors: {},
    spacing: {},
    fontSize: {},
    boxShadow: {},
    borderRadius: {},
    fontFamily: {},
  };

  tokens.forEach((token) => {
    switch (token.type) {
      case 'color':
        if (theme.colors && typeof token.value === 'string') {
          // Handle nested color names (e.g., "colour-border-default" -> "border-default")
          const colorName = token.name.replace(/^colour?[-_]/, '').replace(/[-_]/g, '-');
          theme.colors[colorName] = token.value;
        }
        break;

      case 'spacing':
        if (theme.spacing && typeof token.value === 'string') {
          // Handle nested spacing names
          const spacingName = token.name.replace(/^spacing[-_]/, '').replace(/[-_]/g, '-');
          theme.spacing[spacingName] = token.value;
        }
        break;

      case 'typography':
        if (theme.fontSize && typeof token.value === 'object') {
          const typographyValue = token.value as TypographyValue;
          // Handle nested typography names (e.g., "font-heading-xl" -> "heading-xl")
          const fontName = token.name.replace(/^font[-_]/, '').replace(/[-_]/g, '-');
          
          theme.fontSize[fontName] = [
            typographyValue.fontSize,
            {
              lineHeight: typographyValue.lineHeight,
              fontWeight: typographyValue.fontWeight,
              letterSpacing: typographyValue.letterSpacing,
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
          theme.boxShadow[shadowName] = token.value;
        }
        break;

      case 'borderRadius':
        if (theme.borderRadius && typeof token.value === 'string') {
          const radiusName = token.name.replace(/^(border-?radius|radii)[-_]/, '').replace(/[-_]/g, '-');
          theme.borderRadius[radiusName] = token.value;
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
