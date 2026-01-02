import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@repo/ui/components/textarea';

const meta = {
    title: 'Components/Textarea',
    component: Textarea,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        placeholder: 'Type your message here.',
    },
};

export const Disabled: Story = {
    args: {
        placeholder: 'Type your message here.',
        disabled: true,
    },
};

export const WithLabel: Story = {
    render: () => (
        <div className="grid w-full gap-1.5">
            <label htmlFor="message-2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Your message</label>
            <Textarea placeholder="Type your message here." id="message-2" />
            <p className="text-sm text-muted-foreground">
                Your message will be copied to the support team.
            </p>
        </div>
    ),
};
