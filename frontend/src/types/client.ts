// Aligné sur ClientResponseDto / ClientRequestDto côté backend.

export interface Client {
  id: number
  nom: string
  email: string
  entreprise: string | null
  telephone: string | null
  adresse: string | null
  notes: string | null
  dateCreation: string
}

export interface ClientInput {
  nom: string
  email: string
  entreprise: string
  telephone: string
  adresse: string
  notes: string
}

// Aligné sur ClientAccessResponseDto côté backend.
export interface ClientAccess {
  email: string
  motDePasseGenere: string
}
