import type { Meta, StoryObj } from '@storybook/react';
import { Label, Input, Checkbox } from '@repo/ui';

const meta = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label text',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="required-field">
        Full Name <span className="text-red-500">*</span>
      </Label>
      <Input type="text" id="required-field" placeholder="Enter your full name" />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="username">Username</Label>
      <Input type="text" id="username" placeholder="Enter username" />
      <p className="text-xs text-muted-foreground">
        This will be your public display name.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="disabled-input" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Disabled Field
      </Label>
      <Input type="text" id="disabled-input" placeholder="Disabled input" disabled />
    </div>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="error-input" className="text-destructive">
        Email Address
      </Label>
      <Input 
        type="email" 
        id="error-input" 
        placeholder="Enter email" 
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-xs text-destructive">Please enter a valid email address.</p>
    </div>
  ),
};

export const FormLabels: Story = {
  render: () => (
    <form className="w-full max-w-sm space-y-4">
      <div className="grid items-center gap-1.5">
        <Label htmlFor="first-name">First Name</Label>
        <Input type="text" id="first-name" placeholder="John" />
      </div>
      
      <div className="grid items-center gap-1.5">
        <Label htmlFor="last-name">Last Name</Label>
        <Input type="text" id="last-name" placeholder="Doe" />
      </div>
      
      <div className="grid items-center gap-1.5">
        <Label htmlFor="email-form">Email</Label>
        <Input type="email" id="email-form" placeholder="john@example.com" />
      </div>
      
      <div className="grid items-center gap-1.5">
        <Label htmlFor="phone">Phone Number</Label>
        <Input type="tel" id="phone" placeholder="+1 (555) 000-0000" />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="newsletter-signup" />
        <Label htmlFor="newsletter-signup">Subscribe to newsletter</Label>
      </div>
    </form>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="small" className="text-xs">Small Label</Label>
        <Input type="text" id="small" placeholder="Small input" className="h-8 text-xs" />
      </div>
      
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="default">Default Label</Label>
        <Input type="text" id="default" placeholder="Default input" />
      </div>
      
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="large" className="text-base font-semibold">Large Label</Label>
        <Input type="text" id="large" placeholder="Large input" className="h-12 text-base" />
      </div>
    </div>
  ),
};