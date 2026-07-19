import { http } from './http'
import type { DashboardSummary } from '../types/dashboard'

export const dashboardApi = {
  getSummary: () => http.get<DashboardSummary>('/api/dashboard/summary').then((res) => res.data),
}
