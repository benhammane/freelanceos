import { http } from './http';
import type { Event, CreateEventDto } from '../types/Event';

const BASE_URL = '/api/events';

export const eventsApi = {
  list: (page = 0, size = 20) =>
    http.get<{ content: Event[]; totalElements: number }>(BASE_URL, { params: { page, size } }).then(r => r.data),
  get: (id: number) =>
    http.get<Event>(`${BASE_URL}/${id}`).then(r => r.data),
  create: (input: CreateEventDto) =>
    http.post<Event>(BASE_URL, input).then(r => r.data),
  update: (id: number, input: CreateEventDto) =>
    http.put<Event>(`${BASE_URL}/${id}`, input).then(r => r.data),
  move: (id: number, startDateTime: string, endDateTime: string) =>
    http.patch<Event>(`${BASE_URL}/${id}/move`, { startDateTime, endDateTime }).then(r => r.data),
  delete: (id: number) =>
    http.delete(`${BASE_URL}/${id}`),
  getByDateRange: (start: string, end: string) =>
    http.get<Event[]>(`${BASE_URL}/date-range`, { params: { start, end } }).then(r => r.data),
  getByResource: (resourceType: string, resourceId: number) =>
    http.get<Event[]>(`${BASE_URL}/resource/${resourceType}/${resourceId}`).then(r => r.data),
};
