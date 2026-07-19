import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { InputField, TextareaField } from './ui/Field'
import type { Client, ClientInput } from '../types/client'

const VIDE: ClientInput = { nom: '', email: '', entreprise: '', telephone: '', adresse: '', notes: '' }

export function ClientFormModal({
  client,
  onClose,
  onSubmit,
}: {
  client?: Client
  onClose: () => void
  onSubmit: (input: ClientInput) => Promise<void>
}) {
  const [valeurs, setValeurs] = useState<ClientInput>(
    client
      ? {
          nom: client.nom,
          email: client.email,
          entreprise: client.entreprise ?? '',
          telephone: client.telephone ?? '',
          adresse: client.adresse ?? '',
          notes: client.notes ?? '',
        }
      : VIDE,
  )
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [enCours, setEnCours] = useState(false)

  function valider(): boolean {
    const nouvellesErreurs: Record<string, string> = {}
    if (!valeurs.nom.trim()) nouvellesErreurs.nom = 'Le nom est obligatoire'
    if (!valeurs.email.trim()) nouvellesErreurs.email = "L'email est obligatoire"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeurs.email)) nouvellesErreurs.email = "L'email doit être valide"
    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valider()) return
    setEnCours(true)
    try {
      await onSubmit(valeurs)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Modal title={client ? 'Modifier le client' : 'Nouveau client'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputField
          label="Nom"
          required
          value={valeurs.nom}
          error={erreurs.nom}
          onChange={(e) => setValeurs({ ...valeurs, nom: e.target.value })}
        />
        <InputField
          label="Email"
          type="email"
          required
          value={valeurs.email}
          error={erreurs.email}
          onChange={(e) => setValeurs({ ...valeurs, email: e.target.value })}
        />
        <InputField
          label="Entreprise"
          value={valeurs.entreprise}
          onChange={(e) => setValeurs({ ...valeurs, entreprise: e.target.value })}
        />
        <InputField
          label="Téléphone"
          value={valeurs.telephone}
          onChange={(e) => setValeurs({ ...valeurs, telephone: e.target.value })}
        />
        <InputField
          label="Adresse"
          value={valeurs.adresse}
          onChange={(e) => setValeurs({ ...valeurs, adresse: e.target.value })}
        />
        <TextareaField
          label="Notes"
          value={valeurs.notes}
          onChange={(e) => setValeurs({ ...valeurs, notes: e.target.value })}
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
