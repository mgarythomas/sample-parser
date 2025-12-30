import type { DesignToken, CSSVariables } from './types';

// Mapping from our design token colors to shadcn semantic color names
const COLOR_MAPPING: Record<string, string> = {
  // Primary colors - using button primary as the main primary color
  'button-primary-default': 'primary',
  'text-inverse': 'primary-foreground',
  
  // Secondary colors - using button secondary  
  'button-secondary-default': 'secondary',
  'text-primary': 'secondary-foreground',
  
  // Background colors
  'background-default': 'background',
  'text-primary': 'foreground',
  
  // Card colors - using layer colors for cards
  'layer-default': 'card',
  'text-primary': 'card-foreground',
  
  // Popover colors - same as card
  'layer-default': 'popover',
  'text-primary': 'popover-foreground',
  
  // Muted colors
  'background-subtle': 'muted',
  'text-secondary': 'muted-foreground',
  
  // Accent colors - using layer hover for accent
  'layer-hover': 'accent',
  'text-primary': 'accent-foreground',
  
  // Destructive colors
  'status-error': 'destructive',
  'text-inverse': 'destructive-foreground',
  
  // Border and input colors
  'border-default': 'border',
  'border-subtle': 'input', // Use subtle border for inputs
  'border-active': 'ring',
};

/**
 * Convert hex color to HSL format expected by shadcn
 * @param hex - Hex color string (e.g., "#ff0000")
 * @returns HSL string without hsl() wrapper (e.g., "0 100% 50%")
 */
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

/**
 * Generate CSS custom properties from design tokens
 * Maps design token colors to shadcn semantic color names
 */
export function generateCSSVariables(tokens: DesignToken[]): CSSVariables {
  const cssVars: CSSVariables = {};
  
  // Create maps of available tokens by type
  const colorTokens = new Map<string, string>();
  const spacingTokens = new Map<string, string>();
  const borderRadiusTokens = new Map<string, string>();
  
  tokens.forEach(token => {
    if (token.type === 'color' && typeof token.value === 'string') {
      colorTokens.set(token.name, token.value);
    } else if (token.type === 'spacing' && typeof token.value === 'string') {
      spacingTokens.set(token.name, token.value);
    } else if (token.type === 'borderRadius' && typeof token.value === 'string') {
      borderRadiusTokens.set(token.name, token.value);
    }
  });
  
  // Map colors to semantic names
  const colorMappings: Record<string, string> = {
    'primary': 'colour-button-primary-default',
    'primary-foreground': 'colour-text-inverse',
    'secondary': 'colour-button-secondary-default', 
    'secondary-foreground': 'colour-text-primary',
    'background': 'colour-background-default',
    'foreground': 'colour-text-primary',
    'card': 'colour-layer-default',
    'card-foreground': 'colour-text-primary',
    'popover': 'colour-layer-default',
    'popover-foreground': 'colour-text-primary',
    'muted': 'colour-background-subtle',
    'muted-foreground': 'colour-text-secondary',
    'accent': 'colour-layer-hover',
    'accent-foreground': 'colour-text-primary',
    'destructive': 'colour-status-error',
    'destructive-foreground': 'colour-text-inverse',
    'border': 'colour-border-default',
    'input': 'colour-border-subtle',
    'ring': 'colour-border-active',
  };
  
  // Generate CSS variables for colors
  Object.entries(colorMappings).forEach(([semantic, tokenName]) => {
    if (colorTokens.has(tokenName)) {
      const hexValue = colorTokens.get(tokenName)!;
      const hslValue = hexToHsl(hexValue);
      cssVars[`--${semantic}`] = hslValue;
    }
  });
  
  // Set border radius from design tokens
  const radiusToken = tokens.find(t => 
    t.name === 'border-radius-DEFAULT' && t.type === 'borderRadius'
  );
  if (radiusToken && typeof radiusToken.value === 'string') {
    cssVars['--radius'] = radiusToken.value;
  } else {
    cssVars['--radius'] = '0.5rem'; // fallback
  }
  
  // Map spacing tokens to common spacing variables
  const spacingMappings: Record<string, string> = {
    'spacing-xs': 'space-01',      // 0.25rem
    'spacing-sm': 'space-02',      // 0.5rem  
    'spacing-md': 'space-04',      // 1rem
    'spacing-lg': 'space-06',      // 2rem
    'spacing-xl': 'space-08',      // 3rem
    'spacing-2xl': 'space-09',     // 4rem
  };
  
  Object.entries(spacingMappings).forEach(([semantic, tokenName]) => {
    if (spacingTokens.has(tokenName)) {
      cssVars[`--${semantic}`] = spacingTokens.get(tokenName)!;
    }
  });
  
  // Set font family from design tokens
  const fontFamilyToken = tokens.find(t => t.name === 'font-family-heading');
  if (fontFamilyToken && typeof fontFamilyToken.value === 'string') {
    cssVars['--font-sans'] = `"${fontFamilyToken.value}", sans-serif`;
    cssVars['--font-heading'] = `"${fontFamilyToken.value}", sans-serif`;
  } else {
    // Fallback to Albert Sans from our design tokens
    cssVars['--font-sans'] = '"Albert Sans", sans-serif';
    cssVars['--font-heading'] = '"Albert Sans", sans-serif';
  }
  
  return cssVars;
}

/**
 * Generate CSS string from CSS variables
 */
export function generateCSSString(cssVars: CSSVariables): string {
  const lightVars = Object.entries(cssVars)
    .map(([key, value]) => `    ${key}: ${value};`)
    .join('\n');
    
  // For dark mode, we'll use the same values for now
  // In the future, this could be extended to support dark mode variants
  const darkVars = lightVars;
  
  return `@layer base {
  :root {
${lightVars}
  }

  .dark {
${darkVars}
  }
}`;
}