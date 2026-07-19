import type { Priorite } from './common'

// Aligné sur TaskResponseDto / TaskRequestDto côté backend.

export type StatutTache = 'A_FAIRE' | 'EN_COURS' | 'TERMINE'

export const STATUTS_TACHE: StatutTache[] = ['A_FAIRE', 'EN_COURS', 'TERMINE']

export const LABELS_STATUT_TACHE: Record<StatutTache, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
}

export interface Task {
  id: number
  titre: string
  description: string | null
  statut: StatutTache
  priorite: Priorite
  projectId: number
  position: number
  dateEcheance: string | null
}

export interface TaskInput {
  titre: string
  description: string
  statut: StatutTache
  priorite: Priorite
  projectId: number
  position: number
  dateEcheance: string
}
