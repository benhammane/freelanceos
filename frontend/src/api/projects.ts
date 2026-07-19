import { http } from './http'
import type { Project, ProjectInput, StatutProjet } from '../types/project'
import type { Priorite } from '../types/common'

export const projectsApi = {
  findAll: (filters?: { statut?: StatutProjet; priorite?: Priorite }) =>
    http
      .get<Project[]>('/api/projects', { params: filters })
      .then((res) => res.data),

  findById: (id: number) => http.get<Project>(`/api/projects/${id}`).then((res) => res.data),

  create: (input: ProjectInput) => http.post<Project>('/api/projects', input).then((res) => res.data),

  update: (id: number, input: ProjectInput) =>
    http.put<Project>(`/api/projects/${id}`, input).then((res) => res.data),

  move: (id: number, statut: StatutProjet, position: number) =>
    http.patch<Project>(`/api/projects/${id}/move`, { statut, position }).then((res) => res.data),

  delete: (id: number) => http.delete(`/api/projects/${id}`),

  /**
   * Envoie une capture d'écran (multipart/form-data). On ne fixe pas le
   * Content-Type manuellement : axios le règle automatiquement avec la bonne
   * "boundary" quand on passe un FormData.
   */
  uploadScreenshot: (id: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<Project>(`/api/projects/${id}/screenshots`, form).then((res) => res.data)
  },

  deleteScreenshot: (id: number, screenshotId: number) =>
    http.delete<Project>(`/api/projects/${id}/screenshots/${screenshotId}`).then((res) => res.data),

  /** Chemin (relatif à l'API) de l'image d'une capture, côté admin. */
  screenshotPath: (id: number, screenshotId: number) => `/api/projects/${id}/screenshots/${screenshotId}`,
}
