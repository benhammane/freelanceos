import { http } from './http'
import type { Note, NoteInput } from '../types/note'

export const notesApi = {
  findAll: () => http.get<Note[]>('/api/notes').then((res) => res.data),

  findById: (id: number) => http.get<Note>(`/api/notes/${id}`).then((res) => res.data),

  create: (input: NoteInput) => http.post<Note>('/api/notes', input).then((res) => res.data),

  update: (id: number, input: NoteInput) => http.put<Note>(`/api/notes/${id}`, input).then((res) => res.data),

  convertir: (id: number, projectId: number) =>
    http.patch<Note>(`/api/notes/${id}/convert`, { projectId }).then((res) => res.data),

  delete: (id: number) => http.delete(`/api/notes/${id}`),
}
