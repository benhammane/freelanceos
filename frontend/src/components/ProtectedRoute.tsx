import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/auth'

/**
 * Protège une section de l'application selon le rôle attendu :
 *  - pas de session -> renvoi vers /login
 *  - session mais mauvais rôle (ex: un CLIENT qui tente d'ouvrir /clients) ->
 *    renvoi vers SON propre espace plutôt qu'un simple message d'erreur
 *  - sinon, affiche le contenu protégé
 */
export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useAuth()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (session.role !== role) {
    return <Navigate to={session.role === 'ADMIN' ? '/' : '/portail'} replace />
  }

  return <>{children}</>
}
