import axios from 'axios'
import type { ApiError } from '../types/common'

const CLE_STOCKAGE_SESSION = 'freelanceos.session'

/**
 * Instance axios unique partagée par tous les fichiers api/*.ts.
 * baseURL configurable via une variable d'environnement Vite (VITE_API_URL),
 * avec http://localhost:8080 comme valeur par défaut en développement.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Intercepteur de REQUÊTE : ajoute automatiquement l'en-tête
 * "Authorization: Bearer <token>" sur chaque appel API, si une session est
 * présente dans le localStorage. Évite d'avoir à le faire manuellement dans
 * chaque fichier api/*.ts.
 */
http.interceptors.request.use((config) => {
  const brut = localStorage.getItem(CLE_STOCKAGE_SESSION)
  if (brut) {
    const session = JSON.parse(brut) as { token: string }
    config.headers.Authorization = `Bearer ${session.token}`
  }
  // Upload de fichier : on retire le Content-Type JSON par défaut pour laisser
  // axios/le navigateur poser un "multipart/form-data" avec la bonne "boundary".
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

/**
 * Intercepteur de RÉPONSE : si le token est absent/expiré/invalide, le
 * backend renvoie 401. On efface alors la session locale et on renvoie
 * vers la page de connexion — un rechargement complet plutôt qu'une
 * navigation React Router, car ce code vit en dehors de l'arbre de
 * composants (pas d'accès direct au hook useNavigate ici).
 */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(CLE_STOCKAGE_SESSION)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/**
 * Extrait un message d'erreur lisible depuis une erreur axios, en tenant
 * compte du format ApiError renvoyé par GlobalExceptionHandler côté backend
 * (avec le détail de chaque champ en erreur de validation le cas échéant).
 */
export function messageErreur(err: unknown): string {
  if (axios.isAxiosError<ApiError>(err) && err.response?.data) {
    const { message, details } = err.response.data
    if (details && details.length > 0) {
      return `${message} — ${details.join(', ')}`
    }
    return message
  }
  return 'Une erreur inattendue est survenue'
}
