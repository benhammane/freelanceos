// Aligné sur NoteResponseDto / NoteRequestDto côté backend.

export interface Note {
  id: number
  titre: string
  contenu: string | null
  dateCreation: string
  dateModification: string
  projectId: number | null
  projectTitre: string | null
}

export interface NoteInput {
  titre: string
  contenu: string
}
