import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverContent, PopoverTrigger, Button, Input, Label } from '@repo/ui';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Dimensions</h4>
          <p className="text-sm text-muted-foreground">
            Set the dimensions for the layer.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Settings</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Profile Settings</h4>
            <p className="text-sm text-muted-foreground">
              Update your profile information.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                defaultValue="John Doe"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                defaultValue="john@example.com"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                defaultValue="@johndoe"
                className="col-span-2 h-8"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm">Save changes</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Positioning: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <p className="text-sm">This popover appears on top</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Right</Button>
        </PopoverTrigger>
        <PopoverContent side="right">
          <p className="text-sm">This popover appears on the right</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom">
          <p className="text-sm">This popover appears on the bottom</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Left</Button>
        </PopoverTrigger>
        <PopoverContent side="left">
          <p className="text-sm">This popover appears on the left</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const CustomWidth: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Narrow</Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <p className="text-sm">This is a narrow popover with limited width.</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Wide</Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <div className="space-y-2">
            <h4 className="font-medium">Wide Popover</h4>
            <p className="text-sm text-muted-foreground">
              This popover has more space to display detailed information and longer content.
              It can accommodate multiple lines of text and more complex layouts.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="destructive">Delete Item</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Are you sure?</h4>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the item.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const InfoPopover: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span>Hover for more info</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            ℹ️
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium">Additional Information</h4>
            <p className="text-sm text-muted-foreground">
              This feature allows you to perform advanced operations with your data.
              Click the info icon to learn more about specific functionality.
            </p>
            <div className="text-xs text-muted-foreground">
              Last updated: January 2024
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const MenuPopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Options ⋮</Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            📝 Edit
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            📋 Copy
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            📤 Share
          </Button>
          <div className="border-t my-1"></div>
          <Button variant="ghost" className="w-full justify-start text-destructive" size="sm">
            🗑️ Delete
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const NestedContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>View Details</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">User Profile</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>John Doe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>john@example.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Login:</span>
                <span>2 hours ago</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h5 className="font-medium mb-2 text-sm">Recent Activity</h5>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Updated profile settings</div>
              <div>• Created new project</div>
              <div>• Invited team member</div>
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm">Edit Profile</Button>
            <Button size="sm">Send Message</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};