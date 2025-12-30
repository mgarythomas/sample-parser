import type { Config } from 'tailwindcss';
import baseConfig from '@repo/tailwind-config';

const config: Config = {
  ...baseConfig,
  content: ['./stories/**/*.{js,ts,jsx,tsx}', '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'],
};

export default config;
