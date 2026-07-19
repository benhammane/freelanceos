export type Role = 'ADMIN' | 'CLIENT'

// Aligné sur LoginResponseDto côté backend.
export interface LoginResponse {
  token: string
  role: Role
  email: string
  clientId: number | null
  clientNom: string | null
}

export interface AuthSession {
  token: string
  role: Role
  email: string
  clientId: number | null
  clientNom: string | null
}
