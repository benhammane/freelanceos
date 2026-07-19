import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { portalApi } from '../../api/portal'
import { messageErreur } from '../../api/http'
import type { Invoice } from '../../types/invoice'
import { COULEUR_STATUT_INVOICE, LABELS_STATUT_INVOICE, LABELS_TYPE_INVOICE } from '../../types/invoice'
import { Button } from '../../components/ui/Button'

export default function PortalInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    portalApi
      .findMesInvoices()
      .then(setInvoices)
      .catch((err) => toast.error(messageErreur(err)))
      .finally(() => setChargement(false))
  }, [])

  async function handleTelecharger(invoice: Invoice) {
    try {
      await portalApi.telechargerPdf(invoice.id, invoice.numero)
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">Mes devis & factures</h1>

      {chargement ? (
        <p className="text-navy-400">Chargement...</p>
      ) : invoices.length === 0 ? (
        <p className="text-navy-400">Aucun document pour le moment.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-navy-200/80 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500 dark:border-navy-800 dark:text-navy-400">
                  <th className="px-4 py-3 font-semibold">Numéro</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Montant TTC</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Émission</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800/70">
                {invoices.map((i) => (
                  <tr key={i.id} className="transition-colors hover:bg-navy-50 dark:hover:bg-navy-800/50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-navy-800 dark:text-navy-100">{i.numero}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-navy-600 dark:text-navy-300">{LABELS_TYPE_INVOICE[i.type]}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-navy-700 dark:text-navy-200">
                      {i.montantTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${COULEUR_STATUT_INVOICE[i.statut]}`}>
                        {LABELS_STATUT_INVOICE[i.statut]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-navy-600 dark:text-navy-300">{new Date(i.dateEmission).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => handleTelecharger(i)}>
                        Télécharger le PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
