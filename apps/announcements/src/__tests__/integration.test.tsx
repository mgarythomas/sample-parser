import { render, screen } from '@testing-library/react';
import { Button } from '@repo/ui';
import { Card } from '@repo/ui';
import { formatDate, getRelativeTime } from '@repo/shared-utils';

describe('Announcements Integration Tests', () => {
  describe('Shared UI Components Integration', () => {
    it('renders Button component from @repo/ui', () => {
      render(<Button>Create Announcement</Button>);
      expect(screen.getByRole('button', { name: /create announcement/i })).toBeInTheDocument();
    });

    it('renders multiple buttons with different variants', () => {
      render(
        <div>
          <Button variant="default">Primary Action</Button>
          <Button variant="outline">Secondary Action</Button>
        </div>
      );
      expect(screen.getByRole('button', { name: /primary action/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /secondary action/i })).toBeInTheDocument();
    });

    it('renders Card component from @repo/ui', () => {
      render(
        <Card>
          <h3>Announcement Title</h3>
          <p>Announcement content goes here</p>
        </Card>
      );
      expect(screen.getByText(/announcement title/i)).toBeInTheDocument();
      expect(screen.getByText(/announcement content goes here/i)).toBeInTheDocument();
    });

    it('renders announcement list with Cards', () => {
      const announcements = [
        { id: '1', title: 'First Announcement', content: 'Content 1' },
        { id: '2', title: 'Second Announcement', content: 'Content 2' },
      ];

      render(
        <div>
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <h3>{announcement.title}</h3>
              <p>{announcement.content}</p>
            </Card>
          ))}
        </div>
      );

      expect(screen.getByText(/first announcement/i)).toBeInTheDocument();
      expect(screen.getByText(/second announcement/i)).toBeInTheDocument();
    });
  });

  describe('Shared Utils Integration', () => {
    it('uses formatDate utility from @repo/shared-utils', () => {
      const date = new Date('2024-02-15T00:00:00Z');
      const formatted = formatDate(date, 'YYYY-MM-DD');
      expect(formatted).toBe('2024-02-15');
    });

    it('uses getRelativeTime utility from @repo/shared-utils', () => {
      const now = new Date();
      const relative = getRelativeTime(now);
      expect(relative).toMatch(/just now|in a few seconds/);
    });

    it('formats announcement dates correctly', () => {
      const publishDate = new Date('2024-01-10T09:00:00Z');
      const formatted = formatDate(publishDate, 'MM/DD/YYYY');
      expect(formatted).toBe('01/10/2024');
    });
  });

  describe('Announcement Component Integration', () => {
    it('renders announcement with formatted date', () => {
      const announcement = {
        id: '123',
        title: 'Important Update',
        content: 'This is an important announcement',
        publishedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const formattedDate = formatDate(announcement.publishedAt, 'MM/DD/YYYY');

      render(
        <Card>
          <h3>{announcement.title}</h3>
          <p>{announcement.content}</p>
          <small>Published: {formattedDate}</small>
          <Button>Read More</Button>
        </Card>
      );

      expect(screen.getByText(announcement.title)).toBeInTheDocument();
      expect(screen.getByText(announcement.content)).toBeInTheDocument();
      expect(screen.getByText(/published: 01\/15\/2024/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /read more/i })).toBeInTheDocument();
    });

    it('renders multiple announcements with shared components', () => {
      const announcements = [
        {
          id: '1',
          title: 'System Maintenance',
          content: 'Scheduled maintenance on Sunday',
          publishedAt: new Date('2024-01-20'),
        },
        {
          id: '2',
          title: 'New Feature Release',
          content: 'Check out our new features',
          publishedAt: new Date('2024-01-21'),
        },
      ];

      render(
        <div>
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <h3>{announcement.title}</h3>
              <p>{announcement.content}</p>
              <small>{formatDate(announcement.publishedAt, 'YYYY-MM-DD')}</small>
            </Card>
          ))}
        </div>
      );

      expect(screen.getByText(/system maintenance/i)).toBeInTheDocument();
      expect(screen.getByText(/new feature release/i)).toBeInTheDocument();
    });
  });
});
