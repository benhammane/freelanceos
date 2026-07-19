import { http } from './http'
import type { StatutTache, Task, TaskInput } from '../types/task'

export const tasksApi = {
  findByProject: (projectId: number) =>
    http.get<Task[]>('/api/tasks', { params: { projectId } }).then((res) => res.data),

  create: (input: TaskInput) => http.post<Task>('/api/tasks', input).then((res) => res.data),

  update: (id: number, input: TaskInput) => http.put<Task>(`/api/tasks/${id}`, input).then((res) => res.data),

  move: (id: number, statut: StatutTache, position: number) =>
    http.patch<Task>(`/api/tasks/${id}/move`, { statut, position }).then((res) => res.data),

  delete: (id: number) => http.delete(`/api/tasks/${id}`),
}
