/**
 * Announcement domain model types
 */

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum AnnouncementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  authorId: string;
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateAnnouncementInput = Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAnnouncementInput = Partial<Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>>;
