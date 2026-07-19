import { http } from './http'
import type { LoginResponse } from '../types/auth'

export const authApi = {
  login: (email: string, password: string) =>
    http.post<LoginResponse>('/api/auth/login', { email, password }).then((res) => res.data),
}
