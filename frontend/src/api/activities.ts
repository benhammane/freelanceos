import { http } from './http';
import type { ActivityLog } from '../types/ActivityLog';

const BASE_URL = '/api/activity-logs';

export const activitiesApi = {
  getTimeline: (page = 0, size = 20) =>
    http.get<{ content: ActivityLog[]; totalElements: number; totalPages: number }>(BASE_URL, {
      params: { page, size }
    }).then(res => res.data),

  getActivityLog: (id: number) =>
    http.get<ActivityLog>(`${BASE_URL}/${id}`).then(res => res.data),

  getByResourceType: (resourceType: string, page = 0, size = 20) =>
    http.get<{ content: ActivityLog[]; totalElements: number; totalPages: number }>(`${BASE_URL}/filter/resource-type`, {
      params: { resourceType, page, size }
    }).then(res => res.data),

  getByCategory: (category: string, page = 0, size = 20) =>
    http.get<{ content: ActivityLog[]; totalElements: number; totalPages: number }>(`${BASE_URL}/filter/category`, {
      params: { category, page, size }
    }).then(res => res.data),

  getByAction: (action: string, page = 0, size = 20) =>
    http.get<{ content: ActivityLog[]; totalElements: number; totalPages: number }>(`${BASE_URL}/filter/action`, {
      params: { action, page, size }
    }).then(res => res.data),

  search: (keyword: string, page = 0, size = 20) =>
    http.get<{ content: ActivityLog[]; totalElements: number; totalPages: number }>(`${BASE_URL}/search`, {
      params: { keyword, page, size }
    }).then(res => res.data),

  getByDateRange: (startDate: string, endDate: string) =>
    http.get<ActivityLog[]>(`${BASE_URL}/date-range`, {
      params: { startDate, endDate }
    }).then(res => res.data),
};
