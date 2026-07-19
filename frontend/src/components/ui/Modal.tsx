import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'

/*
 * Modale premium : fond flouté (backdrop-blur), apparition animée (fade +
 * léger zoom via Framer Motion), fermeture au clic extérieur ou touche Échap.
 * L'API (title / onClose / children) est inchangée pour rester compatible avec
 * tous les appels existants.
 */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  // Fermeture au clavier (Échap) + blocage du défilement de l'arrière-plan.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <motion.div
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-navy-200/60 bg-white p-6 shadow-lg dark:border-navy-800 dark:bg-navy-900"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-navy-800 dark:text-navy-100">{title}</h2>
            <IconButton label="Fermer" onClick={onClose}>
              <X className="h-4.5 w-4.5" />
            </IconButton>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
