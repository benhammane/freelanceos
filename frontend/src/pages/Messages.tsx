import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'
import { messagesApi } from '../api/messages'
import { messageErreur } from '../api/http'
import { useChatSocket } from '../hooks/useChatSocket'
import type { Conversation, Message } from '../types/message'

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [contenu, setContenu] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const filRef = useRef<HTMLDivElement>(null)

  const chargerConversations = () => {
    messagesApi
      .conversations()
      .then(setConversations)
      .catch((err) => toast.error(messageErreur(err)))
  }

  useEffect(chargerConversations, [])

  // Ouvre une conversation : charge son fil et marque les messages comme lus.
  const ouvrir = (conv: Conversation) => {
    setSelected(conv)
    messagesApi
      .conversation(conv.clientId)
      .then((msgs) => {
        setMessages(msgs)
        if (conv.nonLus > 0) {
          messagesApi.markReadAsAdmin(conv.clientId).then(chargerConversations)
        }
      })
      .catch((err) => toast.error(messageErreur(err)))
  }

  // Réception temps réel : messages envoyés par les clients.
  useChatSocket((event) => {
    if (event.type !== 'message') return
    const msg = event.message
    if (selected && msg.clientId === selected.clientId) {
      setMessages((prev) => [...prev, msg])
      messagesApi.markReadAsAdmin(selected.clientId)
    }
    chargerConversations()
  })

  // Auto-scroll en bas à chaque nouveau message.
  useEffect(() => {
    filRef.current?.scrollTo({ top: filRef.current.scrollHeight })
  }, [messages])

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !contenu.trim()) return
    setEnvoi(true)
    try {
      const msg = await messagesApi.sendAsAdmin(selected.clientId, contenu.trim())
      setMessages((prev) => [...prev, msg])
      setContenu('')
      chargerConversations()
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">Messagerie</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* Liste des conversations */}
        <div className="overflow-hidden rounded-2xl border border-navy-200/80 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-navy-100 dark:divide-navy-800/70">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-navy-400">Aucun client pour le moment.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.clientId}
                  onClick={() => ouvrir(c)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-navy-50 dark:hover:bg-navy-800/50 ${
                    selected?.clientId === c.clientId ? 'bg-navy-50 dark:bg-navy-800/60' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-navy-800 dark:text-navy-100">{c.clientNom}</span>
                      {c.nonLus > 0 && (
                        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-xs font-semibold text-white">
                          {c.nonLus}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-navy-400">{c.dernierMessage ?? 'Démarrer la conversation'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Fil de discussion */}
        <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-navy-200/80 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-sm text-navy-400">
              Sélectionnez une conversation pour commencer.
            </div>
          ) : (
            <>
              <div className="border-b border-navy-100 px-5 py-3 dark:border-navy-800">
                <p className="font-semibold text-navy-800 dark:text-navy-100">{selected.clientNom}</p>
              </div>

              <div ref={filRef} className="flex-1 space-y-3 overflow-y-auto p-5">
                {messages.length === 0 ? (
                  <p className="text-sm text-navy-400">Aucun message. Écrivez le premier !</p>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderRole === 'ADMIN'
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
