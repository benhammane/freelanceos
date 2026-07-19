import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { clientsApi } from '../api/clients'
import { messageErreur } from '../api/http'
import type { Client, ClientAccess, ClientInput } from '../types/client'
import { DataTable } from '../components/ui/DataTable'
import { Button } from '../components/ui/Button'
import { ClientFormModal } from '../components/ClientFormModal'
import { ClientAccessModal } from '../components/ClientAccessModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [chargement, setChargement] = useState(true)
  const [clientEnEdition, setClientEnEdition] = useState<Client | 'nouveau' | null>(null)
  const [clientASupprimer, setClientASupprimer] = useState<Client | null>(null)
  const [accesGenere, setAccesGenere] = useState<ClientAccess | null>(null)

  async function charger() {
    setChargement(true)
    try {
      setClients(await clientsApi.findAll())
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    charger()
  }, [])

  async function handleSubmit(input: ClientInput) {
    try {
      if (clientEnEdition && clientEnEdition !== 'nouveau') {
        await clientsApi.update(clientEnEdition.id, input)
        toast.success('Client modifié')
      } else {
        await clientsApi.create(input)
        toast.success('Client créé')
      }
      setClientEnEdition(null)
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleDelete() {
    if (!clientASupprimer) return
    try {
      await clientsApi.delete(clientASupprimer.id)
      toast.success('Client supprimé')
      setClientASupprimer(null)
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleGenererAcces(client: Client) {
    try {
      const acces = await clientsApi.genererAcces(client.id)
      setAccesGenere(acces)
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">Clients</h1>
        <Button onClick={() => setClientEnEdition('nouveau')}>+ Nouveau client</Button>
      </div>

      {chargement ? (
        <p className="text-navy-400">Chargement...</p>
      ) : (
        <DataTable
          data={clients}
          getRowKey={(c) => c.id}
          getSearchText={(c) => `${c.nom} ${c.email} ${c.entreprise ?? ''}`}
          emptyMessage="Aucun client pour le moment"
          columns={[
            { key: 'nom', header: 'Nom', render: (c) => <span className="font-medium">{c.nom}</span>, sortValue: (c) => c.nom },
            { key: 'entreprise', header: 'Entreprise', render: (c) => c.entreprise || '—', sortValue: (c) => c.entreprise ?? '' },
            { key: 'email', header: 'Email', render: (c) => c.email, sortValue: (c) => c.email },
            { key: 'telephone', header: 'Téléphone', render: (c) => c.telephone || '—' },
            {
              key: 'actions',
              header: '',
              render: (c) => (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => handleGenererAcces(c)}>
                    Générer un accès
                  </Button>
                  <Button variant="ghost" onClick={() => setClientEnEdition(c)}>
                    Modifier
                  </Button>
                  <Button variant="ghost" className="text-red-600" onClick={() => setClientASupprimer(c)}>
                    Supprimer
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      {clientEnEdition && (
        <ClientFormModal
          client={clientEnEdition === 'nouveau' ? undefined : clientEnEdition}
          onClose={() => setClientEnEdition(null)}
          onSubmit={handleSubmit}
        />
      )}

      {clientASupprimer && (
        <ConfirmDialog
          title="Supprimer ce client ?"
          message={`Cette action est irréversible. Le client "${clientASupprimer.nom}" sera définitivement supprimé.`}
          onConfirm={handleDelete}
          onCancel={() => setClientASupprimer(null)}
        />
      )}

      {accesGenere && <ClientAccessModal access={accesGenere} onClose={() => setAccesGenere(null)} />}
    </div>
  )
}
