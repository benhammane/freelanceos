import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { InputField, SelectField } from './ui/Field'
import type { Invoice, InvoiceInput, InvoiceLine, TypeInvoice } from '../types/invoice'
import { LABELS_STATUT_INVOICE, LABELS_TYPE_INVOICE, STATUTS_INVOICE } from '../types/invoice'
import type { Client } from '../types/client'
import type { Project } from '../types/project'

const LIGNE_VIDE: InvoiceLine = { description: '', quantite: 1, prixUnitaire: 0 }

function versEntree(invoice?: Invoice): InvoiceInput {
  if (!invoice) {
    return {
      type: 'DEVIS',
      clientId: 0,
      projectId: '',
      lignes: [{ ...LIGNE_VIDE }],
      tauxTVA: 20,
      statut: 'BROUILLON',
      dateEmission: new Date().toISOString().slice(0, 10),
      dateEcheance: '',
    }
  }
  return {
    type: invoice.type,
    clientId: invoice.clientId,
    projectId: invoice.projectId ?? '',
    lignes: invoice.lignes,
    tauxTVA: invoice.tauxTVA,
    statut: invoice.statut,
    dateEmission: invoice.dateEmission,
    dateEcheance: invoice.dateEcheance ?? '',
  }
}

export function InvoiceFormModal({
  invoice,
  clients,
  projects,
  onClose,
  onSubmit,
}: {
  invoice?: Invoice
  clients: Client[]
  projects: Project[]
  onClose: () => void
  onSubmit: (input: InvoiceInput) => Promise<void>
}) {
  const [valeurs, setValeurs] = useState<InvoiceInput>(versEntree(invoice))
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [enCours, setEnCours] = useState(false)

  const { montantHT, montantTTC } = useMemo(() => {
    const ht = valeurs.lignes.reduce((total, l) => total + l.quantite * l.prixUnitaire, 0)
    const ttc = ht * (1 + valeurs.tauxTVA / 100)
    return { montantHT: ht, montantTTC: ttc }
  }, [valeurs.lignes, valeurs.tauxTVA])

  function majLigne(index: number, patch: Partial<InvoiceLine>) {
    setValeurs((v) => ({
      ...v,
      lignes: v.lignes.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }))
  }

  function ajouterLigne() {
    setValeurs((v) => ({ ...v, lignes: [...v.lignes, { ...LIGNE_VIDE }] }))
  }

  function supprimerLigne(index: number) {
    setValeurs((v) => ({ ...v, lignes: v.lignes.filter((_, i) => i !== index) }))
  }

  function valider(): boolean {
    const nouvellesErreurs: Record<string, string> = {}
    if (!valeurs.clientId) nouvellesErreurs.clientId = 'Le client est obligatoire'
    if (valeurs.lignes.length === 0) nouvellesErreurs.lignes = 'Au moins une ligne est requise'
    else if (valeurs.lignes.some((l) => !l.description.trim())) nouvellesErreurs.lignes = 'Chaque ligne doit avoir une description'
    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valider()) return
    setEnCours(true)
    try {
      await onSubmit({
        ...valeurs,
        projectId: valeurs.projectId === '' ? '' : Number(valeurs.projectId),
      })
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Modal title={invoice ? `Modifier ${invoice.numero}` : 'Nouveau devis/facture'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Type"
            value={valeurs.type}
            onChange={(e) => setValeurs({ ...valeurs, type: e.target.value as TypeInvoice })}
          >
            <option value="DEVIS">{LABELS_TYPE_INVOICE.DEVIS}</option>
            <option value="FACTURE">{LABELS_TYPE_INVOICE.FACTURE}</option>
          </SelectField>
          <SelectField
            label="Statut"
            value={valeurs.statut}
            onChange={(e) => setValeurs({ ...valeurs, statut: e.target.value as InvoiceInput['statut'] })}
          >
            {STATUTS_INVOICE.map((s) => (
              <option key={s} value={s}>
                {LABELS_STATUT_INVOICE[s]}
              </option>
            ))}
          </SelectField>
        </div>

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

        <SelectField
          label="Projet (optionnel)"
          value={valeurs.projectId}
          onChange={(e) => setValeurs({ ...valeurs, projectId: e.target.value === '' ? '' : Number(e.target.value) })}
        >
          <option value="">Aucun projet</option>
          {projects
            .filter((p) => !valeurs.clientId || p.clientId === valeurs.clientId)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.titre}
              </option>
            ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Date d'émission"
            type="date"
            value={valeurs.dateEmission}
            onChange={(e) => setValeurs({ ...valeurs, dateEmission: e.target.value })}
          />
          <InputField
            label="Date d'échéance"
            type="date"
            value={valeurs.dateEcheance}
            onChange={(e) => setValeurs({ ...valeurs, dateEcheance: e.target.value })}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-navy-700 dark:text-navy-200">Lignes</span>
            <button type="button" onClick={ajouterLigne} className="text-xs font-medium text-cyan-600 hover:underline dark:text-cyan-400">
              + Ajouter une ligne
            </button>
          </div>
          {erreurs.lignes && <p className="mb-2 text-xs text-red-600">{erreurs.lignes}</p>}
          <div className="flex flex-col gap-2">
            {valeurs.lignes.map((ligne, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={ligne.description}
                  onChange={(e) => majLigne(index, { description: e.target.value })}
                  className="flex-1 rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-sm text-navy-800 outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Qté"
                  value={ligne.quantite}
                  onChange={(e) => majLigne(index, { quantite: Number(e.target.value) })}
                  className="w-16 rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-sm text-navy-800 outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Prix"
                  value={ligne.prixUnitaire}
                  onChange={(e) => majLigne(index, { prixUnitaire: Number(e.target.value) })}
                  className="w-24 rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-sm text-navy-800 outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
                />
                <button
                  type="button"
                  onClick={() => supprimerLigne(index)}
                  disabled={valeurs.lignes.length === 1}
                  className="text-navy-400 hover:text-red-600 disabled:opacity-30"
                  aria-label="Supprimer la ligne"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <InputField
          label="Taux de TVA (%)"
          type="number"
          step="0.1"
          value={valeurs.tauxTVA}
          onChange={(e) => setValeurs({ ...valeurs, tauxTVA: Number(e.target.value) })}
        />

        <div className="rounded-xl border border-navy-200/70 bg-navy-50 p-3.5 text-sm dark:border-navy-800 dark:bg-navy-800/50">
          <div className="flex justify-between text-navy-600 dark:text-navy-300">
            <span>Total HT</span>
            <span>{montantHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="mt-1.5 flex justify-between text-base font-semibold text-navy-800 dark:text-navy-100">
            <span>Total TTC</span>
            <span>{montantTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>

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
