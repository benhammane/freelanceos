import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { InputField, SelectField, TextareaField } from './ui/Field'
import type { Task, TaskInput } from '../types/task'
import { LABELS_STATUT_TACHE, STATUTS_TACHE } from '../types/task'
import { LABELS_PRIORITE, PRIORITES, type Priorite } from '../types/common'

export function TaskFormModal({
  task,
  projectId,
  position,
  onClose,
  onSubmit,
  onDelete,
}: {
  task?: Task
  projectId: number
  position: number
  onClose: () => void
  onSubmit: (input: TaskInput) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [valeurs, setValeurs] = useState<TaskInput>(
    task
      ? {
          titre: task.titre,
          description: task.description ?? '',
          statut: task.statut,
          priorite: task.priorite,
          projectId: task.projectId,
          position: task.position,
          dateEcheance: task.dateEcheance ?? '',
        }
      : {
          titre: '',
          description: '',
          statut: 'A_FAIRE',
          priorite: 'MOYENNE',
          projectId,
          position,
          dateEcheance: '',
        },
  )
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valeurs.titre.trim()) {
      setErreur('Le titre est obligatoire')
      return
    }
    setEnCours(true)
    try {
      await onSubmit(valeurs)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Modal title={task ? 'Modifier la tâche' : 'Nouvelle tâche'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputField
          label="Titre"
          required
          value={valeurs.titre}
          error={erreur}
          onChange={(e) => setValeurs({ ...valeurs, titre: e.target.value })}
        />
        <TextareaField
          label="Description"
          value={valeurs.description}
          onChange={(e) => setValeurs({ ...valeurs, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Statut"
            value={valeurs.statut}
            onChange={(e) => setValeurs({ ...valeurs, statut: e.target.value as TaskInput['statut'] })}
          >
            {STATUTS_TACHE.map((s) => (
              <option key={s} value={s}>
                {LABELS_STATUT_TACHE[s]}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Priorité"
            value={valeurs.priorite}
            onChange={(e) => setValeurs({ ...valeurs, priorite: e.target.value as Priorite })}
          >
            {PRIORITES.map((p) => (
              <option key={p} value={p}>
                {LABELS_PRIORITE[p]}
              </option>
            ))}
          </SelectField>
        </div>
        <InputField
          label="Date d'échéance"
          type="date"
          value={valeurs.dateEcheance}
          onChange={(e) => setValeurs({ ...valeurs, dateEcheance: e.target.value })}
        />
        <div className="mt-2 flex items-center justify-between">
          {task && onDelete ? (
            <Button type="button" variant="ghost" className="text-red-600" onClick={onDelete}>
              Supprimer
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={enCours}>
              {enCours ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
