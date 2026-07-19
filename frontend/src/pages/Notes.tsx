import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FileText, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import { notesApi } from '../api/notes'
import { clientsApi } from '../api/clients'
import { projectsApi } from '../api/projects'
import { messageErreur } from '../api/http'
import type { Note, NoteInput } from '../types/note'
import type { Client } from '../types/client'
import type { ProjectInput } from '../types/project'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ProjectFormModal } from '../components/ProjectFormModal'
import { MarkdownPreview } from '../components/notes/MarkdownPreview'

const DELAI_AUTOSAVE_MS = 1200

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [chargement, setChargement] = useState(true)
  const [noteSelectionneeId, setNoteSelectionneeId] = useState<number | null>(null)
  const [recherche, setRecherche] = useState('')
  const [onglet, setOnglet] = useState<'edition' | 'apercu'>('edition')
  const [aSupprimer, setASupprimer] = useState<Note | null>(null)
  const [conversionEnCours, setConversionEnCours] = useState<Note | null>(null)

  const [brouillon, setBrouillon] = useState<NoteInput>({ titre: '', contenu: '' })
  const [statutSauvegarde, setStatutSauvegarde] = useState<'synchronise' | 'en_cours' | 'erreur'>('synchronise')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function charger() {
    setChargement(true)
    try {
      const [notesData, clientsData] = await Promise.all([notesApi.findAll(), clientsApi.findAll()])
      setNotes(notesData)
      setClients(clientsData)
      if (notesData.length > 0 && noteSelectionneeId === null) {
        setNoteSelectionneeId(notesData[0].id)
      }
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const noteSelectionnee = useMemo(
    () => notes.find((n) => n.id === noteSelectionneeId) ?? null,
    [notes, noteSelectionneeId],
  )

  // Recharge le brouillon local à chaque changement de note sélectionnée.
  useEffect(() => {
    if (noteSelectionnee) {
      setBrouillon({ titre: noteSelectionnee.titre, contenu: noteSelectionnee.contenu ?? '' })
      setStatutSauvegarde('synchronise')
    }
  }, [noteSelectionnee?.id])

  const notesFiltrees = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => n.titre.toLowerCase().includes(q))
  }, [notes, recherche])

  /**
   * Sauvegarde automatique façon Notion : chaque frappe reprogramme un
   * enregistrement différé (debounce). On évite ainsi un appel API à chaque
   * caractère tapé, tout en ne demandant jamais explicitement à l'utilisateur
   * de cliquer sur "Enregistrer".
   */
  function planifierSauvegarde(prochainBrouillon: NoteInput) {
    if (!noteSelectionneeId) return
    setStatutSauvegarde('en_cours')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const updated = await notesApi.update(noteSelectionneeId, prochainBrouillon)
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
        setStatutSauvegarde('synchronise')
      } catch (err) {
        setStatutSauvegarde('erreur')
        toast.error(messageErreur(err))
      }
    }, DELAI_AUTOSAVE_MS)
  }

  function handleChangeBrouillon(patch: Partial<NoteInput>) {
    const suivant = { ...brouillon, ...patch }
    setBrouillon(suivant)
    planifierSauvegarde(suivant)
  }

  async function handleNouvelleNote() {
    try {
      const note = await notesApi.create({ titre: 'Nouvelle note', contenu: '' })
      setNotes((prev) => [note, ...prev])
      setNoteSelectionneeId(note.id)
      setOnglet('edition')
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleDelete() {
    if (!aSupprimer) return
    try {
      await notesApi.delete(aSupprimer.id)
      toast.success('Note supprimée')
      const restantes = notes.filter((n) => n.id !== aSupprimer.id)
      setNotes(restantes)
      if (noteSelectionneeId === aSupprimer.id) {
        setNoteSelectionneeId(restantes[0]?.id ?? null)
      }
      setASupprimer(null)
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  /** Crée le projet à partir du brouillon actuel, puis relie la note à ce projet. */
  async function handleCreerProjetDepuisNote(input: ProjectInput) {
    if (!conversionEnCours) return
    try {
      const projet = await projectsApi.create(input)
      const noteMiseAJour = await notesApi.convertir(conversionEnCours.id, projet.id)
      setNotes((prev) => prev.map((n) => (n.id === noteMiseAJour.id ? noteMiseAJour : n)))
      setConversionEnCours(null)
      toast.success('Projet créé à partir de la note')
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  if (chargement) {
    return <p className="text-navy-400">Chargement...</p>
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4">
      {/* Liste des notes */}
      <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-navy-200/80 bg-white dark:border-navy-800 dark:bg-navy-900">
        <div className="flex items-center justify-between gap-2 border-b border-navy-100 p-3 dark:border-navy-800">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="h-8.5 w-full rounded-lg border border-navy-200 bg-navy-50 pl-8 pr-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/12 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
            />
          </div>
          <Button size="sm" onClick={handleNouvelleNote} aria-label="Nouvelle note">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {notesFiltrees.length === 0 ? (
            <p className="p-4 text-center text-sm text-navy-400">Aucune note.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {notesFiltrees.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      setNoteSelectionneeId(n.id)
                      setOnglet('edition')
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                      n.id === noteSelectionneeId
                        ? 'bg-cyan-50 dark:bg-cyan-500/10'
                        : 'hover:bg-navy-50 dark:hover:bg-navy-800/60'
                    }`}
                  >
                    <p className="truncate text-sm font-medium text-navy-800 dark:text-navy-100">{n.titre}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <p className="truncate text-xs text-navy-400">
                        {new Date(n.dateModification).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                      {n.projectId && (
                        <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          → Projet
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Éditeur */}
      <div className="flex flex-1 flex-col rounded-2xl border border-navy-200/80 bg-white dark:border-navy-800 dark:bg-navy-900">
        {!noteSelectionnee ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-navy-400">
            <FileText className="h-8 w-8" />
            <p className="text-sm">Sélectionne une note ou crée-en une nouvelle.</p>
            <Button size="sm" onClick={handleNouvelleNote} leftIcon={<Plus className="h-4 w-4" />}>
              Nouvelle note
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-navy-100 p-4 dark:border-navy-800">
              <input
                value={brouillon.titre}
                onChange={(e) => handleChangeBrouillon({ titre: e.target.value })}
                placeholder="Titre de la note"
                className="flex-1 border-none bg-transparent text-lg font-semibold text-navy-900 outline-none placeholder:text-navy-300 dark:text-white"
              />
              <span className="shrink-0 text-xs text-navy-400">
                {statutSauvegarde === 'en_cours' && 'Enregistrement...'}
                {statutSauvegarde === 'synchronise' && 'Enregistré'}
                {statutSauvegarde === 'erreur' && 'Erreur de sauvegarde'}
              </span>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Sparkles className="h-4 w-4" />}
                onClick={() => setConversionEnCours(noteSelectionnee)}
              >
                Convertir en projet
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setASupprimer(noteSelectionnee)} aria-label="Supprimer la note">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            {noteSelectionnee.projectId && (
              <div className="mx-4 mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                Cette note a été convertie en projet : {noteSelectionnee.projectTitre}
              </div>
            )}

            <div className="flex gap-1 px-4 pt-3">
              {(['edition', 'apercu'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setOnglet(o)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    onglet === o
                      ? 'bg-navy-900 text-white dark:bg-white dark:text-navy-900'
                      : 'text-navy-500 hover:bg-navy-100 dark:hover:bg-navy-800'
                  }`}
                >
                  {o === 'edition' ? 'Édition' : 'Aperçu'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {onglet === 'edition' ? (
                <textarea
                  value={brouillon.contenu}
                  onChange={(e) => handleChangeBrouillon({ contenu: e.target.value })}
                  placeholder="Écris librement en Markdown... (titres avec #, listes avec -, etc.)"
                  className="h-full w-full resize-none border-none bg-transparent font-mono text-sm leading-relaxed text-navy-800 outline-none placeholder:text-navy-300 dark:text-navy-100"
                />
              ) : (
                <MarkdownPreview contenu={brouillon.contenu} />
              )}
            </div>
          </>
        )}
      </div>

      {aSupprimer && (
        <ConfirmDialog
          title="Supprimer cette note ?"
          message={`La note "${aSupprimer.titre}" sera définitivement supprimée.`}
          onConfirm={handleDelete}
          onCancel={() => setASupprimer(null)}
        />
      )}

      {conversionEnCours && (
        <ProjectFormModal
          clients={clients}
          valeursInitiales={{
            titre: conversionEnCours.titre,
            description: conversionEnCours.contenu ?? '',
          }}
          onClose={() => setConversionEnCours(null)}
          onSubmit={handleCreerProjetDepuisNote}
        />
      )}
    </div>
  )
}
