import { http } from './http'
import type { Invoice, InvoiceInput, StatutInvoice } from '../types/invoice'

export const invoicesApi = {
  findAll: () => http.get<Invoice[]>('/api/invoices').then((res) => res.data),

  findById: (id: number) => http.get<Invoice>(`/api/invoices/${id}`).then((res) => res.data),

  create: (input: InvoiceInput) => http.post<Invoice>('/api/invoices', input).then((res) => res.data),

  update: (id: number, input: InvoiceInput) =>
    http.put<Invoice>(`/api/invoices/${id}`, input).then((res) => res.data),

  changerStatut: (id: number, statut: StatutInvoice) =>
    http.patch<Invoice>(`/api/invoices/${id}/statut`, { statut }).then((res) => res.data),

  convertirEnFacture: (id: number) =>
    http.post<Invoice>(`/api/invoices/${id}/convertir-en-facture`).then((res) => res.data),

  delete: (id: number) => http.delete(`/api/invoices/${id}`),

  /**
   * Le PDF est un flux binaire (pas du JSON) : on force responseType 'blob'
   * pour qu'axios ne tente pas de le parser comme du texte/JSON.
   */
  telechargerPdf: async (id: number, numero: string) => {
    const res = await http.get(`/api/invoices/${id}/pdf`, { responseType: 'blob' })
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
