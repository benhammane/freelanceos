import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import type { ClientAccess } from '../types/client'

/**
 * Affiche le mot de passe généré UNE SEULE FOIS : une fois cette fenêtre
 * fermée, il n'est plus jamais récupérable (seul son hash reste en base
 * côté backend). Le message insiste là-dessus pour éviter que l'admin ne la
 * ferme par réflexe avant de l'avoir noté.
 */
export function ClientAccessModal({ access, onClose }: { access: ClientAccess; onClose: () => void }) {
  return (
    <Modal title="Accès portail généré" onClose={onClose}>
      <p className="mb-4 text-sm text-navy-600 dark:text-navy-300">
        Communique ces identifiants au client par le moyen de ton choix. Le mot de passe ne sera plus jamais
        affiché après la fermeture de cette fenêtre.
      </p>
      <div className="flex flex-col gap-3 rounded-xl border border-navy-200/70 bg-navy-50 p-4 text-sm dark:border-navy-800 dark:bg-navy-800/50">
        <div>
          <span className="font-medium text-navy-700 dark:text-navy-300">Email : </span>
          <span className="font-mono text-navy-800 dark:text-navy-100">{access.email}</span>
        </div>
        <div>
          <span className="font-medium text-navy-700 dark:text-navy-300">Mot de passe : </span>
          <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">{access.motDePasseGenere}</span>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>J'ai noté le mot de passe</Button>
      </div>
    </Modal>
  )
}
