import type { Task } from '../../types/task'
import { PrioriteBadge } from '../ui/PrioriteBadge'

export function TaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-grab rounded-xl border border-navy-200/80 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-navy-700 dark:bg-navy-800"
    >
      <p className="text-sm font-medium text-navy-800 dark:text-navy-100">{task.titre}</p>
      <div className="mt-2 flex items-center justify-between">
        <PrioriteBadge priorite={task.priorite} />
        {task.dateEcheance && (
          <span className="text-xs text-navy-400">{new Date(task.dateEcheance).toLocaleDateString('fr-FR')}</span>
        )}
      </div>
    </div>
  )
}
