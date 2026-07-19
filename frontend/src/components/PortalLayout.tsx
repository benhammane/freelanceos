import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FolderKanban, LogOut, Menu, Receipt, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ui/Avatar'
import { ThemeToggle } from './ThemeToggle'

const LIENS: { to: string; label: string; icone: LucideIcon; end?: boolean }[] = [
  { to: '/portail', label: 'Mes projets', icone: FolderKanban, end: true },
  { to: '/portail/factures', label: 'Mes devis & factures', icone: Receipt },
]

function PortalSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { session, deconnecter } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-navy-800/60 bg-navy-950 text-navy-300">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-sm">
          <Zap className="h-5 w-5 text-white" fill="currentColor" />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-tight tracking-tight text-white">FreelanceOS</p>
          <p className="truncate text-xs text-navy-400">{session?.clientNom ?? 'Espace client'}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-navy-500">Mon espace</p>
        {LIENS.map((lien) => {
          const Icone = lien.icone
          return (
            <NavLink
              key={lien.to}
              to={lien.to}
              end={lien.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive ? 'bg-white/10 text-white shadow-xs' : 'text-navy-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icone className={`h-4.5 w-4.5 ${isActive ? 'text-cyan-400' : 'text-navy-400 group-hover:text-navy-200'}`} />
                  {lien.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-navy-800/60 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar nom={session?.clientNom ?? session?.email ?? 'Client'} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{session?.clientNom ?? 'Client'}</p>
            <p className="truncate text-xs text-navy-400">Accès client</p>
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

/** Châssis du portail client : même langage visuel que l'espace admin, en plus épuré. */
export function PortalLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [tiroirOuvert, setTiroirOuvert] = useState(false)
  const titre = location.pathname.startsWith('/portail/factures') ? 'Mes devis & factures' : 'Mes projets'

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--app-bg)]">
      <div className="hidden lg:block">
        <PortalSidebar />
      </div>

      <AnimatePresence>
        {tiroirOuvert && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTiroirOuvert(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <PortalSidebar onNavigate={() => setTiroirOuvert(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-navy-200 bg-white/80 px-4 backdrop-blur-md dark:border-navy-800 dark:bg-navy-900/80 sm:px-6">
          <button
            onClick={() => setTiroirOuvert(true)}
            aria-label="Ouvrir le menu"
            className="flex h-9.5 w-9.5 items-center justify-center rounded-xl text-navy-500 hover:bg-navy-100 dark:hover:bg-navy-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight text-navy-800 dark:text-navy-100">{titre}</h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
