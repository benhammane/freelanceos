export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface Notification {
  id: number;
  dateCreation: string;
  dateModification: string;
  title: string;
  message?: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  relatedResourceId?: number;
  relatedResourceType?: string;
  priority: NotificationPriority;
  icon?: string;
}

export interface CreateNotificationDto {
  title: string;
  message?: string;
  type: NotificationType;
  actionUrl?: string;
  relatedResourceId?: number;
  relatedResourceType?: string;
  priority?: NotificationPriority;
  icon?: string;
}
