import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { projectsApi } from '../api/projects'
import { clientsApi } from '../api/clients'
import { messageErreur } from '../api/http'
import type { Project, ProjectInput, StatutProjet } from '../types/project'
import { LABELS_STATUT_PROJET, STATUTS_PROJET } from '../types/project'
import { LABELS_PRIORITE, PRIORITES, type Priorite } from '../types/common'
import type { Client } from '../types/client'
import { DataTable } from '../components/ui/DataTable'
import { Button } from '../components/ui/Button'
import { PrioriteBadge } from '../components/ui/PrioriteBadge'
import { ProjectFormModal } from '../components/ProjectFormModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export default function Projects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [chargement, setChargement] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState<StatutProjet | ''>('')
  const [filtrePriorite, setFiltrePriorite] = useState<Priorite | ''>('')
  const [projetEnEdition, setProjetEnEdition] = useState<Project | 'nouveau' | null>(null)
  const [projetASupprimer, setProjetASupprimer] = useState<Project | null>(null)

  async function charger() {
    setChargement(true)
    try {
      const [projectsData, clientsData] = await Promise.all([
        projectsApi.findAll({
          statut: filtreStatut || undefined,
          priorite: filtrePriorite || undefined,
        }),
        clientsApi.findAll(),
      ])
      setProjects(projectsData)
      setClients(clientsData)
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreStatut, filtrePriorite])

  async function handleSubmit(input: ProjectInput) {
    try {
      if (projetEnEdition && projetEnEdition !== 'nouveau') {
        await projectsApi.update(projetEnEdition.id, input)
        toast.success('Projet modifié')
      } else {
        await projectsApi.create(input)
        toast.success('Projet créé')
      }
      setProjetEnEdition(null)
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleDelete() {
    if (!projetASupprimer) return
    try {
      await projectsApi.delete(projetASupprimer.id)
      toast.success('Projet supprimé')
      setProjetASupprimer(null)
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">Projets</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/projets/kanban')}>
            Vue Kanban
          </Button>
          <Button onClick={() => setProjetEnEdition('nouveau')}>+ Nouveau projet</Button>
        </div>
      </div>

      <div className="mb-4 flex gap-3">
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value as StatutProjet | '')}
          className="h-9.5 cursor-pointer rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-700 shadow-xs outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/12 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
        >
          <option value="">Tous les statuts</option>
          {STATUTS_PROJET.map((s) => (
            <option key={s} value={s}>
              {LABELS_STATUT_PROJET[s]}
            </option>
          ))}
        </select>
        <select
          value={filtrePriorite}
          onChange={(e) => setFiltrePriorite(e.target.value as Priorite | '')}
          className="h-9.5 cursor-pointer rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-700 shadow-xs outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/12 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
        >
          <option value="">Toutes les priorités</option>
          {PRIORITES.map((p) => (
            <option key={p} value={p}>
              {LABELS_PRIORITE[p]}
            </option>
          ))}
        </select>
      </div>

      {chargement ? (
        <p className="text-navy-400">Chargement...</p>
      ) : (
        <DataTable
          data={projects}
          getRowKey={(p) => p.id}
          getSearchText={(p) => `${p.titre} ${p.clientNom}`}
          emptyMessage="Aucun projet pour le moment"
          onRowClick={(p) => navigate(`/projets/${p.id}`)}
          columns={[
            { key: 'titre', header: 'Titre', render: (p) => <span className="font-medium">{p.titre}</span>, sortValue: (p) => p.titre },
            { key: 'client', header: 'Client', render: (p) => p.clientNom, sortValue: (p) => p.clientNom },
            {
              key: 'statut',
              header: 'Statut',
              render: (p) => (
                <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-600 dark:bg-navy-800 dark:text-navy-300">
                  {LABELS_STATUT_PROJET[p.statut]}
                </span>
              ),
              sortValue: (p) => p.statut,
            },
            { key: 'priorite', header: 'Priorité', render: (p) => <PrioriteBadge priorite={p.priorite} />, sortValue: (p) => p.priorite },
            {
              key: 'montant',
              header: 'Montant estimé',
              render: (p) => (p.montantEstime != null ? `${p.montantEstime.toLocaleString('fr-FR')} €` : '—'),
              sortValue: (p) => p.montantEstime ?? 0,
            },
            { key: 'deadline', header: 'Deadline', render: (p) => (p.dateFinPrevue ? new Date(p.dateFinPrevue).toLocaleDateString('fr-FR') : '—') },
            {
              key: 'actions',
              header: '',
              render: (p) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" onClick={() => setProjetEnEdition(p)}>
                    Modifier
                  </Button>
                  <Button variant="ghost" className="text-red-600" onClick={() => setProjetASupprimer(p)}>
                    Supprimer
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      {projetEnEdition && (
        <ProjectFormModal
          project={projetEnEdition === 'nouveau' ? undefined : projetEnEdition}
          clients={clients}
          onClose={() => setProjetEnEdition(null)}
          onSubmit={handleSubmit}
        />
      )}

      {projetASupprimer && (
        <ConfirmDialog
          title="Supprimer ce projet ?"
          message={`Cette action est irréversible. Le projet "${projetASupprimer.titre}" sera définitivement supprimé.`}
          onConfirm={handleDelete}
          onCancel={() => setProjetASupprimer(null)}
        />
      )}
    </div>
  )
}
