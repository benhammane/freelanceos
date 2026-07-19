import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthSession, LoginResponse } from '../types/auth'

const CLE_STOCKAGE_SESSION = 'freelanceos.session'

interface AuthContextValue {
  session: AuthSession | null
  connecter: (reponse: LoginResponse) => void
  deconnecter: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function lireSessionStockee(): AuthSession | null {
  const brut = localStorage.getItem(CLE_STOCKAGE_SESSION)
  if (!brut) return null
  try {
    return JSON.parse(brut) as AuthSession
  } catch {
    return null
  }
}

/**
 * Fournit la session d'authentification (token + rôle + infos client) à
 * toute l'application. Persistée dans le localStorage pour survivre à un
 * rechargement de page — le même stockage est lu directement par
 * l'intercepteur axios (voir api/http.ts), qui n'a pas accès à ce contexte
 * React puisqu'il vit en dehors de l'arbre de composants.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(lireSessionStockee)

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      connecter: (reponse) => {
        const nouvelleSession: AuthSession = reponse
        localStorage.setItem(CLE_STOCKAGE_SESSION, JSON.stringify(nouvelleSession))
        setSession(nouvelleSession)
      },
      deconnecter: () => {
        localStorage.removeItem(CLE_STOCKAGE_SESSION)
        setSession(null)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>')
  return context
}
