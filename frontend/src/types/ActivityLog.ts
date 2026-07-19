export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'DOWNLOAD' | 'EXPORT';
export type ResourceType = 'PROJECT' | 'TASK' | 'INVOICE' | 'NOTE' | 'CLIENT' | 'MEETING' | 'ROOM' | 'USER';
export type ActivityCategory = 'PROJECTS' | 'INVOICES' | 'TEAMS' | 'SYSTEM' | 'CALENDAR' | 'VIDEO';

export interface ActivityLog {
  id: number;
  dateCreation: string;
  dateModification: string;
  action: ActivityAction;
  resourceType: ResourceType;
  resourceId: number;
  userEmail: string;
  description?: string;
  category: ActivityCategory;
  icon?: string;
  metadata?: Record<string, string>;
}

export interface CreateActivityLogDto {
  action: ActivityAction;
  resourceType: ResourceType;
  resourceId: number;
  description?: string;
  category?: ActivityCategory;
  icon?: string;
  metadata?: Record<string, string>;
}
