import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ExternalLink, ImagePlus, Trash2 } from 'lucide-react'
import { projectsApi } from '../api/projects'
import { tasksApi } from '../api/tasks'
import { messageErreur } from '../api/http'
import type { Project } from '../types/project'
import { LABELS_STATUT_PROJET } from '../types/project'
import type { StatutTache, Task, TaskInput } from '../types/task'
import { LABELS_STATUT_TACHE, STATUTS_TACHE } from '../types/task'
import { PrioriteBadge } from '../components/ui/PrioriteBadge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { AuthenticatedImage } from '../components/ui/AuthenticatedImage'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { TaskCard } from '../components/kanban/TaskCard'
import { TaskFormModal } from '../components/TaskFormModal'

const COLONNES = STATUTS_TACHE.map((statut) => ({ id: statut, label: LABELS_STATUT_TACHE[statut] }))

export default function ProjectDetail() {
  const { id } = useParams()
  const projectId = Number(id)

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [chargement, setChargement] = useState(true)
  const [tacheEnEdition, setTacheEnEdition] = useState<Task | 'nouvelle' | null>(null)
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function charger() {
    setChargement(true)
    try {
      const [projectData, tasksData] = await Promise.all([
        projectsApi.findById(projectId),
        tasksApi.findByProject(projectId),
      ])
      setProject(projectData)
      setTasks(tasksData)
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function handleMove(taskId: number, statut: StatutTache, position: number) {
    try {
      await tasksApi.move(taskId, statut, position)
    } catch (err) {
      toast.error(messageErreur(err))
      await charger()
    }
  }

  async function handleSubmitTache(input: TaskInput) {
    try {
      if (tacheEnEdition && tacheEnEdition !== 'nouvelle') {
        await tasksApi.update(tacheEnEdition.id, input)
        toast.success('Tâche modifiée')
      } else {
        await tasksApi.create(input)
        toast.success('Tâche créée')
      }
      setTacheEnEdition(null)
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleDeleteTache() {
    if (!tacheEnEdition || tacheEnEdition === 'nouvelle') return
    try {
      await tasksApi.delete(tacheEnEdition.id)
      toast.success('Tâche supprimée')
      setTacheEnEdition(null)
      await charger()
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  async function handleUploadScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadEnCours(true)
    try {
      const updated = await projectsApi.uploadScreenshot(projectId, file)
      setProject(updated)
      toast.success('Capture ajoutée')
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setUploadEnCours(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeleteScreenshot(screenshotId: number) {
    try {
      const updated = await projectsApi.deleteScreenshot(projectId, screenshotId)
      setProject(updated)
      toast.success('Capture supprimée')
    } catch (err) {
      toast.error(messageErreur(err))
    }
  }

  if (chargement) return <p className="text-navy-400">Chargement...</p>
  if (!project) return <p className="text-navy-400">Projet introuvable.</p>

  return (
    <div>
      <div className="mb-2">
        <Link to="/projets" className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-400">
          ← Retour à la liste
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">{project.titre}</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{project.clientNom}</p>
        </div>
        <div className="flex items-center gap-3">
          <PrioriteBadge priorite={project.priorite} />
          <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-600 dark:bg-navy-800 dark:text-navy-300">
            {LABELS_STATUT_PROJET[project.statut]}
          </span>
        </div>
      </div>

      {project.description && <p className="mb-6 max-w-2xl text-sm text-navy-600 dark:text-navy-300">{project.description}</p>}

      {project.technos.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {project.technos.map((techno) => (
            <span key={techno} className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
              {techno}
            </span>
          ))}
        </div>
      )}

      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm font-medium text-cyan-600 shadow-xs transition-colors hover:border-cyan-300 hover:bg-cyan-50 dark:border-navy-700 dark:bg-navy-800 dark:text-cyan-400 dark:hover:bg-navy-700"
        >
          <ExternalLink className="h-4 w-4" />
          Voir le projet en ligne
        </a>
      )}

      {/* Captures d'écran */}
      <Card className="mb-8 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-navy-800 dark:text-navy-100">Captures d'écran</h2>
            <p className="text-xs text-navy-400">Visibles par le client dans son portail</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadScreenshot}
          />
          <Button
            variant="secondary"
            size="sm"
            loading={uploadEnCours}
            leftIcon={<ImagePlus className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Ajouter
          </Button>
        </div>

        {project.screenshots.length === 0 ? (
          <p className="py-6 text-center text-sm text-navy-400">Aucune capture pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {project.screenshots.map((s) => (
              <div
                key={s.id}
                className="group relative aspect-video overflow-hidden rounded-xl border border-navy-200/80 dark:border-navy-700"
              >
                <AuthenticatedImage
                  src={projectsApi.screenshotPath(projectId, s.id)}
                  alt={s.filename}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => handleDeleteScreenshot(s.id)}
                  aria-label="Supprimer la capture"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-navy-950/60 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy-800 dark:text-navy-100">Sous-tâches</h2>
        <Button onClick={() => setTacheEnEdition('nouvelle')}>+ Nouvelle tâche</Button>
      </div>

      <KanbanBoard
        columns={COLONNES}
        items={tasks}
        getId={(t) => t.id}
        getStatut={(t) => t.statut}
        renderCard={(t) => <TaskCard task={t} onClick={() => setTacheEnEdition(t)} />}
        onMove={handleMove}
      />

      {tacheEnEdition && (
        <TaskFormModal
          task={tacheEnEdition === 'nouvelle' ? undefined : tacheEnEdition}
          projectId={projectId}
          position={tasks.length}
          onClose={() => setTacheEnEdition(null)}
          onSubmit={handleSubmitTache}
          onDelete={tacheEnEdition !== 'nouvelle' ? handleDeleteTache : undefined}
        />
      )}
    </div>
  )
}
