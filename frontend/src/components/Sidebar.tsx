import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FolderKanban, Receipt, NotebookPen, LogOut, Zap, Activity, Calendar, Video } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ui/Avatar'

interface LienNav {
  to: string
  label: string
  icone: LucideIcon
  end?: boolean
}

interface Section {
  titre?: string
  liens: LienNav[]
}

const SECTIONS: Section[] = [
  {
    liens: [{ to: '/', label: 'Dashboard', icone: LayoutDashboard, end: true }],
  },
  {
    titre: 'Pilotage',
    liens: [
      { to: '/clients', label: 'Clients', icone: Users },
      { to: '/projets', label: 'Projets', icone: FolderKanban },
    ],
  },
  {
    titre: 'Facturation',
    liens: [{ to: '/factures', label: 'Devis & factures', icone: Receipt }],
  },
  {
    titre: 'Espace perso',
    liens: [{ to: '/notes', label: 'Notes', icone: NotebookPen }],
  },
  {
    titre: 'Collaboration',
    liens: [
      { to: '/calendar', label: 'Calendar', icone: Calendar },
      { to: '/video-rooms', label: 'Vidéoconférences', icone: Video },
    ],
  },
  {
    titre: 'Observabilité',
    liens: [{ to: '/activity-timeline', label: 'Activity Timeline', icone: Activity }],
  },
]

/**
 * Sidebar principale (espace admin), inspirée de Linear : logo, sections
 * espacées avec libellés discrets, état actif premium, bloc profil en pied.
 * `onNavigate` permet de refermer le tiroir mobile après un clic.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { session, deconnecter } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-navy-800/60 bg-navy-950 text-navy-300">
      {/* En-tête / logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-sm">
          <Zap className="h-5 w-5 text-white" fill="currentColor" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-white">FreelanceOS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {SECTIONS.map((section, i) => (
          <div key={i} className="space-y-1">
            {section.titre && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                {section.titre}
              </p>
            )}
            {section.liens.map((lien) => {
              const Icone = lien.icone
              return (
                <NavLink
                  key={lien.to}
                  to={lien.to}
                  end={lien.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-xs'
                        : 'text-navy-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icone
                        className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-cyan-400' : 'text-navy-400 group-hover:text-navy-200'}`}
                      />
                      {lien.label}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Profil + déconnexion */}
      <div className="border-t border-navy-800/60 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar nom={session?.email ?? 'Admin'} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{session?.email ?? 'Administrateur'}</p>
            <p className="truncate text-xs text-navy-400">Espace administrateur</p>
          </div>
          <button
            onClick={deconnecter}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
