import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { DatePicker } from '@repo/ui';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Pick a date',
  },
};

export const WithPreselectedDate: Story = {
  args: {
    date: new Date(),
    placeholder: 'Pick a date',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Select your birthday',
  },
};

export const CustomWidth: Story = {
  args: {
    placeholder: 'Pick a date',
    className: 'w-[200px]',
  },
};

export const Interactive: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    
    return (
      <div className="space-y-4">
        <DatePicker
          date={date}
          onDateChange={setDate}
          placeholder="Select a date"
        />
        <div className="text-sm text-muted-foreground">
          Selected date: {date ? date.toLocaleDateString() : 'None'}
        </div>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    
    return (
      <form className="space-y-4 w-full max-w-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <DatePicker
            date={startDate}
            onDateChange={setStartDate}
            placeholder="Select start date"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <DatePicker
            date={endDate}
            onDateChange={setEndDate}
            placeholder="Select end date"
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          {startDate && endDate && (
            <p>
              Duration: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          )}
        </div>
      </form>
    );
  },
};

export const MultipleInstances: Story = {
  render: () => {
    const [birthDate, setBirthDate] = useState<Date | undefined>();
    const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
    const [reminderDate, setReminderDate] = useState<Date | undefined>();
    
    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Birth</label>
            <DatePicker
              date={birthDate}
              onDateChange={setBirthDate}
              placeholder="Select your birthday"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Appointments</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Next Appointment</label>
            <DatePicker
              date={appointmentDate}
              onDateChange={setAppointmentDate}
              placeholder="Schedule appointment"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Reminders</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Set Reminder</label>
            <DatePicker
              date={reminderDate}
              onDateChange={setReminderDate}
              placeholder="Set reminder date"
            />
          </div>
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Compact</label>
        <DatePicker
          placeholder="Pick date"
          className="w-[200px]"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Default</label>
        <DatePicker
          placeholder="Pick a date"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Wide</label>
        <DatePicker
          placeholder="Select your preferred date"
          className="w-[350px]"
        />
      </div>
    </div>
  ),
};