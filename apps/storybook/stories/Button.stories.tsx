import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@repo/ui';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    asChild: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Icon: Story = {
  args: {
    children: '🚀',
    size: 'icon',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex gap-2 items-center">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">🚀</Button>
      </div>
    </div>
  ),
};

export const ShadcnIntegrationTest: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 font-sans">
      <h3 className="text-2xl font-bold font-heading">Shadcn Components with Design Tokens</h3>
      
      {/* Test standard shadcn Button variants */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold font-heading">Button Variants (using semantic colors)</h4>
        <div className="flex gap-2 flex-wrap">
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
      </div>
      
      {/* Test different sizes */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold font-heading">Button Sizes</h4>
        <div className="flex gap-2 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🚀</Button>
        </div>
      </div>
      
      {/* Test semantic color classes directly */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold font-heading">Semantic Color Classes</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-md bg-primary text-primary-foreground rounded">
            Primary Background (padding: var(--spacing-md))
          </div>
          <div className="p-md bg-secondary text-secondary-foreground rounded">
            Secondary Background (padding: var(--spacing-md))
          </div>
          <div className="p-lg bg-muted text-muted-foreground rounded">
            Muted Background (padding: var(--spacing-lg))
          </div>
          <div className="p-sm bg-accent text-accent-foreground rounded">
            Accent Background (padding: var(--spacing-sm))
          </div>
          <div className="p-md bg-destructive text-destructive-foreground rounded">
            Destructive Background (padding: var(--spacing-md))
          </div>
          <div className="p-xl bg-card text-card-foreground border rounded">
            Card Background (padding: var(--spacing-xl))
          </div>
        </div>
      </div>
      
      {/* Test spacing system */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold font-heading">Design Token Spacing System</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-xs">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm">gap-xs (0.25rem)</span>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm">gap-sm (0.5rem)</span>
          </div>
          <div className="flex items-center gap-md">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm">gap-md (1rem)</span>
          </div>
          <div className="flex items-center gap-lg">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm">gap-lg (2rem)</span>
          </div>
          <div className="flex items-center gap-xl">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm">gap-xl (3rem)</span>
          </div>
        </div>
      </div>
      
      {/* Test typography system */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold font-heading">Typography System</h4>
        <div className="space-y-2">
          <p className="font-sans text-sm">Body text using font-sans (Albert Sans)</p>
          <h5 className="font-heading text-xl font-bold">Heading using font-heading (Albert Sans)</h5>
          <p className="text-muted-foreground">Muted text with design token color</p>
        </div>
      </div>
      
      {/* Show current CSS variable values */}
      <div className="space-y-2">
        <h4 className="text-lg font-semibold font-heading">Current CSS Variables</h4>
        <div className="text-sm font-mono bg-muted p-md rounded space-y-1">
          <div><strong>Colors:</strong></div>
          <div>--primary: <span className="text-primary">■</span> (Design Token: button-primary-default)</div>
          <div>--secondary: <span className="text-secondary">■</span> (Design Token: button-secondary-default)</div>
          <div>--destructive: <span className="text-destructive">■</span> (Design Token: status-error)</div>
          
          <div className="mt-2"><strong>Spacing:</strong></div>
          <div>--spacing-xs: 0.25rem | --spacing-sm: 0.5rem | --spacing-md: 1rem</div>
          <div>--spacing-lg: 2rem | --spacing-xl: 3rem | --spacing-2xl: 4rem</div>
          
          <div className="mt-2"><strong>Typography:</strong></div>
          <div>--font-sans: "Albert Sans", sans-serif</div>
          <div>--font-heading: "Albert Sans", sans-serif</div>
        </div>
      </div>
    </div>
  ),
};
