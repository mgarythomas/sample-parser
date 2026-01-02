import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  Checkbox,
} from '@repo/ui';

const meta = {
  title: 'Components/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

interface ProfileFormData {
  username: string;
  email: string;
  bio: string;
  marketing: boolean;
}

export const Default: Story = {
  render: () => {
    const form = useForm<ProfileFormData>({
      defaultValues: {
        username: '',
        email: '',
        bio: '',
        marketing: false,
      },
    });

    function onSubmit(data: ProfileFormData) {
      console.log(data);
      alert('Form submitted! Check console for data.');
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormDescription>
                  We'll never share your email with anyone else.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="marketing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Marketing emails
                  </FormLabel>
                  <FormDescription>
                    Receive emails about new products, features, and more.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    );
  },
};

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export const LoginForm: Story = {
  render: () => {
    const form = useForm<LoginFormData>({
      defaultValues: {
        email: '',
        password: '',
        remember: false,
      },
    });

    function onSubmit(data: LoginFormData) {
      console.log(data);
      alert('Login attempted! Check console for data.');
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    Remember me
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          
          <div className="text-center text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary">
              Forgot your password?
            </a>
          </div>
        </form>
      </Form>
    );
  },
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
}

export const ContactForm: Story = {
  render: () => {
    const form = useForm<ContactFormData>({
      defaultValues: {
        name: '',
        email: '',
        subject: '',
        message: '',
        newsletter: false,
      },
    });

    function onSubmit(data: ContactFormData) {
      console.log(data);
      alert('Message sent! Check console for data.');
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Contact Us</h1>
            <p className="text-muted-foreground">
              Send us a message and we'll get back to you
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="subject"
            rules={{ required: 'Subject is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="What's this about?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            rules={{
              required: 'Message is required',
              minLength: {
                value: 10,
                message: 'Message must be at least 10 characters',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us more..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Please provide as much detail as possible.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="newsletter"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Subscribe to newsletter
                  </FormLabel>
                  <FormDescription>
                    Get updates about new features and announcements.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </Form>
    );
  },
};

export const ValidationExample: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        requiredField: '',
        emailField: '',
        numberField: '',
        minLengthField: '',
      },
    });

    function onSubmit(data: any) {
      console.log(data);
      alert('Form is valid! Check console for data.');
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-bold">Validation Examples</h1>
            <p className="text-sm text-muted-foreground">
              Try submitting with invalid data to see validation errors
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="requiredField"
            rules={{ required: 'This field is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Field *</FormLabel>
                <FormControl>
                  <Input placeholder="Cannot be empty" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="emailField"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Validation *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Must be valid email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="numberField"
            rules={{
              required: 'Number is required',
              pattern: {
                value: /^\d+$/,
                message: 'Please enter only numbers',
              },
              min: {
                value: 1,
                message: 'Number must be at least 1',
              },
              max: {
                value: 100,
                message: 'Number must be at most 100',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number (1-100) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter 1-100" {...field} />
                </FormControl>
                <FormDescription>
                  Must be a number between 1 and 100
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minLengthField"
            rules={{
              required: 'This field is required',
              minLength: {
                value: 5,
                message: 'Must be at least 5 characters long',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Length (5 chars) *</FormLabel>
                <FormControl>
                  <Input placeholder="At least 5 characters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">
            Validate Form
          </Button>
        </form>
      </Form>
    );
  },
};