export type EventColor = 'BLUE' | 'RED' | 'GREEN' | 'YELLOW' | 'PURPLE' | 'GRAY';
export type EventType = 'MEETING' | 'DEADLINE' | 'DEMO' | 'PERSONAL' | 'REMINDER';
export type EventStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type EventPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface Event {
  id: number;
  dateCreation: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  color: EventColor;
  location?: string;
  meetingLink?: string;
  type: EventType;
  status: EventStatus;
  priority: EventPriority;
  relatedResourceType?: string;
  relatedResourceId?: number;
  roomId?: number;
  notes?: string;
  participants?: EventParticipant[];
  reminders?: EventReminder[];
  recurrence?: EventRecurrence;
}

export interface EventParticipant {
  id: number;
  name: string;
  email: string;
  rsvpStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
  isOrganizer: boolean;
}

export interface EventReminder {
  id: number;
  reminderTime: string;
  reminderType: 'NOTIFICATION' | 'EMAIL';
  notificationSent: boolean;
}

export interface EventRecurrence {
  id: number;
  rule: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceEndDate?: string;
  occurrenceCount?: number;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  color?: EventColor;
  location?: string;
  meetingLink?: string;
  type: EventType;
  status?: EventStatus;
  priority?: EventPriority;
  relatedResourceType?: string;
  relatedResourceId?: number;
  notes?: string;
}
