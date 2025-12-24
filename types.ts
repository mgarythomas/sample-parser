export interface DesignToken {
  name: string;
  value: string | number | TypographyValue;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'borderRadius';
  category?: string;
  description?: string;
}

export interface TypographyValue {
  fontFamily: string;
  fontSize: string;
  fontWeight: string | number;
  lineHeight: string;
  letterSpacing?: string;
}

export interface TailwindThemeExtension {
  colors?: Record<string, string>;
  spacing?: Record<string, string>;
  fontSize?: Record<
    string,
    [string, { lineHeight: string; fontWeight?: string | number; letterSpacing?: string }]
  >;
  boxShadow?: Record<string, string>;
  borderRadius?: Record<string, string>;
  fontFamily?: Record<string, string>;
}

// W3C Design Tokens format
export interface W3CDesignToken {
  $value: string | number | W3CTypographyValue;
  $type: string;
  $description?: string;
}

export interface W3CTypographyValue {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
}

export interface W3CTokensFile {
  version?: string;
  [category: string]: any; // Allow for nested token categories
}

// Legacy Figma format (for backward compatibility)
export interface FigmaTokenExport {
  version?: string;
  tokens: {
    colors?: Record<string, ColorToken>;
    spacing?: Record<string, SpacingToken>;
    typography?: Record<string, TypographyToken>;
    shadows?: Record<string, ShadowToken>;
    radii?: Record<string, RadiusToken>;
  };
}

export interface ColorToken {
  value: string;
  type: 'color';
  description?: string;
}

export interface SpacingToken {
  value: string;
  type: 'spacing';
  description?: string;
}

export interface TypographyToken {
  value: TypographyValue;
  type: 'typography';
  description?: string;
}

export interface ShadowToken {
  value: string;
  type: 'shadow';
  description?: string;
}

export interface RadiusToken {
  value: string;
  type: 'borderRadius';
  description?: string;
}
