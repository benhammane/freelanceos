import { useEffect, useRef } from 'react'
import type { ChatEvent } from '../types/message'

const CLE_STOCKAGE_SESSION = 'freelanceos.session'

function readToken(): string | null {
  const brut = localStorage.getItem(CLE_STOCKAGE_SESSION)
  if (!brut) return null
  try {
    return (JSON.parse(brut) as { token: string }).token
  } catch {
    return null
  }
}

function chatSocketUrl(token: string): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
  return `${apiUrl.replace(/^http/, 'ws')}/ws/chat?token=${encodeURIComponent(token)}`
}

/**
 * Connexion au canal WebSocket de messagerie. Appelle `onEvent` à chaque
 * nouveau message poussé par le serveur. La connexion se ferme automatiquement
 * au démontage du composant.
 */
export function useChatSocket(onEvent: (event: ChatEvent) => void) {
  const callbackRef = useRef(onEvent)
  callbackRef.current = onEvent

  useEffect(() => {
    const token = readToken()
    if (!token) return

    const ws = new WebSocket(chatSocketUrl(token))
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ChatEvent
        callbackRef.current(data)
      } catch {
        /* message ignoré */
      }
    }

    return () => ws.close()
  }, [])
}
