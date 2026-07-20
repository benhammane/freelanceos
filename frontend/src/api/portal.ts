import { http } from './http'
import type { Project } from '../types/project'
import type { Invoice } from '../types/invoice'

export const portalApi = {
  findMesProjects: () => http.get<Project[]>('/api/portal/projects').then((res) => res.data),

  findMesInvoices: () => http.get<Invoice[]>('/api/portal/invoices').then((res) => res.data),

  findMonInvoice: (id: number) =>
    http.get<Invoice>(`/api/portal/invoices/${id}`).then((res) => res.data),

  /** Accepte (signe) un devis en ligne. */
  accepterDevis: (id: number, signataireNom: string) =>
    http
      .post<Invoice>(`/api/portal/invoices/${id}/accepter`, { signataireNom, consentement: true })
      .then((res) => res.data),

  /** Chemin (relatif à l'API) d'une capture d'écran, côté portail client. */
  screenshotPath: (projectId: number, screenshotId: number) =>
    `/api/portal/projects/${projectId}/screenshots/${screenshotId}`,

  telechargerPdf: async (id: number, numero: string) => {
    const res = await http.get(`/api/portal/invoices/${id}/pdf`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const lien = document.createElement('a')
    lien.href = url
    lien.download = `${numero}.pdf`
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    window.URL.revokeObjectURL(url)
  },
}
