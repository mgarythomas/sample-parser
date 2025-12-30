import { describe, it, expect } from 'vitest';
import { validateTokens, TokenValidationError } from '../validators';
import type { FigmaTokenExport, W3CTokensFile } from '../types';

describe('validateTokens', () => {
  describe('W3C Design Tokens format', () => {
    it('should validate color tokens correctly', () => {
      const data: W3CTokensFile = {
        version: '1.0.0',
        color: {
          primary: {
            $value: '#3b82f6',
            $type: 'color',
            $description: 'Primary color',
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        name: 'color-primary',
        value: '#3b82f6',
        type: 'color',
        description: 'Primary color',
      });
    });

    it('should validate spacing tokens correctly', () => {
      const data: W3CTokensFile = {
        space: {
          sm: {
            $value: 8,
            $type: 'dimension',
          },
          md: {
            $value: 16,
            $type: 'spacing',
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('spacing');
      expect(tokens[0].value).toBe('0.5rem'); // 8/16 = 0.5rem
      expect(tokens[1].type).toBe('spacing');
      expect(tokens[1].value).toBe('1rem'); // 16/16 = 1rem
    });

    it('should validate nested color tokens correctly', () => {
      const data: W3CTokensFile = {
        colour: {
          button: {
            primary: {
              default: {
                $value: '#001e6e',
                $type: 'color',
              },
              hover: {
                $value: '#001e6e',
                $type: 'color',
              },
            },
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(2);
      expect(tokens[0].name).toBe('colour-button-primary-default');
      expect(tokens[1].name).toBe('colour-button-primary-hover');
      expect(tokens[0].type).toBe('color');
    });

    it('should validate font tokens correctly', () => {
      const data: W3CTokensFile = {
        font: {
          heading: {
            xl: {
              family: {
                $value: 'Albert Sans',
                $type: 'text',
              },
              size: {
                $value: 48,
                $type: 'number',
              },
              weight: {
                $value: 700,
                $type: 'number',
              },
            },
          },
        },
      };

      // Individual font properties with 'text' and 'number' types are now handled correctly
      // The validator should process these tokens successfully
      const result = validateTokens(data);
      expect(result).toHaveLength(1); // Combined into one typography token
      expect(result[0].type).toBe('typography'); // Combined font properties become typography
    });

    it('should validate border radius tokens correctly', () => {
      const data: W3CTokensFile = {
        border: {
          radius: {
            sm: {
              $value: 4,
              $type: 'borderRadius',
            },
            full: {
              $value: 1000,
              $type: 'borderRadius',
            },
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('borderRadius');
      expect(tokens[0].value).toBe('0.25rem'); // 4/16 = 0.25rem
      expect(tokens[1].value).toBe('62.5rem'); // 1000/16 = 62.5rem
    });

    it('should validate multiple token types together', () => {
      const data: W3CTokensFile = {
        color: {
          primary: { $value: '#3b82f6', $type: 'color' },
        },
        space: {
          sm: { $value: 8, $type: 'dimension' },
        },
        border: {
          radius: {
            md: { $value: 8, $type: 'borderRadius' },
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(3);
    });
  });

  describe('Legacy Figma format', () => {
    it('should validate color tokens correctly', () => {
      const data: FigmaTokenExport = {
        tokens: {
          colors: {
            primary: {
              value: '#3b82f6',
              type: 'color',
              description: 'Primary color',
            },
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        name: 'primary',
        value: '#3b82f6',
        type: 'color',
        description: 'Primary color',
      });
    });

    it('should validate spacing tokens correctly', () => {
      const data: FigmaTokenExport = {
        tokens: {
          spacing: {
            sm: {
              value: '0.5rem',
              type: 'spacing',
            },
            md: {
              value: '16px',
              type: 'spacing',
            },
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('spacing');
      expect(tokens[1].type).toBe('spacing');
    });

    it('should validate typography tokens correctly', () => {
      const data: FigmaTokenExport = {
        tokens: {
          typography: {
            heading: {
              value: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '2rem',
                fontWeight: 700,
                lineHeight: '2.5rem',
                letterSpacing: '-0.02em',
              },
              type: 'typography',
            },
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('typography');
      expect(tokens[0].value).toHaveProperty('fontFamily');
    });

    it('should validate shadow tokens correctly', () => {
      const data: FigmaTokenExport = {
        tokens: {
          shadows: {
            sm: {
              value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              type: 'shadow',
            },
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('shadow');
    });

    it('should validate border radius tokens correctly', () => {
      const data: FigmaTokenExport = {
        tokens: {
          radii: {
            sm: {
              value: '0.25rem',
              type: 'borderRadius',
            },
            full: {
              value: '9999px',
              type: 'borderRadius',
            },
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('borderRadius');
    });

    it('should validate multiple token types together', () => {
      const data: FigmaTokenExport = {
        tokens: {
          colors: {
            primary: { value: '#3b82f6', type: 'color' },
          },
          spacing: {
            sm: { value: '0.5rem', type: 'spacing' },
          },
          radii: {
            md: { value: '0.5rem', type: 'borderRadius' },
          },
        },
      };

      const tokens = validateTokens(data);
      expect(tokens).toHaveLength(3);
    });
  });

  describe('invalid token structures', () => {
    it('should throw error for non-object data', () => {
      expect(() => validateTokens(null)).toThrow(TokenValidationError);
      expect(() => validateTokens(null)).toThrow('Token data must be an object');
    });

    it('should throw error for empty W3C tokens', () => {
      // Create a structure that looks like W3C but has no actual valid tokens
      const data = { 
        version: '1.0.0',
        colors: {
          invalid: {
            $value: 'not-a-color',
            $type: 'unknown-type'
          }
        }
      };
      expect(() => validateTokens(data)).toThrow(TokenValidationError);
      expect(() => validateTokens(data)).toThrow('No valid tokens found');
    });

    it('should throw error for missing tokens property in Figma format', () => {
      // Force it to be treated as Figma format by not having W3C structure
      const data = { notTokens: {} };
      expect(() => validateTokens(data)).toThrow(TokenValidationError);
      expect(() => validateTokens(data)).toThrow('Token data must have a "tokens" property');
    });

    it('should throw error for empty tokens in Figma format', () => {
      const data = { tokens: {} };
      expect(() => validateTokens(data)).toThrow(TokenValidationError);
      expect(() => validateTokens(data)).toThrow('No valid tokens found');
    });

    it('should throw error for invalid W3C color format', () => {
      const data: W3CTokensFile = {
        color: {
          invalid: { $value: 'not-a-color', $type: 'color' },
        },
      };

      expect(() => validateTokens(data)).toThrow(TokenValidationError);
      expect(() => validateTokens(data)).toThrow('invalid color format');
    });

    it('should throw error for invalid color format in Figma format', () => {
      const data: FigmaTokenExport = {
        tokens: {
          colors: {
            invalid: { value: 'not-a-color', type: 'color' },
          },
        },
      };

      expect(() => validateTokens(data)).toThrow(TokenValidationError);
      expect(() => validateTokens(data)).toThrow('invalid color format');
    });

    it('should throw error for invalid spacing format in Figma format', () => {
      const data: FigmaTokenExport = {
        tokens: {
          spacing: {
            invalid: { value: '10', type: 'spacing' },
          },
        },
      };

      expect(() => validateTokens(data)).toThrow(TokenValidationError);
      expect(() => validateTokens(data)).toThrow('invalid spacing format');
    });

    it('should throw error for invalid typography value', () => {
      const data: FigmaTokenExport = {
        tokens: {
          typography: {
            invalid: {
              value: 'not-an-object' as any,
              type: 'typography',
            },
          },
        },
      };

      expect(() => validateTokens(data)).toThrow(TokenValidationError);
      expect(() => validateTokens(data)).toThrow('valid typography value object');
    });

    it('should throw error for typography missing required fields', () => {
      const data: FigmaTokenExport = {
        tokens: {
          typography: {
            invalid: {
              value: {
                fontFamily: 'Inter',
                fontSize: '1rem',
                // Missing fontWeight and lineHeight
              } as any,
              type: 'typography',
            },
          },
        },
      };

      expect(() => validateTokens(data)).toThrow(TokenValidationError);
    });

    it('should throw error for non-string color value', () => {
      const data: FigmaTokenExport = {
        tokens: {
          colors: {
            invalid: { value: 123 as any, type: 'color' },
          },
        },
      };

      expect(() => validateTokens(data)).toThrow(TokenValidationError);
      expect(() => validateTokens(data)).toThrow('must have a string value');
    });
  });

  describe('validation error messages', () => {
    it('should provide clear error message for invalid token type', () => {
      const data = {
        tokens: {
          colors: {
            test: { value: '#ff0000', type: 'invalid-type' as any },
          },
        },
      };

      expect(() => validateTokens(data)).toThrow('Unknown token type');
    });

    it('should include token name in error messages', () => {
      const data: FigmaTokenExport = {
        tokens: {
          colors: {
            'my-color': { value: 'invalid', type: 'color' },
          },
        },
      };

      expect(() => validateTokens(data)).toThrow('my-color');
    });
  });
});
