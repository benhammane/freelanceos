import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { InputField, SelectField, TextareaField } from './ui/Field'
import type { Project, ProjectInput, StatutProjet } from '../types/project'
import { LABELS_STATUT_PROJET, STATUTS_PROJET } from '../types/project'
import { LABELS_PRIORITE, PRIORITES, type Priorite } from '../types/common'
import type { Client } from '../types/client'

function versEntree(project?: Project, initial?: Partial<ProjectInput>): ProjectInput {
  if (!project) {
    return {
      titre: '',
      description: '',
      url: '',
      statut: 'PROSPECT',
      priorite: 'MOYENNE',
      clientId: 0,
      technos: [],
      dateDebut: '',
      dateFinPrevue: '',
      montantEstime: '',
      position: 0,
      // Valeurs pré-remplies (ex : conversion d'une note en projet).
      ...initial,
    }
  }
  return {
    titre: project.titre,
    description: project.description ?? '',
    url: project.url ?? '',
    statut: project.statut,
    priorite: project.priorite,
    clientId: project.clientId,
    technos: project.technos,
    dateDebut: project.dateDebut ?? '',
    dateFinPrevue: project.dateFinPrevue ?? '',
    montantEstime: project.montantEstime ?? '',
    position: project.position,
  }
}

export function ProjectFormModal({
  project,
  clients,
  valeursInitiales,
  onClose,
  onSubmit,
}: {
  project?: Project
  clients: Client[]
  valeursInitiales?: Partial<ProjectInput>
  onClose: () => void
  onSubmit: (input: ProjectInput) => Promise<void>
}) {
  const [valeurs, setValeurs] = useState<ProjectInput>(versEntree(project, valeursInitiales))
  const [technosTexte, setTechnosTexte] = useState(project?.technos.join(', ') ?? '')
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [enCours, setEnCours] = useState(false)

  function valider(): boolean {
    const nouvellesErreurs: Record<string, string> = {}
    if (!valeurs.titre.trim()) nouvellesErreurs.titre = 'Le titre est obligatoire'
    if (!valeurs.clientId) nouvellesErreurs.clientId = 'Le client est obligatoire'
    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valider()) return
    setEnCours(true)
    try {
      const technos = technosTexte
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      await onSubmit({ ...valeurs, technos, montantEstime: valeurs.montantEstime === '' ? '' : Number(valeurs.montantEstime) })
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Modal title={project ? 'Modifier le projet' : 'Nouveau projet'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputField
          label="Titre"
          required
          value={valeurs.titre}
          error={erreurs.titre}
          onChange={(e) => setValeurs({ ...valeurs, titre: e.target.value })}
        />
        <TextareaField
          label="Description"
          value={valeurs.description}
          onChange={(e) => setValeurs({ ...valeurs, description: e.target.value })}
        />
        <InputField
          label="Lien du projet (URL)"
          type="url"
          placeholder="https://..."
          value={valeurs.url}
          onChange={(e) => setValeurs({ ...valeurs, url: e.target.value })}
        />
        <SelectField
          label="Client"
          required
          error={erreurs.clientId}
          value={valeurs.clientId || ''}
          onChange={(e) => setValeurs({ ...valeurs, clientId: Number(e.target.value) })}
        >
          <option value="">Sélectionner un client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </SelectField>
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Statut"
            value={valeurs.statut}
            onChange={(e) => setValeurs({ ...valeurs, statut: e.target.value as StatutProjet })}
          >
            {STATUTS_PROJET.map((s) => (
              <option key={s} value={s}>
                {LABELS_STATUT_PROJET[s]}
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
          label="Technos (séparées par des virgules)"
          value={technosTexte}
          onChange={(e) => setTechnosTexte(e.target.value)}
          placeholder="React, Spring Boot, PostgreSQL"
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Date de début"
            type="date"
            value={valeurs.dateDebut}
            onChange={(e) => setValeurs({ ...valeurs, dateDebut: e.target.value })}
          />
          <InputField
            label="Date de fin prévue"
            type="date"
            value={valeurs.dateFinPrevue}
            onChange={(e) => setValeurs({ ...valeurs, dateFinPrevue: e.target.value })}
          />
        </div>
        <InputField
          label="Montant estimé (€)"
          type="number"
          step="0.01"
          value={valeurs.montantEstime}
          onChange={(e) => setValeurs({ ...valeurs, montantEstime: e.target.value === '' ? '' : Number(e.target.value) })}
        />
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={enCours}>
            {enCours ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
