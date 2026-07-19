import type { Role } from './auth'

export interface Message {
  id: number
  clientId: number
  senderRole: Role
  contenu: string
  dateCreation: string
  lu: boolean
}

export interface Conversation {
  clientId: number
  clientNom: string
  dernierMessage: string | null
  dernierAt: string | null
  nonLus: number
}

/** Enveloppe des événements poussés sur le WebSocket de chat (voir ChatEvent côté backend). */
export interface ChatEvent {
  type: string
  message: Message
}
