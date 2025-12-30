import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Calendar } from '@repo/ui';

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multiple', 'range'],
    },
    showOutsideDays: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mode: 'single',
    showOutsideDays: true,
  },
};

export const SingleSelection: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <div className="text-sm text-muted-foreground">
          Selected: {date ? date.toLocaleDateString() : 'None'}
        </div>
      </div>
    );
  },
};

export const MultipleSelection: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[] | undefined>([]);
    
    return (
      <div className="space-y-4">
        <Calendar
          mode="multiple"
          selected={dates}
          onSelect={setDates}
          className="rounded-md border"
        />
        <div className="text-sm text-muted-foreground">
          Selected dates: {dates?.length || 0}
          {dates && dates.length > 0 && (
            <ul className="mt-2 space-y-1">
              {dates.map((date, index) => (
                <li key={index}>• {date.toLocaleDateString()}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
};

export const RangeSelection: Story = {
  render: () => {
    const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
      from: undefined,
      to: undefined,
    });
    
    return (
      <div className="space-y-4">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          className="rounded-md border"
        />
        <div className="text-sm text-muted-foreground">
          {range.from && (
            <div>
              From: {range.from.toLocaleDateString()}
              {range.to && <div>To: {range.to.toLocaleDateString()}</div>}
              {range.from && range.to && (
                <div className="mt-1 font-medium">
                  Duration: {Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const WithoutOutsideDays: Story = {
  args: {
    mode: 'single',
    showOutsideDays: false,
    className: 'rounded-md border',
  },
};

export const DisabledDates: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    
    // Disable weekends
    const isWeekend = (date: Date) => {
      const day = date.getDay();
      return day === 0 || day === 6;
    };
    
    // Disable past dates
    const isPastDate = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    };
    
    return (
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(date) => isPastDate(date) || isWeekend(date)}
          className="rounded-md border"
        />
        <div className="text-sm text-muted-foreground">
          <p>Weekends and past dates are disabled</p>
          {date && <p>Selected: {date.toLocaleDateString()}</p>}
        </div>
      </div>
    );
  },
};

export const CustomStyling: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border shadow-lg"
        classNames={{
          day_button: 'hover:bg-accent hover:text-accent-foreground',
          selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
          today: 'bg-accent text-accent-foreground font-bold',
        }}
      />
    );
  },
};

export const MultipleMonths: Story = {
  render: () => {
    const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
      from: undefined,
      to: undefined,
    });
    
    return (
      <div className="space-y-4">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          className="rounded-md border"
        />
        <div className="text-sm text-muted-foreground">
          {range.from && range.to && (
            <p>
              Selected range: {range.from.toLocaleDateString()} - {range.to.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  },
};

export const BookingCalendar: Story = {
  render: () => {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    
    // Mock booked dates
    const bookedDates = [
      new Date(2024, 0, 15),
      new Date(2024, 0, 16),
      new Date(2024, 0, 22),
      new Date(2024, 0, 23),
    ];
    
    const isBooked = (date: Date) => {
      return bookedDates.some(bookedDate => 
        bookedDate.toDateString() === date.toDateString()
      );
    };
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Hotel Booking Calendar</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select your check-in and check-out dates. Red dates are unavailable.
          </p>
        </div>
        
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={setSelectedDates}
          disabled={isBooked}
          className="rounded-md border"
          classNames={{
            disabled: 'text-red-500 line-through opacity-50',
          }}
        />
        
        <div className="text-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Unavailable</span>
            </div>
          </div>
          {selectedDates.length > 0 && (
            <div className="text-muted-foreground">
              Selected dates: {selectedDates.length}
            </div>
          )}
        </div>
      </div>
    );
  },
};