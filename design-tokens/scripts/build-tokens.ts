import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { validateTokens } from '../src/validators';
import { transformTokens } from '../src/transform';
import { generateCSSVariables, generateCSSString } from '../src/css-variables';

function main() {
  try {
    console.log('🔨 Building design tokens...');

    // Read tokens.json
    const tokensPath = join(__dirname, '../src/figma/tokens.json');
    const tokensData = JSON.parse(readFileSync(tokensPath, 'utf-8'));

    // Validate tokens
    console.log('✓ Validating tokens...');
    const tokens = validateTokens(tokensData);
    console.log(`✓ Found ${tokens.length} valid tokens`);

    // Transform tokens
    console.log('✓ Transforming tokens to Tailwind format...');
    const tailwindTheme = transformTokens(tokens);

    // Generate CSS variables
    console.log('✓ Generating CSS variables...');
    const cssVariables = generateCSSVariables(tokens);
    const cssString = generateCSSString(cssVariables);

    // Generate TypeScript file
    const outputPath = join(__dirname, '../out/tokens.ts');
    const output = `// This file is auto-generated. Do not edit manually.
import type { TailwindThemeExtension } from './types';

export const designTokens: TailwindThemeExtension = ${JSON.stringify(tailwindTheme, null, 2)};
`;

    // Ensure out directory exists
    const outDir = join(__dirname, '../out');
    if (!require('fs').existsSync(outDir)) {
      require('fs').mkdirSync(outDir, { recursive: true });
    }

    writeFileSync(outputPath, output, 'utf-8');
    console.log('✓ Generated tokens.ts');

    // Generate CSS file
    const cssOutputPath = join(__dirname, '../out/variables.css');
    writeFileSync(cssOutputPath, cssString, 'utf-8');
    console.log('✓ Generated variables.css');

    console.log('✅ Design tokens built successfully!');
  } catch (error) {
    console.error('❌ Error building design tokens:', error);
    process.exit(1);
  }
}

main();
