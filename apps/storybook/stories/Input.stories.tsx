import type { Meta, StoryObj } from '@storybook/react';
import { Input, Label } from '@repo/ui';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Pre-filled value',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};

export const WithLabelAndDescription: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="username">Username</Label>
      <Input type="text" id="username" placeholder="Enter your username" />
      <p className="text-sm text-muted-foreground">This is your public display name.</p>
    </div>
  ),
};

export const Form: Story = {
  render: () => (
    <form className="w-full max-w-sm space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" placeholder="John Doe" />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="email-form">Email</Label>
        <Input type="email" id="email-form" placeholder="john@example.com" />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password-form">Password</Label>
        <Input type="password" id="password-form" placeholder="••••••••" />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input type="tel" id="phone" placeholder="+1 (555) 000-0000" />
      </div>
    </form>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <Input placeholder="Default size" />
      <Input placeholder="With custom width" className="w-64" />
      <Input placeholder="Full width" className="w-full" />
    </div>
  ),
};

export const FileInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  ),
};
