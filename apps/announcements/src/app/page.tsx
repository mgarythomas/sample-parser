import { Button } from '@repo/ui';
import { Card } from '@repo/ui';
import { Announcement, AnnouncementStatus, AnnouncementPriority } from '@repo/shared-types';
import { getRelativeTime, truncate } from '@repo/shared-utils';

export default function Home() {
  // Example usage of shared types
  const sampleAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      content:
        'We will be performing scheduled maintenance on our systems this weekend. Please save your work and expect brief interruptions.',
      status: AnnouncementStatus.PUBLISHED,
      priority: AnnouncementPriority.HIGH,
      authorId: 'admin-1',
      publishedAt: new Date('2024-10-10'),
      createdAt: new Date('2024-10-09'),
      updatedAt: new Date('2024-10-09'),
    },
    {
      id: '2',
      title: 'New Features Released',
      content:
        'Check out our latest features including improved dashboard analytics, better reporting tools, and enhanced user management capabilities.',
      status: AnnouncementStatus.PUBLISHED,
      priority: AnnouncementPriority.MEDIUM,
      authorId: 'admin-1',
      publishedAt: new Date('2024-10-12'),
      createdAt: new Date('2024-10-12'),
      updatedAt: new Date('2024-10-12'),
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Announcements Application</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Announcements</h2>
          <p className="text-muted-foreground mb-4">
            This is the announcements micro frontend application built with Next.js, using shared
            components from the monorepo.
          </p>
          <div className="flex gap-4">
            <Button>Create Announcement</Button>
            <Button variant="outline">View All</Button>
          </div>
        </Card>

        <div className="space-y-4 mb-6">
          <h3 className="text-xl font-semibold">Recent Announcements</h3>
          {sampleAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{announcement.title}</h4>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    announcement.priority === AnnouncementPriority.HIGH
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {announcement.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {truncate(announcement.content, 100)}
              </p>
              <p className="text-xs text-muted-foreground">
                Published {announcement.publishedAt && getRelativeTime(announcement.publishedAt)}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Shared Components</h3>
            <p className="text-sm text-muted-foreground">
              Using Button and Card from @repo/ui package
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Shared Types</h3>
            <p className="text-sm text-muted-foreground">
              Using Announcement types from @repo/shared-types
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Shared Utilities</h3>
            <p className="text-sm text-muted-foreground">
              Using getRelativeTime and truncate from @repo/shared-utils
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
