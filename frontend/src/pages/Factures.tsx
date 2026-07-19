import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { invoicesApi } from '../api/invoices'
import { clientsApi } from '../api/clients'
import { projectsApi } from '../api/projects'
import { messageErreur } from '../api/http'
import type { Invoice, InvoiceInput, StatutInvoice } from '../types/invoice'
import { COULEUR_STATUT_INVOICE, LABELS_STATUT_INVOICE, LABELS_TYPE_INVOICE, STATUTS_INVOICE } from '../types/invoice'
import type { Client } from '../types/client'
import type { Project } from '../types/project'
import { DataTable } from '../components/ui/DataTable'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { InvoiceFormModal } from '../components/InvoiceFormModal'

export default function Factures() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [chargement, setChargement] = useState(true)
  const [enEdition, setEnEdition] = useState<Invoice | 'nouveau' | null>(null)
  const [aSupprimer, setASupprimer] = useState<Invoice | null>(null)

  async function charger() {
    setChargement(true)
    try {
      const [invoicesData, clientsData, projectsData] = await Promise.all([
        invoicesApi.findAll(),
        clientsApi.findAll(),
        projectsApi.findAll(),
      ])
      setInvoices(invoicesData)
      setClients(clientsData)
      setProjects(projectsData)
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    charger()
  }, [])

  async function handleSubmit(input: InvoiceInput) {
    try {
      if (enEdition && enEdition !== 'nouveau') {
        await invoicesApi.update(enEdition.id, input)
        toast.success('Document modifié')
      } else {
        await invoicesApi.create(input)
        toast.success('Document créé')
      }
      setEnEdition(null)
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleDelete() {
    if (!aSupprimer) return
    try {
      await invoicesApi.delete(aSupprimer.id)
      toast.success('Document supprimé')
      setASupprimer(null)
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleChangerStatut(invoice: Invoice, statut: StatutInvoice) {
    try {
      await invoicesApi.changerStatut(invoice.id, statut)
      toast.success('Statut mis à jour')
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleConvertir(invoice: Invoice) {
    try {
      await invoicesApi.convertirEnFacture(invoice.id)
      toast.success('Devis converti en facture')
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleTelecharger(invoice: Invoice) {
    try {
      await invoicesApi.telechargerPdf(invoice.id, invoice.numero)
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">Devis & Factures</h1>
        <Button onClick={() => setEnEdition('nouveau')}>+ Nouveau document</Button>
      </div>

      {chargement ? (
        <p className="text-navy-400">Chargement...</p>
      ) : (
        <DataTable
          data={invoices}
          getRowKey={(i) => i.id}
          getSearchText={(i) => `${i.numero} ${i.clientNom}`}
          emptyMessage="Aucun devis ou facture pour le moment"
          columns={[
            { key: 'numero', header: 'Numéro', render: (i) => <span className="font-medium">{i.numero}</span>, sortValue: (i) => i.numero },
            { key: 'type', header: 'Type', render: (i) => LABELS_TYPE_INVOICE[i.type], sortValue: (i) => i.type },
            { key: 'client', header: 'Client', render: (i) => i.clientNom, sortValue: (i) => i.clientNom },
            {
              key: 'montant',
              header: 'Montant TTC',
              render: (i) => `${i.montantTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`,
              sortValue: (i) => i.montantTTC,
            },
            {
              key: 'statut',
              header: 'Statut',
              render: (i) => (
                <select
                  value={i.statut}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleChangerStatut(i, e.target.value as StatutInvoice)}
                  className={`rounded-full border-none px-2.5 py-1 text-xs font-medium outline-none ${COULEUR_STATUT_INVOICE[i.statut]}`}
                >
                  {STATUTS_INVOICE.map((s) => (
                    <option key={s} value={s}>
                      {LABELS_STATUT_INVOICE[s]}
                    </option>
                  ))}
                </select>
              ),
              sortValue: (i) => i.statut,
            },
            {
              key: 'emission',
              header: 'Émission',
              render: (i) => new Date(i.dateEmission).toLocaleDateString('fr-FR'),
              sortValue: (i) => i.dateEmission,
            },
            {
              key: 'actions',
              header: '',
              render: (i) => (
                <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" onClick={() => handleTelecharger(i)}>
                    PDF
                  </Button>
                  {i.type === 'DEVIS' && (
                    <Button variant="ghost" onClick={() => handleConvertir(i)}>
                      → Facture
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setEnEdition(i)}>
                    Modifier
                  </Button>
                  <Button variant="ghost" className="text-red-600" onClick={() => setASupprimer(i)}>
                    Supprimer
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      {enEdition && (
        <InvoiceFormModal
          invoice={enEdition === 'nouveau' ? undefined : enEdition}
          clients={clients}
          projects={projects}
          onClose={() => setEnEdition(null)}
          onSubmit={handleSubmit}
        />
      )}

      {aSupprimer && (
        <ConfirmDialog
          title="Supprimer ce document ?"
          message={`Le document "${aSupprimer.numero}" sera définitivement supprimé.`}
          onConfirm={handleDelete}
          onCancel={() => setASupprimer(null)}
        />
      )}
    </div>
  )
}
