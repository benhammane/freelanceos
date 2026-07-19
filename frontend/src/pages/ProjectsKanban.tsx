import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { projectsApi } from '../api/projects'
import { messageErreur } from '../api/http'
import type { Project, StatutProjet } from '../types/project'
import { LABELS_STATUT_PROJET, STATUTS_PROJET } from '../types/project'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { ProjectCard } from '../components/kanban/ProjectCard'

const COLONNES = STATUTS_PROJET.map((statut) => ({ id: statut, label: LABELS_STATUT_PROJET[statut] }))

export default function ProjectsKanban() {
  const [projects, setProjects] = useState<Project[]>([])
  const [chargement, setChargement] = useState(true)

  async function charger() {
    setChargement(true)
    try {
      setProjects(await projectsApi.findAll())
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    charger()
  }, [])

  async function handleMove(id: number, statut: StatutProjet, position: number) {
    try {
      await projectsApi.move(id, statut, position)
    } catch (err) {
      toast.error(messageErreur(err))
      await charger()
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">Kanban Projets</h1>
        <Link to="/projets" className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-400">
          ← Retour à la liste
        </Link>
      </div>

      {chargement ? (
        <p className="text-navy-400">Chargement...</p>
      ) : (
        <KanbanBoard
          columns={COLONNES}
          items={projects}
          getId={(p) => p.id}
          getStatut={(p) => p.statut}
          renderCard={(p) => <ProjectCard project={p} />}
          onMove={handleMove}
        />
      )}
    </div>
  )
}
