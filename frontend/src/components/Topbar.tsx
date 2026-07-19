import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, LogOut, Menu, NotebookPen, Plus, Receipt, Search, Users, FolderKanban, Activity, Calendar, Video } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { Avatar } from './ui/Avatar'
import { NotificationBell } from './NotificationBell'

interface Destination {
  label: string
  to: string
  icone: LucideIcon
}

// Destinations proposées par la recherche globale et le menu « Créer ».
const DESTINATIONS: Destination[] = [
  { label: 'Dashboard', to: '/', icone: LayoutDashboard },
  { label: 'Clients', to: '/clients', icone: Users },
  { label: 'Projets', to: '/projets', icone: FolderKanban },
  { label: 'Kanban des projets', to: '/projets/kanban', icone: FolderKanban },
  { label: 'Calendar', to: '/calendar', icone: Calendar },
  { label: 'Vidéoconférences', to: '/video-rooms', icone: Video },
  { label: 'Devis & factures', to: '/factures', icone: Receipt },
  { label: 'Notes', to: '/notes', icone: NotebookPen },
  { label: 'Activity Timeline', to: '/activity-timeline', icone: Activity },
]

const CREATIONS: Destination[] = [
  { label: 'Nouveau client', to: '/clients', icone: Users },
  { label: 'Nouveau projet', to: '/projets', icone: FolderKanban },
  { label: 'Nouveau devis / facture', to: '/factures', icone: Receipt },
  { label: 'Nouvelle note', to: '/notes', icone: NotebookPen },
]

type MenuOuvert = 'create' | 'notif' | 'avatar' | null

/**
 * Barre supérieure : titre de page dynamique, recherche globale (palette de
 * navigation), bouton de création rapide, notifications, thème et menu
 * utilisateur. `onOpenSidebar` ouvre le tiroir de navigation sur mobile.
 */
export function Topbar({ title, onOpenSidebar }: { title: string; onOpenSidebar: () => void }) {
  const navigate = useNavigate()
  const { session, deconnecter } = useAuth()
  const [menu, setMenu] = useState<MenuOuvert>(null)
  const [recherche, setRecherche] = useState('')
  const [rechercheActive, setRechercheActive] = useState(false)

  const resultats = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    if (!q) return DESTINATIONS
    return DESTINATIONS.filter((d) => d.label.toLowerCase().includes(q))
  }, [recherche])

  function allerVers(to: string) {
    navigate(to)
    setMenu(null)
    setRecherche('')
    setRechercheActive(false)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-navy-200 bg-white/80 px-4 backdrop-blur-md dark:border-navy-800 dark:bg-navy-900/80 sm:px-6">
      {/* Ouverture du menu sur mobile */}
      <button
        onClick={onOpenSidebar}
        aria-label="Ouvrir le menu"
        className="flex h-9.5 w-9.5 items-center justify-center rounded-xl text-navy-500 hover:bg-navy-100 dark:hover:bg-navy-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-lg font-semibold tracking-tight text-navy-800 dark:text-navy-100">{title}</h1>

      {/* Recherche globale */}
      <div className="relative ml-auto hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
        <input
          type="text"
          placeholder="Rechercher une page..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          onFocus={() => {
            setRechercheActive(true)
            setMenu(null)
          }}
          onBlur={() => setTimeout(() => setRechercheActive(false), 150)}
          className="h-9.5 w-64 rounded-xl border border-navy-200 bg-navy-50 pl-9 pr-3 text-sm text-navy-700 outline-none transition-all placeholder:text-navy-400 focus:w-72 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/12 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100 dark:focus:bg-navy-800"
        />
        {rechercheActive && (
          <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-xl border border-navy-200 bg-white p-1.5 shadow-lg dark:border-navy-800 dark:bg-navy-900">
            {resultats.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-navy-400">Aucune page</p>
            ) : (
              resultats.map((d) => (
                <button
                  key={d.to + d.label}
                  onMouseDown={() => allerVers(d.to)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-navy-700 hover:bg-navy-100 dark:text-navy-200 dark:hover:bg-navy-800"
                >
                  <d.icone className="h-4 w-4 text-navy-400" />
                  {d.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bouton Créer */}
      <div className="relative ml-auto md:ml-0">
        <button
          onClick={() => setMenu(menu === 'create' ? null : 'create')}
          className="inline-flex h-9.5 items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-cyan-600"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Créer</span>
          <ChevronDown className="hidden h-3.5 w-3.5 opacity-70 sm:inline" />
        </button>
        {menu === 'create' && (
          <Dropdown onClose={() => setMenu(null)}>
            {CREATIONS.map((c) => (
              <button
                key={c.label}
                onClick={() => allerVers(c.to)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-navy-700 hover:bg-navy-100 dark:text-navy-200 dark:hover:bg-navy-800"
              >
                <c.icone className="h-4 w-4 text-navy-400" />
                {c.label}
              </button>
            ))}
          </Dropdown>
        )}
      </div>

      {/* Notifications */}
      <NotificationBell />

      <ThemeToggle />

      {/* Menu utilisateur */}
      <div className="relative">
        <button
          onClick={() => setMenu(menu === 'avatar' ? null : 'avatar')}
          className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
        >
          <Avatar nom={session?.email ?? 'Admin'} size="sm" />
          <ChevronDown className="hidden h-3.5 w-3.5 text-navy-400 sm:inline" />
        </button>
        {menu === 'avatar' && (
          <Dropdown onClose={() => setMenu(null)}>
            <div className="border-b border-navy-100 px-3 py-2 dark:border-navy-800">
              <p className="truncate text-sm font-medium text-navy-800 dark:text-navy-100">{session?.email}</p>
              <p className="text-xs text-navy-400">Administrateur</p>
            </div>
            <button
              onClick={deconnecter}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </Dropdown>
        )}
      </div>
    </header>
  )
}

/**
 * Petit menu déroulant : un fond invisible plein écran capte le clic extérieur
 * pour se refermer, le panneau apparaît avec une légère animation d'entrée.
 */
function Dropdown({
  children,
  onClose,
  width = 'w-56',
}: {
  children: React.ReactNode
  onClose: () => void
  width?: string
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div
        className={`absolute right-0 top-12 z-20 ${width} rounded-xl border border-navy-200 bg-white p-1.5 shadow-lg dark:border-navy-800 dark:bg-navy-900`}
        style={{ animation: 'var(--animate-slide-up)' }}
      >
        {children}
      </div>
    </>
  )
}
