import type { Project } from '../../types/project'
import { PrioriteBadge } from '../ui/PrioriteBadge'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="cursor-grab rounded-xl border border-navy-200/80 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-navy-700 dark:bg-navy-800">
      <p className="text-sm font-medium text-navy-800 dark:text-navy-100">{project.titre}</p>
      <p className="mt-0.5 text-xs text-navy-400">{project.clientNom}</p>
      <div className="mt-2 flex items-center justify-between">
        <PrioriteBadge priorite={project.priorite} />
        {project.montantEstime != null && (
          <span className="text-xs font-semibold text-navy-600 dark:text-navy-300">{project.montantEstime.toLocaleString('fr-FR')} €</span>
        )}
      </div>
      {project.dateFinPrevue && (
        <p className="mt-2 text-xs text-navy-400">
          Échéance : {new Date(project.dateFinPrevue).toLocaleDateString('fr-FR')}
        </p>
      )}
    </div>
  )
}
