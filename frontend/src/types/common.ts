// Types partagés entre plusieurs modules (alignés sur le backend commun).

export type Priorite = 'BASSE' | 'MOYENNE' | 'HAUTE'

export const PRIORITES: Priorite[] = ['BASSE', 'MOYENNE', 'HAUTE']

export const LABELS_PRIORITE: Record<Priorite, string> = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
}

/** Couleur de pastille par priorité, cohérente sur toutes les pages. */
export const COULEUR_PRIORITE: Record<Priorite, string> = {
  BASSE: 'bg-slate-400',
  MOYENNE: 'bg-amber-500',
  HAUTE: 'bg-red-500',
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  details: string[]
}
