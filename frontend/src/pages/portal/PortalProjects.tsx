import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { portalApi } from '../../api/portal'
import { messageErreur } from '../../api/http'
import type { Project } from '../../types/project'
import { ExternalLink } from 'lucide-react'
import { LABELS_STATUT_PROJET } from '../../types/project'
import { PrioriteBadge } from '../../components/ui/PrioriteBadge'
import { Card } from '../../components/ui/Card'
import { AuthenticatedImage } from '../../components/ui/AuthenticatedImage'

export default function PortalProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    portalApi
      .findMesProjects()
      .then(setProjects)
      .catch((err) => toast.error(messageErreur(err)))
      .finally(() => setChargement(false))
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">Mes projets</h1>

      {chargement ? (
        <p className="text-navy-400">Chargement...</p>
      ) : projects.length === 0 ? (
        <p className="text-navy-400">Aucun projet pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-navy-800 dark:text-navy-100">{p.titre}</h2>
                <span className="shrink-0 rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-600 dark:bg-navy-800 dark:text-navy-300">
                  {LABELS_STATUT_PROJET[p.statut]}
                </span>
              </div>
              {p.description && <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">{p.description}</p>}
              {p.technos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.technos.map((t) => (
                    <span key={t} className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-400"
                >
                  <ExternalLink className="h-4 w-4" />
                  Voir le projet en ligne
                </a>
              )}

              {p.screenshots.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {p.screenshots.map((s) => (
                    <div
                      key={s.id}
                      className="aspect-video overflow-hidden rounded-xl border border-navy-200/80 dark:border-navy-700"
                    >
                      <AuthenticatedImage
                        src={portalApi.screenshotPath(p.id, s.id)}
                        alt={s.filename}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-sm text-navy-500 dark:text-navy-400">
                <PrioriteBadge priorite={p.priorite} />
                {p.montantEstime != null && (
                  <span className="font-semibold text-navy-700 dark:text-navy-200">{p.montantEstime.toLocaleString('fr-FR')} €</span>
                )}
              </div>
              {(p.dateDebut || p.dateFinPrevue) && (
                <p className="mt-2 text-xs text-navy-400">
                  {p.dateDebut && `Début : ${new Date(p.dateDebut).toLocaleDateString('fr-FR')}`}
                  {p.dateDebut && p.dateFinPrevue && ' — '}
                  {p.dateFinPrevue && `Fin prévue : ${new Date(p.dateFinPrevue).toLocaleDateString('fr-FR')}`}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
