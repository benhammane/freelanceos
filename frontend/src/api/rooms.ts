import { http } from './http';
import type { VideoRoom, RoomParticipant } from '../types/VideoRoom';

const BASE_URL = '/api/rooms';

export const roomsApi = {
  list: (page = 0) =>
    http.get<{ content: VideoRoom[] }>(BASE_URL, { params: { page } }).then(r => r.data),
  get: (id: number) =>
    http.get<VideoRoom>(`${BASE_URL}/${id}`).then(r => r.data),
  create: (name: string, description?: string) =>
    http.post<VideoRoom>(BASE_URL, { name, description }).then(r => r.data),
  join: (id: number, displayName: string) =>
    http.post<RoomParticipant>(`${BASE_URL}/${id}/join`, { displayName }).then(r => r.data),
  leave: (participantId: number) =>
    http.post(`${BASE_URL}/${participantId}/leave`),
  getParticipants: (id: number) =>
    http.get<RoomParticipant[]>(`${BASE_URL}/${id}/participants`).then(r => r.data),
  delete: (id: number) =>
    http.delete(`${BASE_URL}/${id}`),
};
