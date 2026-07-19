import { http } from './http'
import type { Client, ClientAccess, ClientInput } from '../types/client'

export const clientsApi = {
  findAll: () => http.get<Client[]>('/api/clients').then((res) => res.data),

  findById: (id: number) => http.get<Client>(`/api/clients/${id}`).then((res) => res.data),

  create: (input: ClientInput) => http.post<Client>('/api/clients', input).then((res) => res.data),

  update: (id: number, input: ClientInput) =>
    http.put<Client>(`/api/clients/${id}`, input).then((res) => res.data),

  delete: (id: number) => http.delete(`/api/clients/${id}`),

  genererAcces: (id: number) => http.post<ClientAccess>(`/api/clients/${id}/access`).then((res) => res.data),
}
