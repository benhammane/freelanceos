import { http } from './http'
import type { Conversation, Message } from '../types/message'

export const messagesApi = {
  // --- Côté admin (freelance) ---
  conversations: () =>
    http.get<Conversation[]>('/api/messages/conversations').then((res) => res.data),

  conversation: (clientId: number) =>
    http.get<Message[]>(`/api/messages/${clientId}`).then((res) => res.data),

  sendAsAdmin: (clientId: number, contenu: string) =>
    http.post<Message>(`/api/messages/${clientId}`, { contenu }).then((res) => res.data),

  markReadAsAdmin: (clientId: number) => http.post(`/api/messages/${clientId}/read`),

  // --- Côté client (portail) ---
  portalMessages: () => http.get<Message[]>('/api/portal/messages').then((res) => res.data),

  portalSend: (contenu: string) =>
    http.post<Message>('/api/portal/messages', { contenu }).then((res) => res.data),

  portalMarkRead: () => http.post('/api/portal/messages/read'),
}
