import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'
import { messagesApi } from '../../api/messages'
import { messageErreur } from '../../api/http'
import { useChatSocket } from '../../hooks/useChatSocket'
import type { Message } from '../../types/message'

export default function PortalMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [contenu, setContenu] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [chargement, setChargement] = useState(true)
  const filRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesApi
      .portalMessages()
      .then((msgs) => {
        setMessages(msgs)
        messagesApi.portalMarkRead()
      })
      .catch((err) => toast.error(messageErreur(err)))
      .finally(() => setChargement(false))
  }, [])

  // Réception temps réel des réponses du freelance.
  useChatSocket((event) => {
    if (event.type !== 'message') return
    setMessages((prev) => [...prev, event.message])
    messagesApi.portalMarkRead()
  })

  useEffect(() => {
    filRef.current?.scrollTo({ top: filRef.current.scrollHeight })
  }, [messages])

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contenu.trim()) return
    setEnvoi(true)
    try {
      const msg = await messagesApi.portalSend(contenu.trim())
      setMessages((prev) => [...prev, msg])
      setContenu('')
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">Messagerie</h1>

      <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-navy-200/80 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <div className="border-b border-navy-100 px-5 py-3 dark:border-navy-800">
          <p className="font-semibold text-navy-800 dark:text-navy-100">Discussion avec votre prestataire</p>
        </div>

        <div ref={filRef} className="flex-1 space-y-3 overflow-y-auto p-5">
          {chargement ? (
            <p className="text-sm text-navy-400">Chargement…</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-navy-400">Aucun message. Posez votre question ci-dessous !</p>
          ) : (
            messages.map((m) => {
              const mine = m.senderRole === 'CLIENT'
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      mine
                        ? 'bg-cyan-600 text-white'
                        : 'bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-navy-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.contenu}</p>
                    <p className={`mt-1 text-[10px] ${mine ? 'text-cyan-100' : 'text-navy-400'}`}>
                      {new Date(m.dateCreation).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={envoyer} className="flex items-center gap-2 border-t border-navy-100 p-3 dark:border-navy-800">
          <input
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Écrire un message…"
            className="flex-1 rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm text-navy-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-navy-700 dark:bg-navy-950 dark:text-navy-100"
          />
          <button
            type="submit"
            disabled={envoi || !contenu.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white transition-colors hover:bg-cyan-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
