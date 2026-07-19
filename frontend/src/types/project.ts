import type { Priorite } from './common'

// Aligné sur ProjectResponseDto / ProjectRequestDto côté backend.

export type StatutProjet = 'PROSPECT' | 'EN_COURS' | 'TERMINE' | 'ANNULE'

export const STATUTS_PROJET: StatutProjet[] = ['PROSPECT', 'EN_COURS', 'TERMINE', 'ANNULE']

export const LABELS_STATUT_PROJET: Record<StatutProjet, string> = {
  PROSPECT: 'Prospect',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
}

// Métadonnées d'une capture d'écran (aligné sur ScreenshotDto backend).
export interface Screenshot {
  id: number
  filename: string
  contentType: string
}

export interface Project {
  id: number
  titre: string
  description: string | null
  url: string | null
  statut: StatutProjet
  priorite: Priorite
  clientId: number
  clientNom: string
  technos: string[]
  dateDebut: string | null
  dateFinPrevue: string | null
  montantEstime: number | null
  position: number
  screenshots: Screenshot[]
}

export interface ProjectInput {
  titre: string
  description: string
  url: string
  statut: StatutProjet
  priorite: Priorite
  clientId: number
  technos: string[]
  dateDebut: string
  dateFinPrevue: string
  montantEstime: number | ''
  position: number
}
