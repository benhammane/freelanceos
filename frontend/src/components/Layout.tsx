import { useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/** Déduit le titre affiché dans la topbar à partir de la route courante. */
function titrePour(pathname: string): string {
  if (pathname === '/') return 'Dashboard'
  if (pathname.startsWith('/clients')) return 'Clients'
  if (pathname === '/projets/kanban') return 'Kanban des projets'
  if (pathname.startsWith('/projets/')) return 'Détail du projet'
  if (pathname.startsWith('/projets')) return 'Projets'
  if (pathname.startsWith('/factures')) return 'Devis & factures'
  if (pathname.startsWith('/notes')) return 'Notes'
  if (pathname.startsWith('/activity-timeline')) return 'Activity Timeline'
  return 'FreelanceOS'
}

/**
 * Châssis de l'espace admin : sidebar fixe sur grand écran, tiroir animé sur
 * mobile, topbar collante, et zone de contenu centrée. Le contenu apparaît en
 * fondu à chaque changement de page.
 */
export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [tiroirOuvert, setTiroirOuvert] = useState(false)
  const titre = titrePour(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--app-bg)]">
      {/* Sidebar fixe (grand écran) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Tiroir mobile */}
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
              <Sidebar onNavigate={() => setTiroirOuvert(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Colonne principale */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={titre} onOpenSidebar={() => setTiroirOuvert(true)} />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
