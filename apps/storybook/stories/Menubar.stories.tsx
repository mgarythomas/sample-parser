import type { Meta, StoryObj } from '@storybook/react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@repo/ui';

const meta = {
  title: 'Components/Menubar',
  component: Menubar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Search the web</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Find...</MenubarItem>
              <MenubarItem>Find Next</MenubarItem>
              <MenubarItem>Find Previous</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>Always Show Full URLs</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem inset>
            Reload <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled inset>
            Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Toggle Fullscreen</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Hide Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const Simple: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Home</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Dashboard</MenubarItem>
          <MenubarItem>Profile</MenubarItem>
          <MenubarItem>Settings</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Products</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>All Products</MenubarItem>
          <MenubarItem>Categories</MenubarItem>
          <MenubarItem>Featured</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>About</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Company</MenubarItem>
          <MenubarItem>Team</MenubarItem>
          <MenubarItem>Contact</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithRadioGroups: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Layout</MenubarLabel>
          <MenubarRadioGroup value="grid">
            <MenubarRadioItem value="list">List View</MenubarRadioItem>
            <MenubarRadioItem value="grid">Grid View</MenubarRadioItem>
            <MenubarRadioItem value="card">Card View</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarLabel>Sort By</MenubarLabel>
          <MenubarRadioGroup value="name">
            <MenubarRadioItem value="name">Name</MenubarRadioItem>
            <MenubarRadioItem value="date">Date</MenubarRadioItem>
            <MenubarRadioItem value="size">Size</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Options</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Show Hidden Files</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show File Extensions</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>Auto-save</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const ApplicationMenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Document <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Open... <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Recent Files</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Document1.pdf</MenubarItem>
              <MenubarItem>Presentation.pptx</MenubarItem>
              <MenubarItem>Spreadsheet.xlsx</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Clear Recent</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Save <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Save As...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Export <MenubarShortcut>⌘E</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Export As</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>PNG</MenubarItem>
              <MenubarItem>JPEG</MenubarItem>
              <MenubarItem>SVG</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Select All <MenubarShortcut>⌘A</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Find <MenubarShortcut>⌘F</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Replace <MenubarShortcut>⌘H</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Show Toolbar</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show Sidebar</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>Show Status Bar</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value="100">
            <MenubarRadioItem value="50">50% Zoom</MenubarRadioItem>
            <MenubarRadioItem value="75">75% Zoom</MenubarRadioItem>
            <MenubarRadioItem value="100">100% Zoom</MenubarRadioItem>
            <MenubarRadioItem value="125">125% Zoom</MenubarRadioItem>
            <MenubarRadioItem value="150">150% Zoom</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem>
            Full Screen <MenubarShortcut>F11</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Documentation</MenubarItem>
          <MenubarItem>Keyboard Shortcuts</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Report Bug</MenubarItem>
          <MenubarItem>Feature Request</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>About</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WebsiteNavigation: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Products</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Categories</MenubarLabel>
          <MenubarItem>Electronics</MenubarItem>
          <MenubarItem>Clothing</MenubarItem>
          <MenubarItem>Books</MenubarItem>
          <MenubarItem>Home & Garden</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>All Products</MenubarItem>
          <MenubarItem>New Arrivals</MenubarItem>
          <MenubarItem>Best Sellers</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      <MenubarMenu>
        <MenubarTrigger>Services</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Consulting</MenubarItem>
          <MenubarItem>Support</MenubarItem>
          <MenubarItem>Training</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Enterprise</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Custom Solutions</MenubarItem>
              <MenubarItem>Dedicated Support</MenubarItem>
              <MenubarItem>SLA Options</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      
      <MenubarMenu>
        <MenubarTrigger>Resources</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Documentation</MenubarItem>
          <MenubarItem>API Reference</MenubarItem>
          <MenubarItem>Tutorials</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Blog</MenubarItem>
          <MenubarItem>Case Studies</MenubarItem>
          <MenubarItem>Webinars</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      <MenubarMenu>
        <MenubarTrigger>Company</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>About Us</MenubarItem>
          <MenubarItem>Team</MenubarItem>
          <MenubarItem>Careers</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Press</MenubarItem>
          <MenubarItem>Contact</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const MinimalMenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Menu</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Home</MenubarItem>
          <MenubarItem>About</MenubarItem>
          <MenubarItem>Contact</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};