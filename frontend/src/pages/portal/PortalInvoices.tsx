import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { portalApi } from '../../api/portal'
import { messageErreur } from '../../api/http'
import type { Invoice } from '../../types/invoice'
import { COULEUR_STATUT_INVOICE, LABELS_STATUT_INVOICE, LABELS_TYPE_INVOICE } from '../../types/invoice'
import { Button } from '../../components/ui/Button'

export default function PortalInvoices() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [chargement, setChargement] = useState(true)

  // État de la modale d'acceptation d'un devis.
  const [devisAAccepter, setDevisAAccepter] = useState<Invoice | null>(null)
  const [signataireNom, setSignataireNom] = useState('')
  const [consentement, setConsentement] = useState(false)
  const [envoi, setEnvoi] = useState(false)

  function charger() {
    setChargement(true)
    portalApi
      .findMesInvoices()
      .then(setInvoices)
      .catch((err) => toast.error(messageErreur(err)))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  async function handleTelecharger(invoice: Invoice) {
    try {
      await portalApi.telechargerPdf(invoice.id, invoice.numero)
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  function ouvrirAcceptation(invoice: Invoice) {
    setDevisAAccepter(invoice)
    setSignataireNom('')
    setConsentement(false)
  }

  async function confirmerAcceptation() {
    if (!devisAAccepter || !signataireNom.trim() || !consentement) return
    setEnvoi(true)
    try {
      await portalApi.accepterDevis(devisAAccepter.id, signataireNom.trim())
      toast.success('Devis accepté. Merci !')
      setDevisAAccepter(null)
      charger()
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setEnvoi(false)
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
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-navy-800 dark:text-navy-100">
                      {i.numero}
                      {i.type === 'DEVIS' && i.statut === 'ACCEPTE' && i.signataireNom && (
                        <span className="mt-0.5 block text-xs font-normal text-violet-600 dark:text-violet-400">
                          ✓ Signé par {i.signataireNom}
                        </span>
                      )}
                    </td>
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
                      <div className="flex justify-end gap-2">
                        {i.type === 'DEVIS' && i.statut !== 'ACCEPTE' && (
                          <Button size="sm" onClick={() => ouvrirAcceptation(i)}>
                            ✍️ Accepter
                          </Button>
                        )}
                        {i.type === 'FACTURE' && i.statut !== 'PAYE' && (
                          <Button size="sm" onClick={() => navigate(`/portail/factures/${i.id}/paiement`)}>
                            💳 Payer
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleTelecharger(i)}>
                          Télécharger le PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modale d'acceptation (signature électronique simple) */}
      {devisAAccepter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-navy-200 bg-white p-6 shadow-xl dark:border-navy-800 dark:bg-navy-900">
            <h2 className="mb-1 text-xl font-semibold text-navy-800 dark:text-navy-100">
              Accepter le devis {devisAAccepter.numero}
            </h2>
            <p className="mb-5 text-sm text-navy-500 dark:text-navy-400">
              Montant : {devisAAccepter.montantTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € TTC
            </p>

            <label className="mb-1.5 block text-sm font-medium text-navy-700 dark:text-navy-200">
              Nom et prénom du signataire
            </label>
            <input
              value={signataireNom}
              onChange={(e) => setSignataireNom(e.target.value)}
              placeholder="Jean Dupont"
              className="mb-4 w-full rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm text-navy-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-navy-700 dark:bg-navy-950 dark:text-navy-100"
            />

            <label className="mb-5 flex cursor-pointer items-start gap-2.5 text-sm text-navy-600 dark:text-navy-300">
              <input
                type="checkbox"
                checked={consentement}
                onChange={(e) => setConsentement(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-cyan-600"
              />
              <span>
                J'accepte ce devis et je reconnais que cette acceptation vaut engagement. La date, l'heure et mon
                adresse IP seront enregistrées comme preuve.
              </span>
            </label>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDevisAAccepter(null)} disabled={envoi}>
                Annuler
              </Button>
              <Button onClick={confirmerAcceptation} disabled={envoi || !signataireNom.trim() || !consentement}>
                {envoi ? 'Validation…' : 'Accepter le devis'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
