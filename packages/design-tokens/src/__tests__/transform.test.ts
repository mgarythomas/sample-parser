import { describe, it, expect } from 'vitest';
import { transformTokens } from '../transform';
import type { DesignToken } from '../types';

describe('transformTokens', () => {
  describe('color transformation', () => {
    it('should transform color tokens to Tailwind format', () => {
      const tokens: DesignToken[] = [
        { name: 'primary', value: '#3b82f6', type: 'color' },
        { name: 'secondary', value: '#8b5cf6', type: 'color' },
      ];

      const result = transformTokens(tokens);

      expect(result.colors).toEqual({
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      });
    });

    it('should handle hex colors with alpha', () => {
      const tokens: DesignToken[] = [
        { name: 'transparent-blue', value: '#3b82f680', type: 'color' },
      ];

      const result = transformTokens(tokens);

      expect(result.colors).toEqual({
        'transparent-blue': '#3b82f680',
      });
    });

    it('should handle rgb and hsl colors', () => {
      const tokens: DesignToken[] = [
        { name: 'rgb-color', value: 'rgb(59, 130, 246)', type: 'color' },
        { name: 'hsl-color', value: 'hsl(217, 91%, 60%)', type: 'color' },
      ];

      const result = transformTokens(tokens);

      expect(result.colors).toEqual({
        'rgb-color': 'rgb(59, 130, 246)',
        'hsl-color': 'hsl(217, 91%, 60%)',
      });
    });
  });

  describe('spacing transformation', () => {
    it('should transform spacing tokens to Tailwind format', () => {
      const tokens: DesignToken[] = [
        { name: 'xs', value: '0.25rem', type: 'spacing' },
        { name: 'sm', value: '0.5rem', type: 'spacing' },
        { name: 'md', value: '1rem', type: 'spacing' },
      ];

      const result = transformTokens(tokens);

      expect(result.spacing).toEqual({
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
      });
    });

    it('should handle different spacing units', () => {
      const tokens: DesignToken[] = [
        { name: 'px-spacing', value: '16px', type: 'spacing' },
        { name: 'rem-spacing', value: '1rem', type: 'spacing' },
        { name: 'em-spacing', value: '1.5em', type: 'spacing' },
      ];

      const result = transformTokens(tokens);

      expect(result.spacing).toEqual({
        'px-spacing': '16px',
        'rem-spacing': '1rem',
        'em-spacing': '1.5em',
      });
    });
  });

  describe('typography transformation', () => {
    it('should transform typography tokens to Tailwind fontSize format', () => {
      const tokens: DesignToken[] = [
        {
          name: 'heading-lg',
          value: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: '2.5rem',
            letterSpacing: '-0.02em',
          },
          type: 'typography',
        },
      ];

      const result = transformTokens(tokens);

      expect(result.fontSize).toEqual({
        'heading-lg': [
          '2rem',
          {
            lineHeight: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
        ],
      });
    });

    it('should extract font families from typography tokens', () => {
      const tokens: DesignToken[] = [
        {
          name: 'heading-lg',
          value: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: '2.5rem',
          },
          type: 'typography',
        },
        {
          name: 'body',
          value: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: '1.5rem',
          },
          type: 'typography',
        },
      ];

      const result = transformTokens(tokens);

      expect(result.fontFamily).toEqual({
        heading: 'Inter, sans-serif',
        body: 'Roboto, sans-serif',
      });
    });

    it('should handle typography without letterSpacing', () => {
      const tokens: DesignToken[] = [
        {
          name: 'body',
          value: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: '1.5rem',
          },
          type: 'typography',
        },
      ];

      const result = transformTokens(tokens);

      expect(result.fontSize).toEqual({
        body: [
          '1rem',
          {
            lineHeight: '1.5rem',
            fontWeight: 400,
            letterSpacing: undefined,
          },
        ],
      });
    });

    it('should handle string fontWeight', () => {
      const tokens: DesignToken[] = [
        {
          name: 'text',
          value: {
            fontFamily: 'Inter',
            fontSize: '1rem',
            fontWeight: 'bold',
            lineHeight: '1.5rem',
          },
          type: 'typography',
        },
      ];

      const result = transformTokens(tokens);

      expect(result.fontSize?.text[1].fontWeight).toBe('bold');
    });
  });

  describe('shadow transformation', () => {
    it('should transform shadow tokens to Tailwind boxShadow format', () => {
      const tokens: DesignToken[] = [
        { name: 'sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', type: 'shadow' },
        {
          name: 'md',
          value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          type: 'shadow',
        },
      ];

      const result = transformTokens(tokens);

      expect(result.boxShadow).toEqual({
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      });
    });
  });

  describe('border radius transformation', () => {
    it('should transform border radius tokens to Tailwind format', () => {
      const tokens: DesignToken[] = [
        { name: 'sm', value: '0.25rem', type: 'borderRadius' },
        { name: 'md', value: '0.5rem', type: 'borderRadius' },
        { name: 'full', value: '9999px', type: 'borderRadius' },
      ];

      const result = transformTokens(tokens);

      expect(result.borderRadius).toEqual({
        sm: '0.25rem',
        md: '0.5rem',
        full: '9999px',
      });
    });

    it('should handle percentage border radius', () => {
      const tokens: DesignToken[] = [{ name: 'half', value: '50%', type: 'borderRadius' }];

      const result = transformTokens(tokens);

      expect(result.borderRadius).toEqual({
        half: '50%',
      });
    });
  });

  describe('mixed token types', () => {
    it('should transform multiple token types correctly', () => {
      const tokens: DesignToken[] = [
        { name: 'primary', value: '#3b82f6', type: 'color' },
        { name: 'sm', value: '0.5rem', type: 'spacing' },
        {
          name: 'heading',
          value: {
            fontFamily: 'Inter',
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: '2.5rem',
          },
          type: 'typography',
        },
        { name: 'shadow-sm', value: '0 1px 2px rgba(0,0,0,0.05)', type: 'shadow' },
        { name: 'rounded', value: '0.5rem', type: 'borderRadius' },
      ];

      const result = transformTokens(tokens);

      expect(result.colors).toBeDefined();
      expect(result.spacing).toBeDefined();
      expect(result.fontSize).toBeDefined();
      expect(result.boxShadow).toBeDefined();
      expect(result.borderRadius).toBeDefined();
    });
  });

  describe('empty token handling', () => {
    it('should return empty object for empty token array', () => {
      const tokens: DesignToken[] = [];
      const result = transformTokens(tokens);

      expect(result).toEqual({});
    });

    it('should not include empty categories', () => {
      const tokens: DesignToken[] = [{ name: 'primary', value: '#3b82f6', type: 'color' }];

      const result = transformTokens(tokens);

      expect(result.colors).toBeDefined();
      expect(result.spacing).toBeUndefined();
      expect(result.fontSize).toBeUndefined();
      expect(result.boxShadow).toBeUndefined();
      expect(result.borderRadius).toBeUndefined();
    });
  });
});
