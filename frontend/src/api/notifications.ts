import { http } from './http';
import type { Notification } from '../types/Notification';

const BASE_URL = '/api/notifications';

export const notificationsApi = {
  getUserNotifications: (page = 0, size = 20) =>
    http.get<{ content: Notification[]; totalElements: number; totalPages: number }>(BASE_URL, {
      params: { page, size }
    }).then(res => res.data),

  getUnreadNotifications: (page = 0, size = 20) =>
    http.get<{ content: Notification[]; totalElements: number; totalPages: number }>(`${BASE_URL}/unread`, {
      params: { page, size }
    }).then(res => res.data),

  getUnreadCount: () =>
    http.get<number>(`${BASE_URL}/unread-count`).then(res => res.data),

  getNotification: (id: number) =>
    http.get<Notification>(`${BASE_URL}/${id}`).then(res => res.data),

  markAsRead: (id: number) =>
    http.patch<Notification>(`${BASE_URL}/${id}/read`).then(res => res.data),

  markAllAsRead: () =>
    http.post(`${BASE_URL}/mark-all-read`).then(() => undefined),

  deleteNotification: (id: number) =>
    http.delete(`${BASE_URL}/${id}`),

  deleteAllRead: () =>
    http.delete(`${BASE_URL}/read/cleanup`),

  getByType: (type: string, page = 0, size = 20) =>
    http.get<{ content: Notification[]; totalElements: number; totalPages: number }>(`${BASE_URL}/filter/type`, {
      params: { type, page, size }
    }).then(res => res.data),

  getByPriority: (priority: string, page = 0, size = 20) =>
    http.get<{ content: Notification[]; totalElements: number; totalPages: number }>(`${BASE_URL}/filter/priority`, {
      params: { priority, page, size }
    }).then(res => res.data),
};
